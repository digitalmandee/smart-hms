import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";

export interface OutstandingInvoiceInfo {
  id: string;
  invoice_number: string;
  outstanding: number;
}

export interface AdmissionFinancials {
  admissionId: string;
  admissionNumber: string;
  admissionDate: string;
  daysAdmitted: number;
  // Bed/Room Info
  bedType: string | null;
  bedNumber: string | null;
  wardName: string | null;
  dailyRate: number;
  // Financial Breakdown
  depositAmount: number;
  roomCharges: number;
  serviceCharges: number;
  medicationCharges: number;
  labCharges: number;
  otherCharges: number;
  pharmacyCreditsAmount: number;
  // Outstanding invoices (lab, pharmacy, etc.)
  outstandingInvoices: OutstandingInvoiceInfo[];
  outstandingAmount: number;
  // Totals
  totalCharges: number;
  balance: number;
  // Charge counts
  chargeItemCount: number;
  pharmacyCreditsCount: number;
  // Status
  hasUnbilledCharges: boolean;
}

/**
 * Hook to fetch comprehensive financial data for a single admission
 */
export function useAdmissionFinancials(admissionId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["admission-financials", admissionId],
    queryFn: async (): Promise<AdmissionFinancials | null> => {
      if (!admissionId) return null;

      // Fetch admission with ward, bed info
      const { data: admission, error: admissionError } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          admission_date,
          deposit_amount,
          patient_id,
          admission_invoice_id,
          discharge_invoice_id,
          ward:wards(id, name, charge_per_day),
          bed:beds(id, bed_number, bed_type)
        `)
        .eq("id", admissionId)
        .single();

      if (admissionError) throw admissionError;
      if (!admission) return null;

      // Fetch bed type rate
      let dailyRate = admission.ward?.charge_per_day || 0;
      const bedType = admission.bed?.bed_type;

      if (bedType && profile?.organization_id) {
        const { data: bedTypeData } = await supabase
          .from("ipd_bed_types")
          .select("daily_rate")
          .eq("organization_id", profile.organization_id)
          .eq("code", bedType)
          .eq("is_active", true)
          .maybeSingle();

        if (bedTypeData?.daily_rate) {
          dailyRate = bedTypeData.daily_rate;
        }
      }

      // Fetch all IPD charges for this admission
      const { data: charges, error: chargesError } = await supabase
        .from("ipd_charges")
        .select("id, charge_type, total_amount, is_billed")
        .eq("admission_id", admissionId);

      if (chargesError) throw chargesError;

      // Fetch outstanding invoices (lab, pharmacy, etc.) for this patient during admission
      const excludeIds = [admission.admission_invoice_id, admission.discharge_invoice_id].filter(Boolean);
      let outstandingQuery = supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount")
        .eq("patient_id", admission.patient_id)
        .in("status", ["pending", "partially_paid"])
        .gte("created_at", admission.admission_date);

      if (excludeIds.length > 0) {
        outstandingQuery = outstandingQuery.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data: outstandingInvoicesData } = await outstandingQuery;

      const outstandingInvoices: OutstandingInvoiceInfo[] = (outstandingInvoicesData || []).map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        outstanding: (inv.total_amount || 0) - (inv.paid_amount || 0),
      }));

      const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + inv.outstanding, 0);

      // Fetch pharmacy credits (Pay Later purchases)
      const { data: pharmacyCredits } = await supabase
        .from("pharmacy_patient_credits")
        .select("id, amount, paid_amount")
        .eq("patient_id", admission.patient_id)
        .neq("status", "paid");

      const pharmacyCreditsAmount = (pharmacyCredits || []).reduce(
        (sum, credit) => sum + (credit.amount - credit.paid_amount), 
        0
      );

      // Calculate days admitted
      const today = new Date();
      const admissionDate = new Date(admission.admission_date);
      const daysAdmitted = Math.max(1, differenceInDays(today, admissionDate) + 1);

      // Calculate room charges (days × rate)
      const roomCharges = daysAdmitted * dailyRate;

      // Categorize charges
      let serviceCharges = 0;
      let medicationCharges = 0;
      let labCharges = 0;
      let otherCharges = 0;
      let hasUnbilledCharges = false;

      (charges || []).forEach((charge) => {
        const amount = charge.total_amount || 0;
        
        if (!charge.is_billed) {
          hasUnbilledCharges = true;
        }

        switch (charge.charge_type) {
          case "medication":
            medicationCharges += amount;
            break;
          case "lab":
            labCharges += amount;
            break;
          case "service":
          case "room":
            serviceCharges += amount;
            break;
          default:
            otherCharges += amount;
        }
      });

      // Include outstanding invoices and pharmacy credits in total
      const totalCharges = roomCharges + serviceCharges + medicationCharges + labCharges + otherCharges + outstandingAmount + pharmacyCreditsAmount;
      const depositAmount = admission.deposit_amount || 0;
      const balance = totalCharges - depositAmount;

      return {
        admissionId: admission.id,
        admissionNumber: admission.admission_number,
        admissionDate: admission.admission_date,
        daysAdmitted,
        bedType,
        bedNumber: admission.bed?.bed_number || null,
        wardName: admission.ward?.name || null,
        dailyRate,
        depositAmount,
        roomCharges,
        serviceCharges,
        medicationCharges,
        labCharges,
        otherCharges,
        pharmacyCreditsAmount,
        outstandingInvoices,
        outstandingAmount,
        totalCharges,
        balance,
        chargeItemCount: charges?.length || 0,
        pharmacyCreditsCount: pharmacyCredits?.length || 0,
        hasUnbilledCharges,
      };
    },
    enabled: !!admissionId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to post daily room charges for all admitted patients
 */
export function usePostRoomCharges() {
  const { profile } = useAuth();

  return async () => {
    if (!profile?.organization_id || !profile?.id) {
      throw new Error("Missing profile context");
    }

    // Fetch all active admissions with bed info
    const { data: admissions, error: admissionsError } = await supabase
      .from("admissions")
      .select(`
        id,
        admission_number,
        admission_date,
        bed:beds(id, bed_number, bed_type),
        ward:wards(id, name, charge_per_day)
      `)
      .eq("organization_id", profile.organization_id)
      .eq("status", "admitted");

    if (admissionsError) throw admissionsError;

    // Fetch bed type rates
    const { data: bedTypes } = await supabase
      .from("ipd_bed_types")
      .select("code, daily_rate, name")
      .eq("organization_id", profile.organization_id)
      .eq("is_active", true);

    const bedTypeRates = new Map<string, { rate: number; name: string }>();
    bedTypes?.forEach((bt) => {
      bedTypeRates.set(bt.code, { rate: bt.daily_rate || 0, name: bt.name });
    });

    const today = new Date().toISOString().split("T")[0];
    let chargesPosted = 0;
    let skipped = 0;

    for (const admission of admissions || []) {
      // Check if room charge already exists for today
      const { data: existingCharge } = await supabase
        .from("ipd_charges")
        .select("id")
        .eq("admission_id", admission.id)
        .eq("charge_date", today)
        .eq("charge_type", "room")
        .maybeSingle();

      if (existingCharge) {
        skipped++;
        continue; // Already charged for today
      }

      // Get daily rate
      const bedType = admission.bed?.bed_type;
      let dailyRate = admission.ward?.charge_per_day || 0;
      let bedTypeName = "Standard";

      if (bedType && bedTypeRates.has(bedType)) {
        const rateInfo = bedTypeRates.get(bedType)!;
        dailyRate = rateInfo.rate;
        bedTypeName = rateInfo.name;
      }

      if (dailyRate <= 0) {
        skipped++;
        continue; // No rate configured
      }

      // Create room charge
      const { error } = await supabase.from("ipd_charges").insert({
        admission_id: admission.id,
        charge_date: today,
        charge_type: "room",
        description: `Daily Room Charge - ${bedTypeName} (Bed ${admission.bed?.bed_number || "N/A"})`,
        quantity: 1,
        unit_price: dailyRate,
        total_amount: dailyRate,
        is_billed: false,
        added_by: profile.id,
      });

      if (!error) {
        chargesPosted++;
      }
    }

    return { chargesPosted, skipped, total: admissions?.length || 0 };
  };
}
