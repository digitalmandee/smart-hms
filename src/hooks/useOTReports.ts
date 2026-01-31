import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInMinutes, parseISO } from "date-fns";

interface SurgeryData {
  id: string;
  procedure_type: string | null;
  lead_surgeon_id: string | null;
  ot_room_id: string | null;
  priority: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: string | null;
  scheduled_date: string;
  surgery_charges: Record<string, any> | null;
  lead_surgeon: { id: string; profiles: { full_name: string } } | null;
  ot_room: { id: string; name: string } | null;
}

interface SurgeonStats {
  surgeon_id: string;
  surgeon_name: string;
  total_surgeries: number;
  completed: number;
  cancelled: number;
  avg_duration: number;
  total_revenue: number;
}

interface RoomStats {
  room_id: string;
  room_name: string;
  total_surgeries: number;
  total_hours: number;
  utilization_percent: number;
}

interface AnesthesiaStats {
  type: string;
  count: number;
  percentage: number;
}

export function useSurgeryStats(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["surgery-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: surgeries, error } = await supabase
        .from("surgeries")
        .select(`
          id, procedure_type, lead_surgeon_id, ot_room_id, priority,
          actual_start_time, actual_end_time, status, scheduled_date, surgery_charges,
          lead_surgeon:doctors!surgeries_lead_surgeon_id_fkey(id, profiles(full_name)),
          ot_room:ot_rooms(id, name)
        `)
        .gte("scheduled_date", dateFrom)
        .lte("scheduled_date", dateTo);

      if (error) throw error;

      const typedSurgeries = (surgeries || []) as unknown as SurgeryData[];

      // Calculate stats
      const totalSurgeries = typedSurgeries.length;
      const completedSurgeries = typedSurgeries.filter(s => s.status === "completed").length;
      const cancelledSurgeries = typedSurgeries.filter(s => s.status === "cancelled").length;
      const emergencySurgeries = typedSurgeries.filter(s => s.priority === "emergency").length;
      const electiveSurgeries = typedSurgeries.filter(s => s.priority !== "emergency").length;

      // Calculate average duration
      const durationsMinutes = typedSurgeries
        .filter(s => s.actual_start_time && s.actual_end_time)
        .map(s => differenceInMinutes(parseISO(s.actual_end_time!), parseISO(s.actual_start_time!)));
      const avgDurationMinutes = durationsMinutes.length > 0
        ? Math.round(durationsMinutes.reduce((a, b) => a + b, 0) / durationsMinutes.length)
        : 0;

      // Aggregate by surgeon
      const surgeonMap = new Map<string, SurgeonStats>();
      typedSurgeries.forEach(s => {
        if (!s.lead_surgeon_id) return;
        const surgeonName = s.lead_surgeon?.profiles?.full_name || "Unknown";
        const existing = surgeonMap.get(s.lead_surgeon_id) || {
          surgeon_id: s.lead_surgeon_id,
          surgeon_name: surgeonName,
          total_surgeries: 0,
          completed: 0,
          cancelled: 0,
          avg_duration: 0,
          total_revenue: 0,
        };
        existing.total_surgeries++;
        if (s.status === "completed") existing.completed++;
        if (s.status === "cancelled") existing.cancelled++;
        if (s.surgery_charges) {
          existing.total_revenue += (Number(s.surgery_charges.surgeon_fee) || 0) +
            (Number(s.surgery_charges.anesthesia_fee) || 0) +
            (Number(s.surgery_charges.ot_charges) || 0);
        }
        surgeonMap.set(s.lead_surgeon_id, existing);
      });
      const bySurgeon = Array.from(surgeonMap.values()).sort((a, b) => b.total_surgeries - a.total_surgeries);

      // Aggregate by OT room
      const roomMap = new Map<string, RoomStats>();
      typedSurgeries.forEach(s => {
        if (!s.ot_room_id) return;
        const roomName = s.ot_room?.name || "Unknown";
        const existing = roomMap.get(s.ot_room_id) || {
          room_id: s.ot_room_id,
          room_name: roomName,
          total_surgeries: 0,
          total_hours: 0,
          utilization_percent: 0,
        };
        existing.total_surgeries++;
        if (s.actual_start_time && s.actual_end_time) {
          existing.total_hours += differenceInMinutes(parseISO(s.actual_end_time), parseISO(s.actual_start_time)) / 60;
        }
        roomMap.set(s.ot_room_id, existing);
      });
      // Calculate utilization (assuming 10 working hours per day)
      const workingDays = Math.max(1, Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)));
      const maxHoursPerRoom = workingDays * 10;
      const byRoom = Array.from(roomMap.values()).map(r => ({
        ...r,
        total_hours: Math.round(r.total_hours * 10) / 10,
        utilization_percent: Math.round((r.total_hours / maxHoursPerRoom) * 100),
      })).sort((a, b) => b.total_surgeries - a.total_surgeries);

      // Aggregate by priority (used as a proxy for anesthesia type in this context)
      const priorityMap = new Map<string, number>();
      typedSurgeries.forEach(s => {
        const type = s.priority || "routine";
        priorityMap.set(type, (priorityMap.get(type) || 0) + 1);
      });
      const byAnesthesia: AnesthesiaStats[] = Array.from(priorityMap.entries()).map(([type, count]) => ({
        type,
        count,
        percentage: totalSurgeries > 0 ? Math.round((count / totalSurgeries) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      // Surgery type breakdown
      const typeMap = new Map<string, number>();
      typedSurgeries.forEach(s => {
        const type = s.procedure_type || "Other";
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
      const byType = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        count,
        percentage: totalSurgeries > 0 ? Math.round((count / totalSurgeries) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      // Daily trend
      const dailyMap = new Map<string, { date: string; count: number; completed: number; cancelled: number }>();
      typedSurgeries.forEach(s => {
        const date = s.scheduled_date;
        const existing = dailyMap.get(date) || { date, count: 0, completed: 0, cancelled: 0 };
        existing.count++;
        if (s.status === "completed") existing.completed++;
        if (s.status === "cancelled") existing.cancelled++;
        dailyMap.set(date, existing);
      });
      const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      return {
        summary: {
          totalSurgeries,
          completedSurgeries,
          cancelledSurgeries,
          emergencySurgeries,
          electiveSurgeries,
          avgDurationMinutes,
          completionRate: totalSurgeries > 0 ? Math.round((completedSurgeries / totalSurgeries) * 100) : 0,
        },
        bySurgeon,
        byRoom,
        byAnesthesia,
        byType,
        dailyTrend,
      };
    },
  });
}

export function useOTRoomUtilization(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["ot-room-utilization", dateFrom, dateTo],
    queryFn: async () => {
      const { data: rooms, error: roomsError } = await supabase
        .from("ot_rooms")
        .select("id, name, status, is_active")
        .eq("is_active", true);

      if (roomsError) throw roomsError;

      const { data: surgeries, error: surgeriesError } = await supabase
        .from("surgeries")
        .select("id, ot_room_id, actual_start_time, actual_end_time, status")
        .gte("scheduled_date", dateFrom)
        .lte("scheduled_date", dateTo)
        .eq("status", "completed");

      if (surgeriesError) throw surgeriesError;

      const roomUtilization = (rooms || []).map(room => {
        const roomSurgeries = (surgeries || []).filter(s => s.ot_room_id === room.id);
        const totalHours = roomSurgeries.reduce((acc, s) => {
          if (s.actual_start_time && s.actual_end_time) {
            return acc + differenceInMinutes(parseISO(s.actual_end_time), parseISO(s.actual_start_time)) / 60;
          }
          return acc;
        }, 0);
        
        const workingDays = Math.max(1, Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)));
        const maxHours = workingDays * 10; // 10 working hours per day
        
        return {
          room_id: room.id,
          room_name: room.name,
          surgery_count: roomSurgeries.length,
          total_hours: Math.round(totalHours * 10) / 10,
          utilization_percent: Math.round((totalHours / maxHours) * 100),
          status: room.status,
        };
      });

      return roomUtilization;
    },
  });
}
