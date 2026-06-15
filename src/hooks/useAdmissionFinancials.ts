import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";
import { useDepositBalance } from "@/hooks/usePatientDeposits";

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
  roomChargesDaysPosted: number;
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

      // Categorize charges - separate room charges from service charges
      let postedRoomCharges = 0;
      let roomChargesDaysPosted = 0;
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
          case "room":
            postedRoomCharges += amount;
            roomChargesDaysPosted += 1;
            break;
          case "medication":
            medicationCharges += amount;
            break;
          case "lab":
            labCharges += amount;
            break;
          case "service":
            serviceCharges += amount;
            break;
          default:
            otherCharges += amount;
        }
      });

      // Use posted room charges if available, otherwise calculate dynamically
      const roomCharges = postedRoomCharges > 0 
        ? postedRoomCharges 
        : daysAdmitted * dailyRate;

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
        roomChargesDaysPosted,
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

// =====================================================================
// IPD-01: Live Running Bill — itemized lines + live deposit ledger
// =====================================================================

export type RunningBillLineSource =
  | "ipd_charge"
  | "pharmacy_credit"
  | "outstanding_invoice";

export interface RunningBillLine {
  id: string;
  date: string;
  category: string; // room | medication | lab | service | other | pharmacy_credit | outstanding_invoice
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  source: RunningBillLineSource;
  is_billed: boolean;
  reference: string | null;
}

export interface AdmissionRunningBill {
  admission: {
    id: string;
    number: string;
    patientId: string;
    admissionDate: string;
    daysAdmitted: number;
    bedType: string | null;
    bedNumber: string | null;
    wardName: string | null;
    dailyRate: number;
    admissionDepositSnapshot: number;
  };
  lines: RunningBillLine[];
  totals: {
    room: number;
    medication: number;
    lab: number;
    service: number;
    other: number;
    pharmacyCredits: number;
    outstandingInvoices: number;
    totalCharges: number;
  };
  deposit: {
    collected: number;
    refunded: number;
    applied: number;
    available: number;
  };
  balance: number;
  hasUnbilledCharges: boolean;
}

