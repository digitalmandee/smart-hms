/**
 * Hook for fetching comprehensive day-end financial summary
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfDay, endOfDay } from "date-fns";

export interface PaymentByMethod { method: string; amount: number; count: number; isCash: boolean; }
export interface PaymentByDepartment { department: string; amount: number; count: number; }
export interface DoctorSettlementItem { id: string; doctorName: string; amount: number; settlementNumber: string; paymentMethod: string | null; referenceNumber: string | null; }
export interface VendorPaymentItem { id: string; vendorName: string; amount: number; paymentNumber: string; paymentMethod: string | null; referenceNumber: string | null; }
export interface ExpenseItem { id: string; description: string; amount: number; category: string | null; paidTo: string | null; }

export interface DayEndSummary {
  date: string;
  branchId: string | null;
  branchName: string | null;
  collections: { byMethod: PaymentByMethod[]; byDepartment: PaymentByDepartment[]; totalCash: number; totalNonCash: number; grandTotal: number; };
  payouts: { doctorSettlements: { total: number; cashTotal: number; items: DoctorSettlementItem[] }; vendorPayments: { total: number; cashTotal: number; items: VendorPaymentItem[] }; expenses: { total: number; items: ExpenseItem[] }; totalPayouts: number; totalCashPayouts: number; };
  reconciliation: { totalCashCollected: number; cashPayouts: number; netCashToSubmit: number };
  outstanding: { pendingInvoices: number; pendingAmount: number; creditGivenToday: number; creditRecoveredToday: number };
  transactionCount: number;
  invoiceCount: number;
  paymentCount: number;
}

export function useDayEndSummary(date: Date, branchId?: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["day-end-summary", profile?.organization_id, format(date, "yyyy-MM-dd"), branchId],
    queryFn: async (): Promise<DayEndSummary> => {
      const dateStr = format(date, "yyyy-MM-dd");
      const startDate = startOfDay(date).toISOString();
      const endDate = endOfDay(date).toISOString();
      const orgId = profile!.organization_id!;

      // @ts-ignore - Supabase types cause deep instantiation error
      const paymentsRes = await supabase.from("payments").select("*").eq("organization_id", orgId).gte("created_at", startDate).lte("created_at", endDate);
      // @ts-ignore - Supabase types cause deep instantiation error
      const dsRes = await supabase.from("doctor_settlements").select("*").eq("organization_id", orgId).eq("settlement_date", dateStr);
      // @ts-ignore - Supabase types cause deep instantiation error
      const vpRes = await supabase.from("vendor_payments").select("*").eq("organization_id", orgId);
      // @ts-ignore - Supabase types cause deep instantiation error
      const invRes = await supabase.from("invoices").select("*").eq("organization_id", orgId).in("status", ["pending", "partially_paid"]);
      // @ts-ignore - Supabase types cause deep instantiation error
      const pmRes = await supabase.from("payment_methods").select("*").eq("organization_id", orgId);

      const payments = (paymentsRes.data || []) as any[];
      const doctorSettlements = (dsRes.data || []) as any[];
      const vendorPayments = (vpRes.data || []) as any[];
      const pendingInvoices = (invRes.data || []) as any[];
      const paymentMethods = (pmRes.data || []) as any[];

      const methodLookup = new Map<string, { name: string; isCash: boolean }>();
      paymentMethods.forEach((pm) => methodLookup.set(pm.id, { name: pm.name, isCash: pm.code?.toLowerCase() === "cash" || pm.name?.toLowerCase() === "cash" }));

      const methodMap = new Map<string, { amount: number; count: number; isCash: boolean }>();
      let totalCash = 0, totalNonCash = 0;
      payments.forEach((p) => {
        const method = p.payment_method_id ? methodLookup.get(p.payment_method_id) : null;
        const methodName = method?.name || "Cash";
        const isCash = method?.isCash ?? true;
        const existing = methodMap.get(methodName) || { amount: 0, count: 0, isCash };
        existing.amount += Number(p.amount) || 0;
        existing.count += 1;
        methodMap.set(methodName, existing);
        if (isCash) totalCash += Number(p.amount) || 0; else totalNonCash += Number(p.amount) || 0;
      });

      let doctorTotal = 0, doctorCashTotal = 0;
      const doctorItems: DoctorSettlementItem[] = doctorSettlements.map((s) => {
        const amount = Number(s.total_amount) || 0;
        doctorTotal += amount;
        if (s.payment_method?.toLowerCase().includes("cash") ?? true) doctorCashTotal += amount;
        return { id: s.id, doctorName: "Doctor", amount, settlementNumber: s.settlement_number || "-", paymentMethod: s.payment_method, referenceNumber: s.reference_number };
      });

      let vendorTotal = 0, vendorCashTotal = 0;
      const vendorItems: VendorPaymentItem[] = vendorPayments.map((vp) => {
        const amount = Number(vp.amount) || 0;
        vendorTotal += amount;
        const pm = vp.payment_method_id ? methodLookup.get(vp.payment_method_id) : null;
        if (pm?.isCash) vendorCashTotal += amount;
        return { id: vp.id, vendorName: "Vendor", amount, paymentNumber: vp.payment_number || "-", paymentMethod: pm?.name || null, referenceNumber: vp.reference_number };
      });

      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount || 0)), 0);

      return {
        date: dateStr, branchId: branchId || null, branchName: null,
        collections: { byMethod: Array.from(methodMap.entries()).map(([method, d]) => ({ method, amount: d.amount, count: d.count, isCash: d.isCash })), byDepartment: [{ department: "General", amount: totalCash + totalNonCash, count: payments.length }], totalCash, totalNonCash, grandTotal: totalCash + totalNonCash },
        payouts: { doctorSettlements: { total: doctorTotal, cashTotal: doctorCashTotal, items: doctorItems }, vendorPayments: { total: vendorTotal, cashTotal: vendorCashTotal, items: vendorItems }, expenses: { total: 0, items: [] }, totalPayouts: doctorTotal + vendorTotal, totalCashPayouts: doctorCashTotal + vendorCashTotal },
        reconciliation: { totalCashCollected: totalCash, cashPayouts: doctorCashTotal + vendorCashTotal, netCashToSubmit: totalCash - (doctorCashTotal + vendorCashTotal) },
        outstanding: { pendingInvoices: pendingInvoices.length, pendingAmount, creditGivenToday: 0, creditRecoveredToday: 0 },
        transactionCount: payments.length + doctorSettlements.length + vendorPayments.length, invoiceCount: payments.length, paymentCount: payments.length,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
