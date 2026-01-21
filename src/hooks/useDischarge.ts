import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export const DISCHARGE_SUMMARY_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "finalized",
] as const;

export interface DischargeMedication {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface FollowUpAppointment {
  department: string;
  doctor_name?: string;
  date: string;
  notes?: string;
}

// Discharge Summary
export const useDischargeSummary = (admissionId?: string) => {
  return useQuery({
    queryKey: ["discharge-summary", admissionId],
    queryFn: async () => {
      if (!admissionId) return null;

      const { data, error } = await supabase
        .from("discharge_summaries")
        .select(`
          *,
          prepared_by_profile:profiles!discharge_summaries_prepared_by_fkey(id, full_name),
          approved_by_profile:profiles!discharge_summaries_approved_by_fkey(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!admissionId,
  });
};

export const useCreateDischargeSummary = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (summaryData: {
      admission_id: string;
      admission_diagnosis?: string;
      discharge_diagnosis?: string;
      condition_at_admission?: string;
      condition_at_discharge?: string;
      hospital_course?: string;
      significant_findings?: string;
      procedures_performed?: Array<{ name: string; date: string; notes?: string }>;
      investigations_summary?: Array<{ test: string; result: string; date: string }>;
      medications_on_discharge?: DischargeMedication[];
      medications_stopped?: Array<{ name: string; reason: string }>;
      diet_instructions?: string;
      activity_instructions?: string;
      follow_up_instructions?: string;
      follow_up_appointments?: FollowUpAppointment[];
      warning_signs?: string;
      referrals?: Array<{ specialty: string; reason: string }>;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("discharge_summaries")
        .insert({
          ...summaryData,
          procedures_performed: summaryData.procedures_performed as unknown as Json,
          investigations_summary: summaryData.investigations_summary as unknown as Json,
          medications_on_discharge: summaryData.medications_on_discharge as unknown as Json,
          medications_stopped: summaryData.medications_stopped as unknown as Json,
          follow_up_appointments: summaryData.follow_up_appointments as unknown as Json,
          referrals: summaryData.referrals as unknown as Json,
          prepared_by: profile.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discharge-summary"] });
      toast({ title: "Discharge summary created" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create discharge summary", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateDischargeSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...summaryData }: { id: string } & Partial<{
      admission_diagnosis: string;
      discharge_diagnosis: string;
      condition_at_admission: string;
      condition_at_discharge: string;
      hospital_course: string;
      significant_findings: string;
      procedures_performed: Array<{ name: string; date: string; notes?: string }>;
      investigations_summary: Array<{ test: string; result: string; date: string }>;
      medications_on_discharge: DischargeMedication[];
      medications_stopped: Array<{ name: string; reason: string }>;
      diet_instructions: string;
      activity_instructions: string;
      follow_up_instructions: string;
      follow_up_appointments: FollowUpAppointment[];
      warning_signs: string;
      referrals: Array<{ specialty: string; reason: string }>;
      status: string;
    }>) => {
      const updateData: Record<string, unknown> = { ...summaryData };
      
      // Convert arrays to Json type
      if (summaryData.procedures_performed) {
        updateData.procedures_performed = summaryData.procedures_performed as unknown as Json;
      }
      if (summaryData.investigations_summary) {
        updateData.investigations_summary = summaryData.investigations_summary as unknown as Json;
      }
      if (summaryData.medications_on_discharge) {
        updateData.medications_on_discharge = summaryData.medications_on_discharge as unknown as Json;
      }
      if (summaryData.medications_stopped) {
        updateData.medications_stopped = summaryData.medications_stopped as unknown as Json;
      }
      if (summaryData.follow_up_appointments) {
        updateData.follow_up_appointments = summaryData.follow_up_appointments as unknown as Json;
      }
      if (summaryData.referrals) {
        updateData.referrals = summaryData.referrals as unknown as Json;
      }

      const { data, error } = await supabase
        .from("discharge_summaries")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discharge-summary"] });
      toast({ title: "Discharge summary updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update discharge summary", description: error.message, variant: "destructive" });
    },
  });
};

export const useApproveDischargeSummary = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (summaryId: string) => {
      if (!profile?.id) throw new Error("No profile");

      const { data, error } = await supabase
        .from("discharge_summaries")
        .update({
          status: "approved",
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", summaryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discharge-summary"] });
      toast({ title: "Discharge summary approved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to approve discharge summary", description: error.message, variant: "destructive" });
    },
  });
};

// Pending Discharges
export const usePendingDischarges = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["pending-discharges", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          admission_date,
          expected_discharge_date,
          patient:patients(id, first_name, last_name, patient_number),
          ward:wards(id, name),
          bed:beds(id, bed_number),
          attending_doctor:doctors!admissions_attending_doctor_id_fkey(
            id,
            profile:profiles(full_name)
          )
        `)
        .eq("organization_id", profile.organization_id)
        .eq("status", "admitted")
        .not("expected_discharge_date", "is", null)
        .lte("expected_discharge_date", new Date().toISOString().split("T")[0])
        .order("expected_discharge_date");

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
};

// IPD Charges
export const useIPDCharges = (admissionId?: string) => {
  return useQuery({
    queryKey: ["ipd-charges", admissionId],
    queryFn: async () => {
      if (!admissionId) return [];

      const { data, error } = await supabase
        .from("ipd_charges")
        .select(`
          *,
          service_type:service_types(id, name, category),
          charged_by_profile:profiles(id, full_name)
        `)
        .eq("admission_id", admissionId)
        .order("charge_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!admissionId,
  });
};

export const useCreateIPDCharge = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (chargeData: {
      admission_id: string;
      service_type_id?: string;
      description: string;
      quantity: number;
      unit_price: number;
      charge_date: string;
      notes?: string;
    }) => {
      if (!profile?.id) throw new Error("No profile");

      const total_amount = chargeData.quantity * chargeData.unit_price;

      const { data, error } = await supabase
        .from("ipd_charges")
        .insert({
          admission_id: chargeData.admission_id,
          service_type_id: chargeData.service_type_id,
          description: chargeData.description,
          quantity: chargeData.quantity,
          unit_price: chargeData.unit_price,
          total_amount,
          charge_date: chargeData.charge_date,
          charge_type: "service",
          added_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ipd-charges"] });
      toast({ title: "Charge added" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add charge", description: error.message, variant: "destructive" });
    },
  });
};

// Generate IPD Invoice from charges
export const useGenerateIPDInvoice = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      admissionId,
      patientId,
      branchId,
      depositAmount = 0,
    }: {
      admissionId: string;
      patientId: string;
      branchId: string;
      depositAmount?: number;
    }) => {
      if (!profile?.organization_id) throw new Error("No organization");

      // Fetch all IPD charges for this admission
      const { data: charges, error: chargesError } = await supabase
        .from("ipd_charges")
        .select("*")
        .eq("admission_id", admissionId);

      if (chargesError) throw chargesError;

      if (!charges || charges.length === 0) {
        throw new Error("No charges found for this admission");
      }

      // Calculate totals
      const subtotal = charges.reduce((sum, charge) => sum + (charge.total_amount || 0), 0);
      const totalAmount = subtotal;

      // Generate invoice number
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
      const invoiceNumber = `IPD-${dateStr}-${randomSuffix}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          patient_id: patientId,
          branch_id: branchId,
          organization_id: profile.organization_id,
          subtotal,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: totalAmount,
          paid_amount: depositAmount,
          status: depositAmount >= totalAmount ? "paid" : "pending",
          notes: `IPD Invoice for Admission`,
          created_by: profile.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items from charges
      const invoiceItems = charges.map((charge) => ({
        invoice_id: invoice.id,
        description: charge.description,
        quantity: charge.quantity,
        unit_price: charge.unit_price,
        discount_percent: 0,
        total_price: charge.total_amount,
        service_type_id: charge.service_type_id,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      // If deposit was applied, create payment record
      if (depositAmount > 0) {
        await supabase
          .from("payments")
          .insert({
            invoice_id: invoice.id,
            amount: Math.min(depositAmount, totalAmount),
            payment_method: "deposit",
            payment_date: new Date().toISOString().split("T")[0],
            notes: "IPD Deposit applied to final invoice",
            organization_id: profile.organization_id,
            received_by: profile.id,
          });
      }

      return { invoice, chargesCount: charges.length, totalAmount };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["ipd-charges"] });
      toast({ title: "IPD Invoice generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate invoice", description: error.message, variant: "destructive" });
    },
  });
};
