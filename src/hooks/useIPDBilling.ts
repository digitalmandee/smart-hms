import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { differenceInDays } from "date-fns";

export interface AdmissionFinancial {
  admissionId: string;
  admissionNumber: string;
  patientName: string;
  patientNumber: string;
  admissionDate: string;
  wardName: string;
  bedNumber: string;
  daysAdmitted: number;
  depositAmount: number;
  roomChargePerDay: number;
  totalRoomCharges: number;
  totalServiceCharges: number;
  totalEstimated: number;
  balanceDue: number;
  hasInvoice: boolean;
  invoiceId?: string;
  invoiceStatus?: string;
}

export interface IPDBillingStats {
  totalDeposits: number;
  totalUnbilledCharges: number;
  pendingInvoiceCount: number;
  pendingInvoiceAmount: number;
  totalEstimatedRevenue: number;
  totalOutstandingBalance: number;
  admissionFinancials: AdmissionFinancial[];
}

export function useIPDBillingStats(branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ipd-billing-stats", profile?.organization_id, branchId],
    queryFn: async (): Promise<IPDBillingStats> => {
      if (!profile?.organization_id) {
        return {
          totalDeposits: 0,
          totalUnbilledCharges: 0,
          pendingInvoiceCount: 0,
          pendingInvoiceAmount: 0,
          totalEstimatedRevenue: 0,
          totalOutstandingBalance: 0,
          admissionFinancials: [],
        };
      }

      // Fetch active admissions with patient, ward, bed info
      let admissionsQuery = supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          admission_date,
          deposit_amount,
          patient:patients(id, first_name, last_name, patient_number),
          ward:wards(id, name, charge_per_day),
          bed:beds(id, bed_number, bed_type)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("status", "admitted");

      if (branchId) {
        admissionsQuery = admissionsQuery.eq("branch_id", branchId);
      }

      const { data: admissions, error: admissionsError } = await admissionsQuery;
      if (admissionsError) throw admissionsError;

      // Fetch bed type rates for room charge calculation
      const { data: bedTypes } = await supabase
        .from("ipd_bed_types")
        .select("code, daily_rate")
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true);

      const bedTypeRates = new Map<string, number>();
      bedTypes?.forEach((bt) => {
        bedTypeRates.set(bt.code, bt.daily_rate || 0);
      });

      // Fetch all IPD charges for active admissions
      const admissionIds = admissions?.map((a) => a.id) || [];
      const patientIds = [...new Set((admissions || []).map((a: any) => a.patient?.id).filter(Boolean))];
      
      let charges: { admission_id: string; total_amount: number; is_billed: boolean }[] = [];
      
      if (admissionIds.length > 0) {
        const { data: chargesData } = await supabase
          .from("ipd_charges")
          .select("admission_id, total_amount, is_billed")
          .in("admission_id", admissionIds);
        charges = chargesData || [];
      }

      // Fetch actual collected deposits from patient_deposits table
      let patientDepositsMap = new Map<string, number>();
      if (patientIds.length > 0) {
        const { data: depositsData } = await supabase
          .from("patient_deposits")
          .select("patient_id, amount, type")
          .in("patient_id", patientIds)
          .eq("status", "completed");
        
        (depositsData || []).forEach((d: any) => {
          const current = patientDepositsMap.get(d.patient_id) || 0;
          if (d.type === "deposit") {
            patientDepositsMap.set(d.patient_id, current + (Number(d.amount) || 0));
          } else if (d.type === "refund" || d.type === "applied") {
            patientDepositsMap.set(d.patient_id, current - (Number(d.amount) || 0));
          }
        });
      }

      // Fetch pending IPD invoices (those that reference ipd_charges or have IPD- prefix)
      const { data: pendingInvoices } = await supabase
        .from("invoices")
        .select("id, total_amount, paid_amount, status, invoice_number")
        .eq("organization_id", profile.organization_id)
        .in("status", ["pending", "partially_paid"])
        .like("invoice_number", "IPD-%");

      // Calculate per-admission financials
      const today = new Date();
      const admissionFinancials: AdmissionFinancial[] = (admissions || []).map((adm: any) => {
        const admissionDate = new Date(adm.admission_date);
        const daysAdmitted = Math.max(1, differenceInDays(today, admissionDate) + 1);

        // Get room charge rate
        const bedType = adm.bed?.bed_type;
        const roomChargePerDay = bedType && bedTypeRates.has(bedType)
          ? bedTypeRates.get(bedType)!
          : adm.ward?.charge_per_day || 0;

        const totalRoomCharges = daysAdmitted * roomChargePerDay;

        // Sum service charges for this admission
        const admCharges = charges.filter((c) => c.admission_id === adm.id);
        const totalServiceCharges = admCharges.reduce((sum, c) => sum + (c.total_amount || 0), 0);

        const totalEstimated = totalRoomCharges + totalServiceCharges;
        // Use actual collected deposit from patient_deposits, fall back to admission deposit_amount
        const patientId = adm.patient?.id;
        const actualDeposit = patientId && patientDepositsMap.has(patientId)
          ? patientDepositsMap.get(patientId)!
          : (adm.deposit_amount || 0);
        const depositAmount = Math.max(0, actualDeposit);
        const balanceDue = totalEstimated - depositAmount;

        return {
          admissionId: adm.id,
          admissionNumber: adm.admission_number,
          patientName: `${adm.patient?.first_name || ""} ${adm.patient?.last_name || ""}`.trim(),
          patientNumber: adm.patient?.patient_number || "",
          admissionDate: adm.admission_date,
          wardName: adm.ward?.name || "Unassigned",
          bedNumber: adm.bed?.bed_number || "-",
          daysAdmitted,
          depositAmount,
          roomChargePerDay,
          totalRoomCharges,
          totalServiceCharges,
          totalEstimated,
          balanceDue,
          hasInvoice: false, // Will be enhanced later
        };
      });

      // Calculate summary stats
      const totalDeposits = admissionFinancials.reduce((sum, af) => sum + af.depositAmount, 0);
      const totalUnbilledCharges = charges
        .filter((c) => !c.is_billed)
        .reduce((sum, c) => sum + (c.total_amount || 0), 0);
      const pendingInvoiceCount = pendingInvoices?.length || 0;
      const pendingInvoiceAmount = pendingInvoices?.reduce(
        (sum, inv) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)),
        0
      ) || 0;
      const totalEstimatedRevenue = admissionFinancials.reduce((sum, af) => sum + af.totalEstimated, 0);
      const totalOutstandingBalance = admissionFinancials.reduce(
        (sum, af) => sum + Math.max(0, af.balanceDue),
        0
      );

      return {
        totalDeposits,
        totalUnbilledCharges,
        pendingInvoiceCount,
        pendingInvoiceAmount,
        totalEstimatedRevenue,
        totalOutstandingBalance,
        admissionFinancials,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

export function usePatientActiveAdmission(patientId?: string) {
  return useQuery({
    queryKey: ["patient-active-admission", patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_number,
          ward:wards(id, name, charge_per_day),
          bed:beds(id, bed_number, bed_type)
        `)
        .eq("patient_id", patientId)
        .eq("status", "admitted")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!patientId,
  });
}
