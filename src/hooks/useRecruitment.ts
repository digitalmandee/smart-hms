import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ========================
// JOB OPENINGS HOOKS
// ========================

export function useJobOpenings(status?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["job-openings", profile?.organization_id, status],
    queryFn: async () => {
      let query = supabase
        .from("job_openings")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get application counts
      const jobIds = data.map(j => j.id);
      if (jobIds.length > 0) {
        const { data: appCounts } = await supabase
          .from("job_applications")
          .select("job_opening_id")
          .in("job_opening_id", jobIds);

        const countMap = new Map<string, number>();
        appCounts?.forEach(app => {
          countMap.set(app.job_opening_id, (countMap.get(app.job_opening_id) || 0) + 1);
        });

        return data.map(job => ({
          ...job,
          _count: { applications: countMap.get(job.id) || 0 }
        }));
      }

      return data.map(job => ({ ...job, _count: { applications: 0 } }));
    },
    enabled: !!profile?.organization_id,
  });
}

export function useJobOpening(id: string | undefined) {
  return useQuery({
    queryKey: ["job-opening", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_openings")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateJobOpening() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      title: string;
      department_id?: string;
      designation_id?: string;
      branch_id?: string;
      positions_available?: number;
      employment_type?: string;
      experience_required?: string;
      qualification_required?: string;
      skills_required?: string[];
      job_description?: string;
      requirements?: string;
      salary_range_min?: number;
      salary_range_max?: number;
      benefits?: string;
      status?: string;
      closes_at?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("job_openings")
        .insert({
          title: record.title,
          department_id: record.department_id,
          designation_id: record.designation_id,
          branch_id: record.branch_id,
          positions_available: record.positions_available,
          employment_type: record.employment_type,
          experience_required: record.experience_required,
          qualification_required: record.qualification_required,
          skills_required: record.skills_required,
          job_description: record.job_description,
          requirements: record.requirements,
          salary_range_min: record.salary_range_min,
          salary_range_max: record.salary_range_max,
          benefits: record.benefits,
          status: record.status || 'draft',
          closes_at: record.closes_at,
          organization_id: profile!.organization_id!,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      toast({ title: "Success", description: "Job opening created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateJobOpening() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("job_openings")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      toast({ title: "Success", description: "Job opening updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// JOB APPLICATIONS HOOKS
// ========================

export function useJobApplications(filters?: { jobOpeningId?: string; status?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["job-applications", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("job_applications")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("applied_at", { ascending: false });

      if (filters?.jobOpeningId) {
        query = query.eq("job_opening_id", filters.jobOpeningId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useJobApplication(id: string | undefined) {
  return useQuery({
    queryKey: ["job-application", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      job_opening_id: string;
      applicant_name: string;
      email: string;
      phone?: string;
      cnic?: string;
      current_employer?: string;
      current_designation?: string;
      experience_years?: number;
      expected_salary?: number;
      notice_period_days?: number;
      resume_url?: string;
      cover_letter?: string;
      source?: string;
      referred_by?: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("job_applications")
        .insert({
          job_opening_id: record.job_opening_id,
          applicant_name: record.applicant_name,
          email: record.email,
          phone: record.phone,
          cnic: record.cnic,
          current_employer: record.current_employer,
          current_designation: record.current_designation,
          experience_years: record.experience_years,
          expected_salary: record.expected_salary,
          notice_period_days: record.notice_period_days,
          resume_url: record.resume_url,
          cover_letter: record.cover_letter,
          source: record.source,
          referred_by: record.referred_by,
          notes: record.notes,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Success", description: "Application submitted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateJobApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Success", description: "Application updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// INTERVIEWS HOOKS
// ========================

export function useInterviews(filters?: { applicationId?: string; status?: string }) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["interviews", profile?.organization_id, filters],
    queryFn: async () => {
      let query = supabase
        .from("interviews")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("scheduled_at", { ascending: true });

      if (filters?.applicationId) {
        query = query.eq("application_id", filters.applicationId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      application_id: string;
      interview_round?: number;
      interview_type?: string;
      scheduled_at: string;
      duration_minutes?: number;
      location?: string;
      meeting_link?: string;
      interviewer_ids?: string[];
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("interviews")
        .insert({
          application_id: record.application_id,
          interview_round: record.interview_round || 1,
          interview_type: record.interview_type || 'in_person',
          scheduled_at: record.scheduled_at,
          duration_minutes: record.duration_minutes || 30,
          location: record.location,
          meeting_link: record.meeting_link,
          interviewer_ids: record.interviewer_ids,
          notes: record.notes,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;

      // Update application status to 'interview'
      await supabase
        .from("job_applications")
        .update({ status: "interview" })
        .eq("id", record.application_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Success", description: "Interview scheduled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("interviews")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast({ title: "Success", description: "Interview updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// OFFER LETTERS HOOKS
// ========================

export function useOfferLetters() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["offer-letters", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_letters")
        .select("*")
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateOfferLetter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (record: {
      application_id: string;
      offered_salary: number;
      offered_designation_id?: string;
      offered_department_id?: string;
      joining_date?: string;
      probation_months?: number;
      benefits?: string;
      terms_conditions?: string;
      valid_until?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("offer_letters")
        .insert({
          application_id: record.application_id,
          offered_salary: record.offered_salary,
          offered_designation_id: record.offered_designation_id,
          offered_department_id: record.offered_department_id,
          joining_date: record.joining_date,
          probation_months: record.probation_months || 3,
          benefits: record.benefits,
          terms_conditions: record.terms_conditions,
          valid_until: record.valid_until,
          organization_id: profile!.organization_id!,
          created_by: profile!.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update application status to 'offer'
      await supabase
        .from("job_applications")
        .update({ status: "offer" })
        .eq("id", record.application_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-letters"] });
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Success", description: "Offer letter created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateOfferLetter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("offer_letters")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer-letters"] });
      toast({ title: "Success", description: "Offer letter updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// ========================
// RECRUITMENT STATS
// ========================

export function useRecruitmentStats() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["recruitment-stats", profile?.organization_id],
    queryFn: async () => {
      const { data: openings } = await supabase
        .from("job_openings")
        .select("id, status")
        .eq("organization_id", profile!.organization_id!);

      const { data: applications } = await supabase
        .from("job_applications")
        .select("id, status")
        .eq("organization_id", profile!.organization_id!);

      const { data: interviews } = await supabase
        .from("interviews")
        .select("id, status, scheduled_at")
        .eq("organization_id", profile!.organization_id!)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString());

      return {
        openPositions: openings?.filter(o => o.status === 'open').length || 0,
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter(a => ['received', 'screening'].includes(a.status)).length || 0,
        upcomingInterviews: interviews?.length || 0,
        hiredThisMonth: applications?.filter(a => a.status === 'hired').length || 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
