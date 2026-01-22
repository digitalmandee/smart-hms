import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ========================
// TYPES
// ========================

export interface MedicalFitnessRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  examination_date: string;
  examination_type: 'pre_employment' | 'annual' | 'return_to_work' | 'special';
  examiner_name: string | null;
  examiner_facility: string | null;
  fitness_status: 'fit' | 'fit_with_restrictions' | 'temporarily_unfit' | 'permanently_unfit';
  restrictions: string | null;
  conditions_noted: string | null;
  recommendations: string | null;
  next_examination_date: string | null;
  report_url: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_number: string;
  };
}

export interface VaccinationRecord {
  id: string;
  organization_id: string;
  employee_id: string;
  vaccine_name: string;
  vaccine_type: string | null;
  dose_number: number;
  administered_date: string;
  administered_by: string | null;
  administered_at: string | null;
  batch_number: string | null;
  next_due_date: string | null;
  certificate_url: string | null;
  notes: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_number: string;
  };
}

export interface DisciplinaryAction {
  id: string;
  organization_id: string;
  employee_id: string;
  action_type: 'verbal_warning' | 'written_warning' | 'final_warning' | 'suspension' | 'demotion' | 'termination';
  incident_date: string;
  incident_description: string;
  policy_violated: string | null;
  investigation_details: string | null;
  action_taken: string;
  suspension_days: number | null;
  issued_date: string;
  issued_by: string;
  witness_ids: string[] | null;
  employee_response: string | null;
  employee_acknowledged: boolean;
  acknowledged_at: string | null;
  appeal_submitted: boolean;
  appeal_details: string | null;
  appeal_outcome: string | null;
  document_url: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_number: string;
  };
}

export interface IncidentReport {
  id: string;
  organization_id: string;
  branch_id: string | null;
  incident_number: string | null;
  reported_by: string;
  incident_date: string;
  incident_time: string | null;
  location: string;
  incident_type: string | null;
  description: string;
  involved_employee_ids: string[] | null;
  involved_patient_ids: string[] | null;
  witness_ids: string[] | null;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  immediate_action_taken: string | null;
  investigation_status: 'reported' | 'under_investigation' | 'investigation_complete' | 'closed';
  investigator_id: string | null;
  investigation_findings: string | null;
  root_cause: string | null;
  corrective_actions: string | null;
  preventive_measures: string | null;
  resolution: string | null;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  reporter?: {
    full_name: string;
  };
}

// ========================
// MEDICAL FITNESS HOOKS
// ========================

