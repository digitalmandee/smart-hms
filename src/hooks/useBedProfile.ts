import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Fetch complete bed profile with all details
export const useBedProfile = (bedId: string | undefined) => {
  return useQuery({
    queryKey: ["bed-profile", bedId],
    queryFn: async () => {
      if (!bedId) return null;

      const { data, error } = await supabase
        .from("beds")
        .select(`
          *,
          ward:wards(id, name, floor, ward_type, branch:branches(id, name)),
          current_admission:admissions!beds_current_admission_id_fkey(
            id, 
            admission_number, 
            admission_date, 
            status,
            patient:patients(id, first_name, last_name, patient_number, date_of_birth, gender),
            attending_doctor:doctors!admissions_attending_doctor_id_fkey(id, profile:profiles!doctors_profile_id_fkey(full_name))
          )
        `)
        .eq("id", bedId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!bedId,
  });
};

// Fetch bed occupancy history (past admissions)
export const useBedOccupancyHistory = (bedId: string | undefined) => {
  return useQuery({
    queryKey: ["bed-occupancy-history", bedId],
    queryFn: async () => {
      if (!bedId) return [];

      const { data, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          admission_date,
          admission_time,
          actual_discharge_date,
          discharge_time,
          status,
          patient:patients(id, first_name, last_name, patient_number, gender),
          attending_doctor:doctors!admissions_attending_doctor_id_fkey(id, profile:profiles!doctors_profile_id_fkey(full_name)),
          admitting_doctor:doctors!admissions_admitting_doctor_id_fkey(id, profile:profiles!doctors_profile_id_fkey(full_name))
        `)
        .eq("bed_id", bedId)
        .order("admission_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!bedId,
  });
};

// Fetch bed transfer history
export const useBedTransferHistory = (bedId: string | undefined) => {
  return useQuery({
    queryKey: ["bed-transfer-history", bedId],
    queryFn: async () => {
      if (!bedId) return [];

      const { data, error } = await supabase
        .from("bed_transfers")
        .select(`
          id,
          transfer_reason,
          transferred_at,
          notes,
          ordered_by,
          transferred_by,
          admission:admissions(
            id,
            admission_number,
            patient:patients(id, first_name, last_name, patient_number)
          ),
          from_bed:beds!bed_transfers_from_bed_id_fkey(id, bed_number, ward:wards(id, name)),
          to_bed:beds!bed_transfers_to_bed_id_fkey(id, bed_number, ward:wards(id, name)),
          ordered_by_profile:profiles!bed_transfers_ordered_by_fkey(id, full_name),
          transferred_by_profile:profiles!bed_transfers_transferred_by_fkey(id, full_name)
        `)
        .or(`from_bed_id.eq.${bedId},to_bed_id.eq.${bedId}`)
        .order("transferred_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!bedId,
  });
};

// Fetch bed issue logs
export const useBedIssueLogs = (bedId: string | undefined) => {
  return useQuery({
    queryKey: ["bed-issue-logs", bedId],
    queryFn: async () => {
      if (!bedId) return [];

      const { data, error } = await supabase
        .from("bed_issue_logs")
        .select(`
          id,
          issue_type,
          description,
          severity,
          reported_at,
          resolved_at,
          resolution_notes,
          reported_by,
          resolved_by,
          reported_by_profile:profiles!bed_issue_logs_reported_by_fkey(id, full_name),
          resolved_by_profile:profiles!bed_issue_logs_resolved_by_fkey(id, full_name)
        `)
        .eq("bed_id", bedId)
        .order("reported_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!bedId,
  });
};

// Create bed issue log
export const useCreateBedIssue = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      bedId: string;
      issueType: string;
      description: string;
      severity: string;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      const { data: result, error } = await supabase
        .from("bed_issue_logs")
        .insert({
          bed_id: data.bedId,
          organization_id: profile.organization_id,
          issue_type: data.issueType,
          description: data.description,
          severity: data.severity,
          reported_by: profile.id,
          reported_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bed-issue-logs", variables.bedId] });
      toast.success("Issue logged successfully");
    },
    onError: (error) => {
      console.error("Failed to log issue:", error);
      toast.error("Failed to log issue");
    },
  });
};

// Resolve bed issue
export const useResolveBedIssue = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      issueId: string;
      bedId: string;
      resolutionNotes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("bed_issue_logs")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: profile?.id,
          resolution_notes: data.resolutionNotes,
        })
        .eq("id", data.issueId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bed-issue-logs", variables.bedId] });
      toast.success("Issue resolved");
    },
    onError: (error) => {
      console.error("Failed to resolve issue:", error);
      toast.error("Failed to resolve issue");
    },
  });
};

// Calculate bed utilization stats
export const useBedUtilizationStats = (bedId: string | undefined, days: number = 30) => {
  return useQuery({
    queryKey: ["bed-utilization", bedId, days],
    queryFn: async () => {
      if (!bedId) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all admissions in the time period
      const { data: admissions, error } = await supabase
        .from("admissions")
        .select("admission_date, actual_discharge_date, status")
        .eq("bed_id", bedId)
        .gte("admission_date", startDate.toISOString().split("T")[0]);

      if (error) throw error;

      let totalOccupiedDays = 0;
      let totalStayDays = 0;
      let admissionCount = 0;

      (admissions || []).forEach((admission) => {
        admissionCount++;
        const admitDate = new Date(admission.admission_date);
        const dischargeDate = admission.actual_discharge_date 
          ? new Date(admission.actual_discharge_date) 
          : new Date();
        
        const stayDays = Math.ceil((dischargeDate.getTime() - admitDate.getTime()) / (1000 * 60 * 60 * 24));
        totalStayDays += stayDays;
        
        // Calculate overlap with analysis period
        const overlapStart = admitDate > startDate ? admitDate : startDate;
        const overlapEnd = dischargeDate < new Date() ? dischargeDate : new Date();
        const overlapDays = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
        totalOccupiedDays += Math.max(0, overlapDays);
      });

      const occupancyRate = days > 0 ? (totalOccupiedDays / days) * 100 : 0;
      const avgLengthOfStay = admissionCount > 0 ? totalStayDays / admissionCount : 0;

      return {
        occupancyRate: Math.min(100, occupancyRate),
        avgLengthOfStay,
        totalAdmissions: admissionCount,
        totalOccupiedDays,
        periodDays: days,
      };
    },
    enabled: !!bedId,
  });
};