export function useAdmissionRunningBill(admissionId?: string) {
  const { profile } = useAuth();

  const admissionQuery = useQuery({
    queryKey: ["admission-running-bill", admissionId],
    queryFn: async () => {
      if (!admissionId) return null;

      const { data: admission, error: aErr } = await supabase
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
        .maybeSingle();

      if (aErr) throw aErr;
      if (!admission) return null;

      // Resolve daily rate
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
        if (bedTypeData?.daily_rate) dailyRate = bedTypeData.daily_rate;
      }

      // IPD charges
      const { data: charges, error: cErr } = await supabase
        .from("ipd_charges")
        .select("id, charge_date, charge_type, description, quantity, unit_price, total_amount, is_billed, created_at")
        .eq("admission_id", admissionId)
        .order("charge_date", { ascending: false });
      if (cErr) throw cErr;

      // Outstanding invoices for this patient since admission
      const excludeIds = [admission.admission_invoice_id, admission.discharge_invoice_id].filter(Boolean);
      let outQ = supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount, created_at")
        .eq("patient_id", admission.patient_id)
        .in("status", ["pending", "partially_paid"])
        .gte("created_at", admission.admission_date);
      if (excludeIds.length > 0) {
        outQ = outQ.not("id", "in", `(${excludeIds.join(",")})`);
      }
      const { data: outstanding } = await outQ;

      // Pharmacy credits
      const { data: pharmacyCredits } = await supabase
        .from("pharmacy_patient_credits")
        .select("id, amount, paid_amount, created_at, status")
        .eq("patient_id", admission.patient_id)
        .neq("status", "paid");

      // Build lines
      const lines: RunningBillLine[] = [];

      let roomTotal = 0;
      let medicationTotal = 0;
      let labTotal = 0;
      let serviceTotal = 0;
      let otherTotal = 0;
      let hasUnbilledCharges = false;

      (charges || []).forEach((c) => {
        const amount = Number(c.total_amount || 0);
        if (!c.is_billed) hasUnbilledCharges = true;
        switch (c.charge_type) {
          case "room": roomTotal += amount; break;
          case "medication": medicationTotal += amount; break;
          case "lab": labTotal += amount; break;
          case "service": serviceTotal += amount; break;
          default: otherTotal += amount;
        }
        lines.push({
          id: c.id,
          date: c.charge_date || c.created_at,
          category: c.charge_type || "other",
          description: c.description || "",
          quantity: Number(c.quantity || 1),
          unit_price: Number(c.unit_price || 0),
          amount,
          source: "ipd_charge",
          is_billed: !!c.is_billed,
          reference: null,
        });
      });

      const outstandingInvoicesTotal = (outstanding || []).reduce((s, inv) => {
        const due = Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
        if (due > 0) {
          lines.push({
            id: `inv-${inv.id}`,
            date: inv.created_at as string,
            category: "outstanding_invoice",
            description: `Invoice ${inv.invoice_number}`,
            quantity: 1,
            unit_price: due,
            amount: due,
            source: "outstanding_invoice",
            is_billed: true,
            reference: inv.invoice_number,
          });
        }
        return s + Math.max(due, 0);
      }, 0);

      const pharmacyCreditsTotal = (pharmacyCredits || []).reduce((s, pc) => {
        const due = Number(pc.amount || 0) - Number(pc.paid_amount || 0);
        if (due > 0) {
          lines.push({
            id: `pc-${pc.id}`,
            date: pc.created_at as string,
            category: "pharmacy_credit",
            description: "Pharmacy credit (Pay Later)",
            quantity: 1,
            unit_price: due,
            amount: due,
            source: "pharmacy_credit",
            is_billed: false,
            reference: null,
          });
        }
        return s + Math.max(due, 0);
      }, 0);

      // Sort newest first
      lines.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

      const today = new Date();
      const admissionDate = new Date(admission.admission_date);
      const daysAdmitted = Math.max(1, differenceInDays(today, admissionDate) + 1);

      const totalCharges =
        roomTotal + medicationTotal + labTotal + serviceTotal + otherTotal +
        pharmacyCreditsTotal + outstandingInvoicesTotal;

      return {
        admission: {
          id: admission.id,
          number: admission.admission_number,
          patientId: admission.patient_id,
          admissionDate: admission.admission_date,
          daysAdmitted,
          bedType,
          bedNumber: admission.bed?.bed_number || null,
          wardName: admission.ward?.name || null,
          dailyRate,
          admissionDepositSnapshot: Number(admission.deposit_amount || 0),
        },
        lines,
        totals: {
          room: roomTotal,
          medication: medicationTotal,
          lab: labTotal,
          service: serviceTotal,
          other: otherTotal,
          pharmacyCredits: pharmacyCreditsTotal,
          outstandingInvoices: outstandingInvoicesTotal,
          totalCharges,
        },
        hasUnbilledCharges,
      };
    },
    enabled: !!admissionId,
  });

  const patientId = admissionQuery.data?.admission.patientId;
  const depositQuery = useDepositBalance(patientId);

  const data: AdmissionRunningBill | null = admissionQuery.data
    ? {
        admission: admissionQuery.data.admission,
        lines: admissionQuery.data.lines,
        totals: admissionQuery.data.totals,
        deposit: {
          collected: depositQuery.data?.deposits ?? 0,
          refunded: depositQuery.data?.refunds ?? 0,
          applied: depositQuery.data?.applied ?? 0,
          available: depositQuery.data?.balance ?? 0,
        },
        balance: admissionQuery.data.totals.totalCharges - (depositQuery.data?.balance ?? 0),
        hasUnbilledCharges: admissionQuery.data.hasUnbilledCharges,
      }
    : null;

  return {
    data,
    isLoading: admissionQuery.isLoading,
    refetch: admissionQuery.refetch,
    patientId,
  };
}