export function useMedicalFitnessRecords(employeeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["medical-fitness-records", profile?.organization_id, employeeId],
    queryFn: async () => {
      let query = supabase
        .from("medical_fitness_records")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("examination_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpcomingMedicalExaminations(daysAhead: number = 30) {
  const { profile } = useAuth();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return useQuery({
    queryKey: ["upcoming-medical-exams", profile?.organization_id, daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medical_fitness_records")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .not("next_examination_date", "is", null)
        .lte("next_examination_date", futureDate.toISOString().split('T')[0])
        .gte("next_examination_date", new Date().toISOString().split('T')[0])
        .order("next_examination_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateMedicalFitnessRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<MedicalFitnessRecord>) => {
      const { error } = await supabase
        .from("medical_fitness_records")
        .insert({
          employee_id: record.employee_id!,
          examination_date: record.examination_date!,
          examination_type: record.examination_type,
          examiner_name: record.examiner_name,
          examiner_facility: record.examiner_facility,
          fitness_status: record.fitness_status!,
          restrictions: record.restrictions,
          conditions_noted: record.conditions_noted,
          recommendations: record.recommendations,
          next_examination_date: record.next_examination_date,
          report_url: record.report_url,
          organization_id: profile!.organization_id!,
          created_by: profile!.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-fitness-records"] });
      toast({ title: "Success", description: "Medical fitness record created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// VACCINATION HOOKS
// ========================

export function useVaccinationRecords(employeeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["vaccination-records", profile?.organization_id, employeeId],
    queryFn: async () => {
      let query = supabase
        .from("vaccination_records")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("administered_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useUpcomingVaccinations(daysAhead: number = 30) {
  const { profile } = useAuth();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return useQuery({
    queryKey: ["upcoming-vaccinations", profile?.organization_id, daysAhead],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vaccination_records")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .not("next_due_date", "is", null)
        .lte("next_due_date", futureDate.toISOString().split('T')[0])
        .gte("next_due_date", new Date().toISOString().split('T')[0])
        .order("next_due_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateVaccinationRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<VaccinationRecord>) => {
      const { error } = await supabase
        .from("vaccination_records")
        .insert({
          employee_id: record.employee_id!,
          vaccine_name: record.vaccine_name!,
          vaccine_type: record.vaccine_type,
          dose_number: record.dose_number,
          administered_date: record.administered_date!,
          administered_by: record.administered_by,
          administered_at: record.administered_at,
          batch_number: record.batch_number,
          next_due_date: record.next_due_date,
          certificate_url: record.certificate_url,
          notes: record.notes,
          organization_id: profile!.organization_id!,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccination-records"] });
      toast({ title: "Success", description: "Vaccination record created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// DISCIPLINARY ACTION HOOKS
// ========================

export function useDisciplinaryActions(employeeId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["disciplinary-actions", profile?.organization_id, employeeId],
    queryFn: async () => {
      let query = supabase
        .from("disciplinary_actions")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("issued_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateDisciplinaryAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<DisciplinaryAction>) => {
      const { error } = await supabase
        .from("disciplinary_actions")
        .insert({
          employee_id: record.employee_id!,
          action_type: record.action_type!,
          incident_date: record.incident_date!,
          incident_description: record.incident_description!,
          policy_violated: record.policy_violated,
          investigation_details: record.investigation_details,
          action_taken: record.action_taken!,
          suspension_days: record.suspension_days,
          issued_date: record.issued_date,
          witness_ids: record.witness_ids,
          document_url: record.document_url,
          organization_id: profile!.organization_id!,
          issued_by: profile!.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-actions"] });
      toast({ title: "Success", description: "Disciplinary action recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateDisciplinaryAction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<DisciplinaryAction> & { id: string }) => {
      const { error } = await supabase
        .from("disciplinary_actions")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disciplinary-actions"] });
      toast({ title: "Success", description: "Disciplinary action updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// INCIDENT REPORT HOOKS
// ========================

export function useIncidentReports(status?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["incident-reports", profile?.organization_id, status],
    queryFn: async () => {
      let query = supabase
        .from("incident_reports")
        .select(`
          *,
          reporter:profiles!incident_reports_reported_by_fkey(full_name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("incident_date", { ascending: false });

      if (status) {
        query = query.eq("investigation_status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IncidentReport[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useIncidentReport(id: string | undefined) {
  return useQuery({
    queryKey: ["incident-report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as IncidentReport;
    },
    enabled: !!id,
  });
}

export function useCreateIncidentReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: Partial<IncidentReport>) => {
      const { data: result, error } = await supabase
        .from("incident_reports")
        .insert({
          branch_id: record.branch_id,
          incident_number: record.incident_number,
          incident_date: record.incident_date!,
          incident_time: record.incident_time,
          location: record.location!,
          incident_type: record.incident_type,
          description: record.description!,
          involved_employee_ids: record.involved_employee_ids,
          involved_patient_ids: record.involved_patient_ids,
          witness_ids: record.witness_ids,
          severity: record.severity,
          immediate_action_taken: record.immediate_action_taken,
          organization_id: profile!.organization_id!,
          reported_by: profile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-reports"] });
      toast({ title: "Success", description: "Incident report submitted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateIncidentReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const updateData: Record<string, unknown> = { 
        ...data, 
        updated_at: new Date().toISOString() 
      };

      if (data.investigation_status === 'closed') {
        updateData.closed_by = profile!.id;
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("incident_reports")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident-reports"] });
      toast({ title: "Success", description: "Incident report updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// COMPLIANCE STATS
// ========================

export function useComplianceStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["compliance-stats", profile?.organization_id],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: medicalExams } = await supabase
        .from("medical_fitness_records")
        .select("id, next_examination_date")
        .eq("organization_id", profile!.organization_id!)
        .not("next_examination_date", "is", null)
        .lte("next_examination_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      const { data: vaccinations } = await supabase
        .from("vaccination_records")
        .select("id, next_due_date")
        .eq("organization_id", profile!.organization_id!)
        .not("next_due_date", "is", null)
        .lte("next_due_date", thirtyDaysFromNow.toISOString().split('T')[0]);

      const { data: incidents } = await supabase
        .from("incident_reports")
        .select("id, investigation_status")
        .eq("organization_id", profile!.organization_id!)
        .neq("investigation_status", "closed");

      const { data: disciplinary } = await supabase
        .from("disciplinary_actions")
        .select("id, employee_acknowledged")
        .eq("organization_id", profile!.organization_id!)
        .eq("employee_acknowledged", false);

      return {
        upcomingMedicalExams: medicalExams?.length || 0,
        upcomingVaccinations: vaccinations?.length || 0,
        openIncidents: incidents?.length || 0,
        pendingAcknowledgements: disciplinary?.length || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
