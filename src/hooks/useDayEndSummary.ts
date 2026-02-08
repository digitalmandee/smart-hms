/**
 * Hook for fetching comprehensive day-end financial summary
 * Includes invoices created, department breakdown from service_types, and credit tracking
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfDay, endOfDay } from "date-fns";

export interface PaymentByMethod { method: string; amount: number; count: number; isCash: boolean; }
export interface PaymentByDepartment { department: string; amount: number; count: number; }
export interface DoctorSettlementItem { id: string; doctorName: string; amount: number; settlementNumber: string; paymentMethod: string | null; referenceNumber: string | null; }
export interface VendorPaymentItem { id: string; vendorName: string; amount: number; paymentNumber: string; paymentMethod: string | null; referenceNumber: string | null; }
export interface ExpenseItem { id: string; description: string; amount: number; category: string | null; paidTo: string | null; expenseNumber?: string; }

export interface InvoiceCreatedToday {
  id: string;
  invoiceNumber: string;
  patientName: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  createdByName: string | null;
  createdAt: string;
  departments: string[];
}

export interface DayEndSummary {
  date: string;
  branchId: string | null;
  branchName: string | null;
  // NEW: Invoices section
  invoices: {
    created: InvoiceCreatedToday[];
    totalCount: number;
    totalAmount: number;
    paidCount: number;
    paidAmount: number;
    pendingCount: number;
    pendingAmount: number;
    partialCount: number;
    byDepartment: PaymentByDepartment[];
  };
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

      // 1. Fetch invoices created today with patient and creator info
      // @ts-ignore - Supabase types cause deep instantiation error
      const invoicesRes = await supabase
        .from("invoices")
        .select(`
          id, invoice_number, total_amount, paid_amount, status, created_at, created_by,
          patient:patients!invoices_patient_id_fkey(first_name, last_name)
        `)
        .eq("organization_id", orgId)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .neq("status", "cancelled");

      // 2. Fetch invoice items for department breakdown (for today's invoices)
      // @ts-ignore - Supabase types cause deep instantiation error
      const invoiceItemsRes = await supabase
        .from("invoice_items")
        .select(`
          id, total_price, invoice_id,
          service_type:service_types(id, category, name)
        `)
        .eq("organization_id", orgId);

      // 3. Fetch payments made today with invoice info for credit recovery tracking
      // @ts-ignore - Supabase types cause deep instantiation error
      const paymentsRes = await supabase
        .from("payments")
        .select(`
          id, amount, payment_method_id, created_at, invoice_id,
          invoice:invoices!payments_invoice_id_fkey(id, created_at, organization_id)
        `)
        .eq("organization_id", orgId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      // 4. Fetch profiles for created_by names
      // @ts-ignore - Supabase types cause deep instantiation error
      const profilesRes = await supabase.from("profiles").select("id, full_name");

      // 5. Other queries (doctor settlements, vendor payments, expenses, pending invoices, payment methods)
      // @ts-ignore - Supabase types cause deep instantiation error
      const dsRes = await supabase.from("doctor_settlements").select("*").eq("organization_id", orgId).eq("settlement_date", dateStr);
      // @ts-ignore - Supabase types cause deep instantiation error - FIX: Filter by payment_date
      const vpRes = await supabase.from("vendor_payments").select("*").eq("organization_id", orgId).eq("payment_date", dateStr);
      // @ts-ignore - Supabase types cause deep instantiation error - NEW: Fetch expenses for the date
      const expensesRes = await supabase
        .from("expenses")
        .select("*, created_by_profile:profiles!expenses_created_by_fkey(full_name)")
        .eq("organization_id", orgId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);
      // @ts-ignore - Supabase types cause deep instantiation error
      const pendingInvRes = await supabase.from("invoices").select("id, total_amount, paid_amount").eq("organization_id", orgId).in("status", ["pending", "partially_paid"]);
      // @ts-ignore - Supabase types cause deep instantiation error
      const pmRes = await supabase.from("payment_methods").select("*").eq("organization_id", orgId);

      const invoices = (invoicesRes.data || []) as any[];
      const invoiceItems = (invoiceItemsRes.data || []) as any[];
      const payments = (paymentsRes.data || []) as any[];
      const profiles = (profilesRes.data || []) as any[];
      const doctorSettlements = (dsRes.data || []) as any[];
      const vendorPayments = (vpRes.data || []) as any[];
      const expenses = (expensesRes.data || []) as any[];
      const pendingInvoices = (pendingInvRes.data || []) as any[];
      const paymentMethods = (pmRes.data || []) as any[];

      // Create lookup maps
      const profileLookup = new Map<string, string>();
      profiles.forEach((p) => profileLookup.set(p.id, p.full_name || "Unknown"));

      const methodLookup = new Map<string, { name: string; isCash: boolean }>();
      paymentMethods.forEach((pm) => methodLookup.set(pm.id, { name: pm.name, isCash: pm.code?.toLowerCase() === "cash" || pm.name?.toLowerCase() === "cash" }));

      // Get today's invoice IDs for filtering invoice items
      const todayInvoiceIds = new Set(invoices.map((inv) => inv.id));

      // Group invoice items by invoice_id and category
      const invoiceItemsByInvoice = new Map<string, any[]>();
      invoiceItems.forEach((item) => {
        if (todayInvoiceIds.has(item.invoice_id)) {
          const existing = invoiceItemsByInvoice.get(item.invoice_id) || [];
          existing.push(item);
          invoiceItemsByInvoice.set(item.invoice_id, existing);
        }
      });

      // Calculate department breakdown from invoice items (billing/invoiced amounts)
      const departmentMap = new Map<string, { amount: number; count: number }>();
      invoiceItems.forEach((item) => {
        if (todayInvoiceIds.has(item.invoice_id)) {
          const category = item.service_type?.category || "Other";
          const formatted = formatCategoryName(category);
          const existing = departmentMap.get(formatted) || { amount: 0, count: 0 };
          existing.amount += Number(item.total_price) || 0;
          existing.count += 1;
          departmentMap.set(formatted, existing);
        }
      });

      // Build invoices created today with department info
      const invoicesCreated: InvoiceCreatedToday[] = invoices.map((inv) => {
        const items = invoiceItemsByInvoice.get(inv.id) || [];
        const departments = [...new Set(items.map((i) => formatCategoryName(i.service_type?.category || "Other")))];
        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number || "-",
          patientName: inv.patient ? `${inv.patient.first_name || ""} ${inv.patient.last_name || ""}`.trim() : "Unknown",
          totalAmount: Number(inv.total_amount) || 0,
          paidAmount: Number(inv.paid_amount) || 0,
          status: inv.status || "pending",
          createdByName: inv.created_by ? profileLookup.get(inv.created_by) || null : null,
          createdAt: inv.created_at,
          departments,
        };
      });

      // Invoice summary stats
      const paidInvoices = invoicesCreated.filter((inv) => inv.status === "paid");
      const pendingTodayInvoices = invoicesCreated.filter((inv) => inv.status === "pending");
      const partialInvoices = invoicesCreated.filter((inv) => inv.status === "partially_paid");

      // Payment method aggregation
      const methodAggMap = new Map<string, { amount: number; count: number; isCash: boolean }>();
      let totalCash = 0, totalNonCash = 0;
      payments.forEach((p) => {
        const method = p.payment_method_id ? methodLookup.get(p.payment_method_id) : null;
        const methodName = method?.name || "Cash";
        const isCash = method?.isCash ?? true;
        const existing = methodAggMap.get(methodName) || { amount: 0, count: 0, isCash };
        existing.amount += Number(p.amount) || 0;
        existing.count += 1;
        methodAggMap.set(methodName, existing);
        if (isCash) totalCash += Number(p.amount) || 0; else totalNonCash += Number(p.amount) || 0;
      });

      // Calculate credit given today (unpaid portion of today's invoices)
      const creditGivenToday = invoicesCreated
        .filter((inv) => inv.status !== "paid")
        .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

      // Calculate credit recovered today (payments for invoices created before today)
      const creditRecoveredToday = payments
        .filter((p) => {
          if (!p.invoice?.created_at) return false;
          return new Date(p.invoice.created_at) < startOfDay(date);
        })
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      // Doctor settlements processing
      let doctorTotal = 0, doctorCashTotal = 0;
      const doctorItems: DoctorSettlementItem[] = doctorSettlements.map((s) => {
        const amount = Number(s.total_amount) || 0;
        doctorTotal += amount;
        if (s.payment_method?.toLowerCase().includes("cash") ?? true) doctorCashTotal += amount;
        return { id: s.id, doctorName: "Doctor", amount, settlementNumber: s.settlement_number || "-", paymentMethod: s.payment_method, referenceNumber: s.reference_number };
      });

      // Vendor payments processing
      let vendorTotal = 0, vendorCashTotal = 0;
      const vendorItems: VendorPaymentItem[] = vendorPayments.map((vp) => {
        const amount = Number(vp.amount) || 0;
        vendorTotal += amount;
        const pm = vp.payment_method_id ? methodLookup.get(vp.payment_method_id) : null;
        if (pm?.isCash) vendorCashTotal += amount;
        return { id: vp.id, vendorName: "Vendor", amount, paymentNumber: vp.payment_number || "-", paymentMethod: pm?.name || null, referenceNumber: vp.reference_number };
      });

      // Expenses processing
      let expenseTotal = 0;
      const expenseItems: ExpenseItem[] = expenses.map((exp) => {
        const amount = Number(exp.amount) || 0;
        expenseTotal += amount;
        return {
          id: exp.id,
          description: exp.description,
          amount,
          category: exp.category,
          paidTo: exp.paid_to,
          expenseNumber: exp.expense_number,
        };
      });

      // Outstanding amount
      const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount || 0)), 0);

      return {
        date: dateStr, branchId: branchId || null, branchName: null,
        invoices: {
          created: invoicesCreated,
          totalCount: invoicesCreated.length,
          totalAmount: invoicesCreated.reduce((sum, inv) => sum + inv.totalAmount, 0),
          paidCount: paidInvoices.length,
          paidAmount: paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          pendingCount: pendingTodayInvoices.length,
          pendingAmount: pendingTodayInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0),
          partialCount: partialInvoices.length,
          byDepartment: Array.from(departmentMap.entries()).map(([department, d]) => ({ department, amount: d.amount, count: d.count })),
        },
        collections: {
          byMethod: Array.from(methodAggMap.entries()).map(([method, d]) => ({ method, amount: d.amount, count: d.count, isCash: d.isCash })),
          byDepartment: Array.from(departmentMap.entries()).map(([department, d]) => ({ department, amount: d.amount, count: d.count })),
          totalCash, totalNonCash, grandTotal: totalCash + totalNonCash
        },
        payouts: {
          doctorSettlements: { total: doctorTotal, cashTotal: doctorCashTotal, items: doctorItems },
          vendorPayments: { total: vendorTotal, cashTotal: vendorCashTotal, items: vendorItems },
          expenses: { total: expenseTotal, items: expenseItems },
          totalPayouts: doctorTotal + vendorTotal + expenseTotal,
          totalCashPayouts: doctorCashTotal + vendorCashTotal + expenseTotal
        },
        reconciliation: { totalCashCollected: totalCash, cashPayouts: doctorCashTotal + vendorCashTotal + expenseTotal, netCashToSubmit: totalCash - (doctorCashTotal + vendorCashTotal + expenseTotal) },
        outstanding: { pendingInvoices: pendingInvoices.length, pendingAmount, creditGivenToday, creditRecoveredToday },
        transactionCount: payments.length + doctorSettlements.length + vendorPayments.length,
        invoiceCount: invoicesCreated.length,
        paymentCount: payments.length,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// Helper function to format category names nicely
function formatCategoryName(category: string): string {
  if (!category) return "Other";
  // Handle common category codes
  const categoryMap: Record<string, string> = {
    consultation: "Consultation",
    lab: "Laboratory",
    laboratory: "Laboratory",
    radiology: "Radiology",
    pharmacy: "Pharmacy",
    procedure: "Procedure",
    surgery: "Surgery",
    room: "Room Charges",
    bed: "Room Charges",
    ipd: "IPD",
    opd: "OPD",
    other: "Other",
  };
  const lower = category.toLowerCase();
  return categoryMap[lower] || category.charAt(0).toUpperCase() + category.slice(1);
}
