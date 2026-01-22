import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ========================
// TYPES
// ========================

export interface JobOpening {
  id: string;
  organization_id: string;
  branch_id: string | null;
  title: string;
  department_id: string | null;
  designation_id: string | null;
  positions_available: number;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'internship';
  experience_required: string | null;
  qualification_required: string | null;
  skills_required: string[] | null;
  job_description: string | null;
  requirements: string | null;
  salary_range_min: number | null;
  salary_range_max: number | null;
  benefits: string | null;
  status: 'draft' | 'open' | 'on_hold' | 'closed' | 'filled' | 'cancelled';
  published_at: string | null;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
  department?: { name: string };
  designation?: { name: string };
  _count?: { applications: number };
}

export interface JobApplication {
  id: string;
  organization_id: string;
  job_opening_id: string;
  applicant_name: string;
  email: string;
  phone: string | null;
  cnic: string | null;
  current_employer: string | null;
  current_designation: string | null;
  experience_years: number | null;
  expected_salary: number | null;
  notice_period_days: number | null;
  resume_url: string | null;
  cover_letter: string | null;
  source: string | null;
  referred_by: string | null;
  status: 'received' | 'screening' | 'shortlisted' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  rejection_reason: string | null;
  notes: string | null;
  applied_at: string;
  updated_at: string;
  job_opening?: JobOpening;
}

export interface Interview {
  id: string;
  organization_id: string;
  application_id: string;
  interview_round: number;
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'hr' | 'panel';
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  interviewer_ids: string[] | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  feedback: string | null;
  strengths: string | null;
  weaknesses: string | null;
  rating: number | null;
  recommendation: 'strongly_hire' | 'hire' | 'maybe' | 'no_hire' | 'strongly_no_hire' | null;
  notes: string | null;
  created_at: string;
  application?: JobApplication;
}

export interface OfferLetter {
  id: string;
  organization_id: string;
  application_id: string;
  offered_salary: number;
  offered_designation_id: string | null;
  offered_department_id: string | null;
  joining_date: string | null;
  probation_months: number;
  benefits: string | null;
  terms_conditions: string | null;
  offer_date: string;
  valid_until: string | null;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  accepted_at: string | null;
  rejected_reason: string | null;
  document_url: string | null;
  created_at: string;
  application?: JobApplication;
}

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
        .select(`
          *,
          department:departments(name),
          designation:designations(name)
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get application counts
      const jobIds = data.map(j => j.id);
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
      })) as JobOpening[];
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
        .select(`
          *,
          department:departments(name),
          designation:designations(name)
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as JobOpening;
    },
    enabled: !!id,
  });
}

export function useCreateJobOpening() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<JobOpening>) => {
      const { data: result, error } = await supabase
        .from("job_openings")
        .insert({
          ...data,
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
    mutationFn: async ({ id, ...data }: Partial<JobOpening> & { id: string }) => {
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
        .select(`
          *,
          job_opening:job_openings(title, department:departments(name))
        `)
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
      return data as JobApplication[];
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
        .select(`
          *,
          job_opening:job_openings(*)
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as JobApplication;
    },
    enabled: !!id,
  });
}

export function useCreateJobApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<JobApplication>) => {
      const { data: result, error } = await supabase
        .from("job_applications")
        .insert({
          ...data,
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
    mutationFn: async ({ id, ...data }: Partial<JobApplication> & { id: string }) => {
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
        .select(`
          *,
          application:job_applications(
            applicant_name,
            job_opening:job_openings(title)
          )
        `)
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
      return data as Interview[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Interview>) => {
      const { data: result, error } = await supabase
        .from("interviews")
        .insert({
          ...data,
          organization_id: profile!.organization_id!,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
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
    mutationFn: async ({ id, ...data }: Partial<Interview> & { id: string }) => {
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
        .select(`
          *,
          application:job_applications(
            applicant_name,
            email,
            job_opening:job_openings(title)
          )
        `)
        .eq("organization_id", profile!.organization_id!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OfferLetter[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateOfferLetter() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<OfferLetter>) => {
      const { data: result, error } = await supabase
        .from("offer_letters")
        .insert({
          ...data,
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
        .eq("id", data.application_id);

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
    mutationFn: async ({ id, ...data }: Partial<OfferLetter> & { id: string }) => {
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
