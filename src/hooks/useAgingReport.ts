import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AgingBucket {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90_plus: number;
}

export interface ARInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  patient_name: string;
  patient_id: string | null;
  total_amount: number;
  paid_amount: number;
  credit_notes_total: number;
  outstanding: number;
  days_outstanding: number;
  aging_bucket: string;
  department: string;
  status: string;
}

export interface InsuranceClaimAging {
  id: string;
  claim_number: string;
  submission_date: string | null;
  claim_date: string;
  insurer_name: string;
  patient_name: string;
  total_amount: number;
  approved_amount: number;
  paid_amount: number;
  outstanding: number;
  days_outstanding: number;
  aging_bucket: string;
  status: string;
}

export interface DepartmentAgingSummary {
  department: string;
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  days90_plus: number;
  total: number;
  count: number;
}

export interface TopDefaulter {
  patient_name: string;
  patient_id: string;
  total_invoices: number;
  total_outstanding: number;
  oldest_invoice_date: string;
  avg_days_outstanding: number;
}

function getDaysOutstanding(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function getBucket(days: number): string {
  if (days <= 0) return "Current";
  if (days <= 30) return "1-30 Days";
  if (days <= 60) return "31-60 Days";
  if (days <= 90) return "61-90 Days";
  return "90+ Days";
}

function inferDepartment(items: any[]): string {
  if (!items || items.length === 0) return "OPD";
  if (items.some((i: any) => i.bed_id)) return "IPD";
  if (items.some((i: any) => i.lab_order_id)) return "Laboratory";
  if (items.some((i: any) => i.medicine_inventory_id)) return "Pharmacy";
  return "OPD";
}

export function useAgingReport() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ["aging-report", orgId],
    queryFn: async () => {
      // 1. Fetch outstanding invoices
      const { data: invoices, error: invErr } = await supabase
        .from("invoices")
        .select(`
          id, invoice_number, invoice_date, total_amount, paid_amount, status,
          patient:patients(id, first_name, last_name)
        `)
        .eq("organization_id", orgId!)
        .in("status", ["pending", "partially_paid"])
        .order("invoice_date", { ascending: false });
      if (invErr) throw invErr;

      // 2. Fetch invoice_items for department inference
      const invoiceIds = (invoices || []).map(i => i.id);
      let itemsByInvoice: Record<string, any[]> = {};
      if (invoiceIds.length > 0) {
        // Batch in chunks of 100
        for (let i = 0; i < invoiceIds.length; i += 100) {
          const chunk = invoiceIds.slice(i, i + 100);
          const { data: items } = await supabase
            .from("invoice_items")
            .select("invoice_id, bed_id, lab_order_id, medicine_inventory_id, service_type_id")
            .in("invoice_id", chunk);
          (items || []).forEach((item: any) => {
            if (!itemsByInvoice[item.invoice_id]) itemsByInvoice[item.invoice_id] = [];
            itemsByInvoice[item.invoice_id].push(item);
          });
        }
      }

      // 3. Fetch approved credit notes per invoice
      const { data: creditNotes } = await supabase
        .from("credit_notes")
        .select("invoice_id, total_amount")
        .eq("organization_id", orgId!)
        .eq("status", "approved");

      const cnByInvoice: Record<string, number> = {};
      (creditNotes || []).forEach((cn: any) => {
        if (cn.invoice_id) {
          cnByInvoice[cn.invoice_id] = (cnByInvoice[cn.invoice_id] || 0) + (cn.total_amount || 0);
        }
      });

      // 4. Build AR invoices
      const arInvoices: ARInvoice[] = (invoices || []).map((inv: any) => {
        const cnTotal = cnByInvoice[inv.id] || 0;
        const outstanding = (inv.total_amount || 0) - (inv.paid_amount || 0) - cnTotal;
        const days = getDaysOutstanding(inv.invoice_date);
        const dept = inferDepartment(itemsByInvoice[inv.id] || []);
        return {
          id: inv.id,
          invoice_number: inv.invoice_number,
          invoice_date: inv.invoice_date,
          patient_name: inv.patient ? `${inv.patient.first_name} ${inv.patient.last_name}` : "Unknown",
          patient_id: inv.patient?.id || null,
          total_amount: inv.total_amount || 0,
          paid_amount: inv.paid_amount || 0,
          credit_notes_total: cnTotal,
          outstanding: Math.max(0, outstanding),
          days_outstanding: days,
          aging_bucket: getBucket(days),
          department: dept,
          status: inv.status,
        };
      }).filter(inv => inv.outstanding > 0);

      // 5. Insurance claims aging
      const { data: claims, error: clErr } = await supabase
        .from("insurance_claims")
        .select(`
          id, claim_number, claim_date, submission_date, total_amount, approved_amount, paid_amount, status,
          patient_insurance:patient_insurance(
            patient:patients(first_name, last_name),
            insurance_plan:insurance_plans(
              insurance_company:insurance_companies(name)
            )
          )
        `)
        .eq("organization_id", orgId!)
        .not("status", "in", '("paid","rejected","cancelled")');
      if (clErr) throw clErr;

      const insuranceClaims: InsuranceClaimAging[] = (claims || []).map((c: any) => {
        const outstanding = (c.total_amount || 0) - (c.paid_amount || 0);
        const ageDate = c.submission_date || c.claim_date;
        const days = getDaysOutstanding(ageDate);
        const pi = c.patient_insurance as any;
        return {
          id: c.id,
          claim_number: c.claim_number,
          submission_date: c.submission_date,
          claim_date: c.claim_date,
          insurer_name: pi?.insurance_company?.name || "Unknown",
          patient_name: pi?.patient ? `${pi.patient.first_name} ${pi.patient.last_name}` : "Unknown",
          total_amount: c.total_amount || 0,
          approved_amount: c.approved_amount || 0,
          paid_amount: c.paid_amount || 0,
          outstanding: Math.max(0, outstanding),
          days_outstanding: days,
          aging_bucket: getBucket(days),
          status: c.status || "pending",
        };
      }).filter(c => c.outstanding > 0);

      // 6. Department breakdown
      const deptMap: Record<string, DepartmentAgingSummary> = {};
      arInvoices.forEach(inv => {
        if (!deptMap[inv.department]) {
          deptMap[inv.department] = { department: inv.department, current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0, total: 0, count: 0 };
        }
        const d = deptMap[inv.department];
        d.total += inv.outstanding;
        d.count += 1;
        if (inv.days_outstanding <= 0) d.current += inv.outstanding;
        else if (inv.days_outstanding <= 30) d.days1_30 += inv.outstanding;
        else if (inv.days_outstanding <= 60) d.days31_60 += inv.outstanding;
        else if (inv.days_outstanding <= 90) d.days61_90 += inv.outstanding;
        else d.days90_plus += inv.outstanding;
      });
      const departmentBreakdown = Object.values(deptMap).sort((a, b) => b.total - a.total);

      // 7. Top defaulters (by patient)
      const patientMap: Record<string, { name: string; id: string; invoices: number; outstanding: number; oldest: string; totalDays: number }> = {};
      arInvoices.forEach(inv => {
        const key = inv.patient_id || inv.patient_name;
        if (!patientMap[key]) {
          patientMap[key] = { name: inv.patient_name, id: inv.patient_id || "", invoices: 0, outstanding: 0, oldest: inv.invoice_date, totalDays: 0 };
        }
        const p = patientMap[key];
        p.invoices += 1;
        p.outstanding += inv.outstanding;
        p.totalDays += inv.days_outstanding;
        if (new Date(inv.invoice_date) < new Date(p.oldest)) p.oldest = inv.invoice_date;
      });
      const topDefaulters: TopDefaulter[] = Object.values(patientMap)
        .map(p => ({
          patient_name: p.name,
          patient_id: p.id,
          total_invoices: p.invoices,
          total_outstanding: p.outstanding,
          oldest_invoice_date: p.oldest,
          avg_days_outstanding: Math.round(p.totalDays / p.invoices),
        }))
        .sort((a, b) => b.total_outstanding - a.total_outstanding)
        .slice(0, 20);

      // 8. AR Summary
      const totalAR = arInvoices.reduce((s, i) => s + i.outstanding, 0);
      const totalInsuranceAR = insuranceClaims.reduce((s, c) => s + c.outstanding, 0);
      const totalCreditApplied = Object.values(cnByInvoice).reduce((s, v) => s + v, 0);
      const overdueAR = arInvoices.filter(i => i.days_outstanding > 30).reduce((s, i) => s + i.outstanding, 0);
      const highRiskAR = arInvoices.filter(i => i.days_outstanding > 90).reduce((s, i) => s + i.outstanding, 0);
      const highRiskCount = arInvoices.filter(i => i.days_outstanding > 90).length;

      // Aging buckets for chart
      const arBuckets: AgingBucket = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0 };
      arInvoices.forEach(inv => {
        if (inv.days_outstanding <= 0) arBuckets.current += inv.outstanding;
        else if (inv.days_outstanding <= 30) arBuckets.days1_30 += inv.outstanding;
        else if (inv.days_outstanding <= 60) arBuckets.days31_60 += inv.outstanding;
        else if (inv.days_outstanding <= 90) arBuckets.days61_90 += inv.outstanding;
        else arBuckets.days90_plus += inv.outstanding;
      });

      return {
        arInvoices,
        insuranceClaims,
        departmentBreakdown,
        topDefaulters,
        arBuckets,
        summary: {
          totalAR,
          totalInsuranceAR,
          totalCreditApplied,
          overdueAR,
          highRiskAR,
          highRiskCount,
          topDefaulterAmount: topDefaulters[0]?.total_outstanding || 0,
        },
      };
    },
    enabled: !!orgId,
  });
}
