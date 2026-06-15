import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDepositBalance, usePatientLedger } from "@/hooks/usePatientDeposits";

export interface ActiveAdmissionLite {
  id: string;
  admission_number: string;
  admission_date: string;
  status: string;
}

export interface OutstandingInvoiceRow {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  outstanding: number;
  status: string;
  created_at: string;
}

export interface PharmacyCreditRow {
  id: string;
  amount: number;
  paid_amount: number;
  balance: number;
  status: string;
  created_at: string;
}

/**
 * Composite snapshot for the Cashier Workspace.
 * Reuses existing hooks where possible and adds patient-scoped lookups
 * for outstanding invoices, pharmacy credits, and active admission.
 */
export function useCashierPatientSnapshot(patientId?: string) {
  const { profile } = useAuth();
  const qc = useQueryClient();

  const deposit = useDepositBalance(patientId);
  const ledger = usePatientLedger(patientId);

  const outstandingQuery = useQuery({
    queryKey: ["cashier-outstanding-invoices", profile?.organization_id, patientId],
    queryFn: async (): Promise<OutstandingInvoiceRow[]> => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount, status, created_at")
        .eq("patient_id", patientId)
        .in("status", ["pending", "partially_paid"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((i: any) => ({
        id: i.id,
        invoice_number: i.invoice_number,
        total_amount: Number(i.total_amount || 0),
        paid_amount: Number(i.paid_amount || 0),
        outstanding: Number(i.total_amount || 0) - Number(i.paid_amount || 0),
        status: i.status,
        created_at: i.created_at,
      }));
    },
    enabled: !!patientId,
  });

  const pharmacyCreditsQuery = useQuery({
    queryKey: ["cashier-pharmacy-credits", patientId],
    queryFn: async (): Promise<PharmacyCreditRow[]> => {
      if (!patientId) return [];
      const { data, error } = await (supabase as any)
        .from("pharmacy_patient_credits")
        .select("id, amount, paid_amount, status, created_at")
        .eq("patient_id", patientId)
        .neq("status", "paid")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({
        id: c.id,
        amount: Number(c.amount || 0),
        paid_amount: Number(c.paid_amount || 0),
        balance: Number(c.amount || 0) - Number(c.paid_amount || 0),
        status: c.status,
        created_at: c.created_at,
      }));
    },
    enabled: !!patientId,
  });

  const activeAdmissionQuery = useQuery({
    queryKey: ["cashier-active-admission", patientId],
    queryFn: async (): Promise<ActiveAdmissionLite | null> => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("admissions")
        .select("id, admission_number, admission_date, status")
        .eq("patient_id", patientId)
        .in("status", ["admitted", "pending"])
        .order("admission_date", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data?.[0] as ActiveAdmissionLite) ?? null;
    },
    enabled: !!patientId,
  });

  // Realtime invalidations
  useEffect(() => {
    if (!patientId) return;
    const channel = supabase
      .channel(`cashier-ws-${patientId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices", filter: `patient_id=eq.${patientId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["cashier-outstanding-invoices"] });
          qc.invalidateQueries({ queryKey: ["patient-ledger"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_deposits", filter: `patient_id=eq.${patientId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["patient-balance"] });
          qc.invalidateQueries({ queryKey: ["patient-ledger"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pharmacy_patient_credits", filter: `patient_id=eq.${patientId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["cashier-pharmacy-credits"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admissions", filter: `patient_id=eq.${patientId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["cashier-active-admission"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId, qc]);

  const outstandingInvoices = outstandingQuery.data ?? [];
  const pharmacyCredits = pharmacyCreditsQuery.data ?? [];
  const depositAvailable = deposit.data?.balance ?? 0;
  const totalOutstanding =
    outstandingInvoices.reduce((s, i) => s + i.outstanding, 0) +
    pharmacyCredits.reduce((s, c) => s + c.balance, 0);
  const netDue = Math.max(0, totalOutstanding - depositAvailable);

  return {
    deposit: deposit.data,
    ledger: ledger.data ?? [],
    outstandingInvoices,
    pharmacyCredits,
    activeAdmission: activeAdmissionQuery.data ?? null,
    totals: {
      totalOutstanding,
      depositAvailable,
      netDue,
    },
    isLoading:
      deposit.isLoading ||
      ledger.isLoading ||
      outstandingQuery.isLoading ||
      pharmacyCreditsQuery.isLoading ||
      activeAdmissionQuery.isLoading,
  };
}
