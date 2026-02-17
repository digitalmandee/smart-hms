import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export interface OPDDashboardStats {
  totalPatients: number;
  completedConsultations: number;
  inQueue: number;
  revenueToday: number;
  hourlyFlow: { hour: number; count: number }[];
  recentConsultations: any[];
  doctorPerformance: {
    doctorName: string;
    patientsSeen: number;
    revenue: number;
  }[];
  revenueBreakdown: {
    paid: number;
    pending: number;
    waived: number;
  };
}

export function useOPDDashboardStats() {
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["opd-dashboard-stats", profile?.organization_id, today],
    queryFn: async (): Promise<OPDDashboardStats> => {
      const orgId = profile!.organization_id!;
      const branchId = profile?.branch_id;

      // Fetch today's appointments
      let apptQuery = supabase
        .from("appointments")
        .select("id, status, doctor_id, check_in_at, created_at, appointment_time, opd_department_id, invoice_id")
        .eq("organization_id", orgId)
        .eq("appointment_date", today);
      if (branchId) apptQuery = apptQuery.eq("branch_id", branchId);
      const { data: appointments } = await apptQuery;

      // Fetch today's invoices for revenue (no doctor_id on invoices)
      let invQuery = supabase
        .from("invoices")
        .select("id, total_amount, paid_amount, status")
        .eq("organization_id", orgId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);
      if (branchId) invQuery = invQuery.eq("branch_id", branchId);
      const { data: invoices } = await invQuery;

      // Fetch doctors for names
      const doctorIds = [...new Set((appointments || []).map(a => a.doctor_id).filter(Boolean))];
      let doctorMap: Record<string, string> = {};
      if (doctorIds.length > 0) {
        const { data: doctors } = await supabase
          .from("doctors")
          .select("id, profiles(full_name)")
          .in("id", doctorIds as string[]);
        doctors?.forEach((d: any) => {
          doctorMap[d.id] = d.profiles?.full_name || "Unknown";
        });
      }

      const appts = appointments || [];
      const invs = invoices || [];

      // Stats
      const totalPatients = appts.length;
      const completedConsultations = appts.filter(a => a.status === "completed").length;
      const inQueue = appts.filter(a => ["checked_in", "in_progress"].includes(a.status || "")).length;
      
      const revenueToday = invs.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);

      // Hourly flow
      const hourlyMap: Record<number, number> = {};
      for (let h = 8; h <= 20; h++) hourlyMap[h] = 0;
      appts.forEach(a => {
        const time = a.appointment_time || a.created_at;
        if (time) {
          const hour = parseInt(time.substring(0, 2)) || new Date(time).getHours();
          if (hourlyMap[hour] !== undefined) hourlyMap[hour]++;
          else hourlyMap[hour] = 1;
        }
      });
      const hourlyFlow = Object.entries(hourlyMap).map(([h, c]) => ({ hour: Number(h), count: c }));

      // Doctor performance - use appointments to count, and link invoices via appointment.invoice_id
      const docStats: Record<string, { patientsSeen: number; revenue: number }> = {};
      const invoiceMap = new Map(invs.map(inv => [inv.id, inv]));
      
      appts.forEach(a => {
        if (a.doctor_id) {
          if (!docStats[a.doctor_id]) docStats[a.doctor_id] = { patientsSeen: 0, revenue: 0 };
          docStats[a.doctor_id].patientsSeen++;
          // Link revenue via invoice_id
          if (a.invoice_id) {
            const inv = invoiceMap.get(a.invoice_id);
            if (inv) {
              docStats[a.doctor_id].revenue += Number(inv.paid_amount) || 0;
            }
          }
        }
      });
      
      const doctorPerformance = Object.entries(docStats)
        .map(([id, stats]) => ({ doctorName: doctorMap[id] || "Unknown", ...stats }))
        .sort((a, b) => b.patientsSeen - a.patientsSeen);

      // Revenue breakdown
      const paid = invs.filter(i => i.status === "paid").reduce((s, i) => s + (Number(i.paid_amount) || 0), 0);
      const pending = invs.filter(i => ["pending", "partially_paid"].includes(i.status || "")).reduce((s, i) => s + (Number(i.total_amount) || 0) - (Number(i.paid_amount) || 0), 0);
      const waived = invs.filter(i => i.status === "cancelled").reduce((s, i) => s + (Number(i.total_amount) || 0), 0);

      // Recent consultations
      // @ts-ignore - deep type instantiation
      const { data: recentConsults } = await supabase
        .from("consultations")
        .select("id, status, created_at, appointments(id, patient_id, patients(first_name, last_name)), doctor:doctors(profiles(full_name))")
        .eq("organization_id", orgId)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false })
        .limit(10);

      return {
        totalPatients,
        completedConsultations,
        inQueue,
        revenueToday,
        hourlyFlow,
        recentConsultations: recentConsults || [],
        doctorPerformance,
        revenueBreakdown: { paid, pending, waived },
      };
    },
    enabled: !!profile?.organization_id,
    refetchInterval: 60000,
  });
}
