import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AdmissionMedication {
  id: string;
  medicine_name: string;
  dosage: string;
  route: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  medicine?: {
    id: string;
    name: string;
    generic_name: string | null;
  } | null;
}

export interface AdmissionLabOrder {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  items?: {
    id: string;
    test_name: string;
    result: string | null;
    status: string;
  }[];
}

export interface AdmissionCharge {
  id: string;
  charge_date: string;
  charge_type: string;
  description: string;
  quantity: number | null;
  unit_price: number;
  total_amount: number;
  is_billed: boolean | null;
}

export interface DischargeSummaryInfo {
  id: string;
  status: string;
  approved_at: string | null;
  approved_by_profile?: {
    full_name: string;
  } | null;
}

export interface AdmissionDetailsData {
  medications: AdmissionMedication[];
  labOrders: AdmissionLabOrder[];
  charges: AdmissionCharge[];
  dischargeSummary: DischargeSummaryInfo | null;
  totals: {
    medications: number;
    labOrders: number;
    charges: number;
    chargesAmount: number;
  };
}

export function useAdmissionDetails(admissionId: string | undefined) {
  return useQuery({
    queryKey: ["admission-details", admissionId],
    queryFn: async (): Promise<AdmissionDetailsData> => {
      if (!admissionId) {
        return {
          medications: [],
          labOrders: [],
          charges: [],
          dischargeSummary: null,
          totals: { medications: 0, labOrders: 0, charges: 0, chargesAmount: 0 },
        };
      }

      // Fetch all data in parallel
      const [medicationsRes, chargesRes, dischargeSummaryRes] = await Promise.all([
        // Medications
        supabase
          .from("ipd_medications")
          .select(`
            id, medicine_name, dosage, route, frequency, start_date, end_date, is_active,
            medicine:medicines(id, name, generic_name)
          `)
          .eq("admission_id", admissionId)
          .order("created_at", { ascending: false }),

        // IPD Charges
        supabase
          .from("ipd_charges")
          .select("id, charge_date, charge_type, description, quantity, unit_price, total_amount, is_billed")
          .eq("admission_id", admissionId)
          .order("charge_date", { ascending: false }),

        // Discharge Summary
        supabase
          .from("discharge_summaries")
          .select(`
            id, status, approved_at,
            approved_by_profile:profiles!discharge_summaries_approved_by_fkey(full_name)
          `)
          .eq("admission_id", admissionId)
          .maybeSingle(),
      ]);

      if (medicationsRes.error) throw medicationsRes.error;
      if (chargesRes.error) throw chargesRes.error;
      if (dischargeSummaryRes.error) throw dischargeSummaryRes.error;

      // Get admission to find patient_id for lab orders
      const { data: admission, error: admissionError } = await supabase
        .from("admissions")
        .select("patient_id, admission_date, actual_discharge_date")
        .eq("id", admissionId)
        .single();

      if (admissionError) throw admissionError;

      // Fetch lab orders for this patient during admission period
      // Using raw query since lab_orders might not have admission_id directly
      let labOrdersData: AdmissionLabOrder[] = [];
      if (admission?.patient_id) {
        const labQuery = (supabase as any)
          .from("lab_orders")
          .select(`
            id, order_number, status, created_at,
            items:lab_order_items(id, test_name, result, status)
          `)
          .eq("patient_id", admission.patient_id)
          .gte("created_at", admission.admission_date)
          .order("created_at", { ascending: false })
          .limit(20);

        if (admission.actual_discharge_date) {
          labQuery.lte("created_at", admission.actual_discharge_date);
        }

        const { data: labOrders, error: labError } = await labQuery;
        if (!labError && labOrders) {
          labOrdersData = labOrders;
        }
      }

      const medications = (medicationsRes.data || []) as AdmissionMedication[];
      const charges = (chargesRes.data || []) as AdmissionCharge[];
      const dischargeSummary = dischargeSummaryRes.data as DischargeSummaryInfo | null;

      const chargesAmount = charges.reduce((sum, c) => sum + (c.total_amount || 0), 0);

      return {
        medications,
        labOrders: labOrdersData,
        charges,
        dischargeSummary,
        totals: {
          medications: medications.length,
          labOrders: labOrdersData.length,
          charges: charges.length,
          chargesAmount,
        },
      };
    },
    enabled: !!admissionId,
  });
}
