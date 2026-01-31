import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours, parseISO } from "date-fns";

interface ImagingOrder {
  id: string;
  order_number: string;
  modality: string;
  procedure_name: string;
  status: string | null;
  priority: string | null;
  created_at: string;
  reported_at: string | null;
  verified_at: string | null;
  technician_id: string | null;
  procedure: { id: string; name: string; base_price: number } | null;
  technician: { id: string; full_name: string } | null;
}

interface ModalityStats {
  modality_id: string;
  modality_name: string;
  modality_code: string;
  total_orders: number;
  completed: number;
  pending: number;
  avg_tat_hours: number;
  revenue: number;
}

interface TechnicianStats {
  technician_id: string;
  technician_name: string;
  total_performed: number;
  avg_tat_hours: number;
}

export function useImagingStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["imaging-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("imaging_orders")
        .select(`
          id, order_number, modality, procedure_name, status, priority, 
          created_at, reported_at, verified_at, technician_id,
          procedure:imaging_procedures(id, name, base_price),
          technician:profiles!imaging_orders_technician_id_fkey(id, full_name)
        `)
        .gte("created_at", `${dateFrom}T00:00:00`)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      const typedOrders = (orders || []) as unknown as ImagingOrder[];

      // Summary stats
      const totalOrders = typedOrders.length;
      const completedOrders = typedOrders.filter(o => o.status === "completed" || o.status === "verified").length;
      const pendingOrders = typedOrders.filter(o => o.status === "pending" || o.status === "scheduled").length;
      const inProgressOrders = typedOrders.filter(o => o.status === "in_progress" || o.status === "performed").length;
      const pendingReports = typedOrders.filter(o => o.status === "performed").length;

      // Calculate average TAT (order to report)
      const completedWithTAT = typedOrders.filter(o => o.reported_at);
      const tatHours = completedWithTAT.map(o => differenceInHours(parseISO(o.reported_at!), parseISO(o.created_at)));
      const avgTATHours = tatHours.length > 0 ? Math.round(tatHours.reduce((a, b) => a + b, 0) / tatHours.length) : 0;

      // Aggregate by modality (using the enum field directly)
      const modalityMap = new Map<string, ModalityStats>();
      typedOrders.forEach(o => {
        const modalityKey = o.modality || "unknown";
        const existing = modalityMap.get(modalityKey) || {
          modality_id: modalityKey,
          modality_name: formatModalityName(modalityKey),
          modality_code: modalityKey.toUpperCase(),
          total_orders: 0,
          completed: 0,
          pending: 0,
          avg_tat_hours: 0,
          revenue: 0,
        };
        existing.total_orders++;
        if (o.status === "completed" || o.status === "verified") existing.completed++;
        if (o.status === "pending" || o.status === "scheduled") existing.pending++;
        if (o.procedure) existing.revenue += o.procedure.base_price || 0;
        modalityMap.set(modalityKey, existing);
      });
      const byModality = Array.from(modalityMap.values()).sort((a, b) => b.total_orders - a.total_orders);

      // Aggregate by technician
      const techMap = new Map<string, TechnicianStats>();
      typedOrders.filter(o => o.technician && (o.status === "performed" || o.status === "completed" || o.status === "verified")).forEach(o => {
        const key = o.technician_id!;
        const existing = techMap.get(key) || {
          technician_id: key,
          technician_name: o.technician!.full_name,
          total_performed: 0,
          avg_tat_hours: 0,
        };
        existing.total_performed++;
        techMap.set(key, existing);
      });
      const byTechnician = Array.from(techMap.values()).sort((a, b) => b.total_performed - a.total_performed);

      // Priority breakdown
      const priorityMap = new Map<string, number>();
      typedOrders.forEach(o => {
        const priority = o.priority || "routine";
        priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
      });
      const byPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
      }));

      // Daily trend
      const dailyMap = new Map<string, { date: string; orders: number; completed: number }>();
      typedOrders.forEach(o => {
        const date = o.created_at.split("T")[0];
        const existing = dailyMap.get(date) || { date, orders: 0, completed: 0 };
        existing.orders++;
        if (o.status === "completed" || o.status === "verified") existing.completed++;
        dailyMap.set(date, existing);
      });
      const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      // Revenue calculation
      const totalRevenue = typedOrders.reduce((acc, o) => acc + (o.procedure?.base_price || 0), 0);

      return {
        summary: {
          totalOrders,
          completedOrders,
          pendingOrders,
          inProgressOrders,
          pendingReports,
          avgTATHours,
          totalRevenue,
          completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        },
        byModality,
        byTechnician,
        byPriority,
        dailyTrend,
      };
    },
  });
}

function formatModalityName(modality: string): string {
  const names: Record<string, string> = {
    xray: "X-Ray",
    ct: "CT Scan",
    mri: "MRI",
    ultrasound: "Ultrasound",
    mammography: "Mammography",
    fluoroscopy: "Fluoroscopy",
    pet_ct: "PET-CT",
    dexa: "DEXA Scan",
    angiography: "Angiography",
    echocardiography: "Echocardiography",
  };
  return names[modality] || modality.charAt(0).toUpperCase() + modality.slice(1).replace(/_/g, " ");
}

export function useModalityPerformance(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["modality-performance", dateFrom, dateTo],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("imaging_orders")
        .select("id, modality, status, created_at, reported_at")
        .gte("created_at", `${dateFrom}T00:00:00`)
        .lte("created_at", `${dateTo}T23:59:59`);

      if (error) throw error;

      // Group by modality
      const modalityMap = new Map<string, {
        modality: string;
        total_orders: number;
        completed_orders: number;
        pending_orders: number;
        tat_hours: number[];
      }>();

      (orders || []).forEach(o => {
        const modality = o.modality;
        const existing = modalityMap.get(modality) || {
          modality,
          total_orders: 0,
          completed_orders: 0,
          pending_orders: 0,
          tat_hours: [],
        };
        existing.total_orders++;
        if (o.status === "completed" || o.status === "verified") {
          existing.completed_orders++;
          if (o.reported_at) {
            existing.tat_hours.push(differenceInHours(parseISO(o.reported_at), parseISO(o.created_at)));
          }
        }
        if (o.status === "scheduled" || o.status === "ordered") existing.pending_orders++;
        modalityMap.set(modality, existing);
      });

      return Array.from(modalityMap.values()).map(m => ({
        modality_id: m.modality,
        modality_name: formatModalityName(m.modality),
        modality_code: m.modality.toUpperCase(),
        total_orders: m.total_orders,
        completed_orders: m.completed_orders,
        pending_orders: m.pending_orders,
        avg_tat_hours: m.tat_hours.length > 0 
          ? Math.round(m.tat_hours.reduce((a, b) => a + b, 0) / m.tat_hours.length) 
          : 0,
      })).filter(m => m.total_orders > 0);
    },
  });
}
