import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, differenceInDays, format } from "date-fns";

interface BedOccupancyData {
  ward_name: string;
  ward_id: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
}

interface AdmissionStats {
  date: string;
  admissions: number;
  discharges: number;
  emergency: number;
  routine: number;
}

interface WardCensus {
  ward_id: string;
  ward_name: string;
  bed_type: string;
  total_beds: number;
  occupied: number;
  available: number;
  patients: {
    patient_name: string;
    bed_number: string;
    admission_date: string;
    doctor_name: string;
  }[];
}

interface DischargeData {
  date: string;
  discharge_type: string;
  count: number;
  avg_los: number;
}

interface LOSData {
  department: string;
  avg_los: number;
  min_los: number;
  max_los: number;
  patient_count: number;
}

export function useBedOccupancyReport() {
  return useQuery({
    queryKey: ["ipd-bed-occupancy"],
    queryFn: async () => {
      // Get all wards with bed counts
      const { data: wards, error: wardError } = await supabase
        .from("wards")
        .select(`
          id,
          name,
          beds (
            id,
            status,
            bed_number
          )
        `)
        .eq("is_active", true);

      if (wardError) throw wardError;

      const occupancyData: BedOccupancyData[] = (wards || []).map((ward: any) => {
        const beds = ward.beds || [];
        const totalBeds = beds.length;
        const occupiedBeds = beds.filter((b: any) => b.status === "occupied").length;
        const availableBeds = beds.filter((b: any) => b.status === "available").length;

        return {
          ward_name: ward.name,
          ward_id: ward.id,
          total_beds: totalBeds,
          occupied_beds: occupiedBeds,
          available_beds: availableBeds,
          occupancy_rate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        };
      });

      const totals = occupancyData.reduce(
        (acc, ward) => ({
          total_beds: acc.total_beds + ward.total_beds,
          occupied_beds: acc.occupied_beds + ward.occupied_beds,
          available_beds: acc.available_beds + ward.available_beds,
        }),
        { total_beds: 0, occupied_beds: 0, available_beds: 0 }
      );

      return {
        byWard: occupancyData,
        totals: {
          ...totals,
          occupancy_rate: totals.total_beds > 0 
            ? Math.round((totals.occupied_beds / totals.total_beds) * 100) 
            : 0,
        },
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useAdmissionStatistics(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["ipd-admission-stats", dateFrom, dateTo],
    queryFn: async () => {
      const { data: admissions, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_date,
          admission_type,
          status,
          actual_discharge_date
        `)
        .gte("admission_date", dateFrom)
        .lte("admission_date", dateTo);

      if (error) throw error;

      // Group by date
      const statsByDate: Record<string, AdmissionStats> = {};

      admissions?.forEach((adm) => {
        const date = adm.admission_date;
        if (!statsByDate[date]) {
          statsByDate[date] = {
            date,
            admissions: 0,
            discharges: 0,
            emergency: 0,
            routine: 0,
          };
        }
        statsByDate[date].admissions++;
        if (adm.admission_type === "emergency") {
          statsByDate[date].emergency++;
        } else {
          statsByDate[date].routine++;
        }
      });

      // Add discharge data
      const { data: discharges } = await supabase
        .from("admissions")
        .select("actual_discharge_date")
        .gte("actual_discharge_date", dateFrom)
        .lte("actual_discharge_date", dateTo)
        .not("actual_discharge_date", "is", null);

      discharges?.forEach((d) => {
        const date = d.actual_discharge_date;
        if (date && statsByDate[date]) {
          statsByDate[date].discharges++;
        } else if (date) {
          statsByDate[date] = {
            date,
            admissions: 0,
            discharges: 1,
            emergency: 0,
            routine: 0,
          };
        }
      });

      return Object.values(statsByDate).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWardCensus() {
  return useQuery({
    queryKey: ["ipd-ward-census"],
    queryFn: async () => {
      const { data: wards, error } = await supabase
        .from("wards")
        .select(`
          id,
          name,
          ward_type,
          beds (
            id,
            bed_number,
            bed_type,
            status,
            current_admission_id
          )
        `)
        .eq("is_active", true);

      if (error) throw error;

      // Get current admissions for occupied beds
      const occupiedBedIds = (wards || [])
        .flatMap((w: any) => w.beds || [])
        .filter((b: any) => b.current_admission_id)
        .map((b: any) => b.current_admission_id);

      let admissionsMap: Record<string, any> = {};
      if (occupiedBedIds.length > 0) {
        const { data: admissions } = await supabase
          .from("admissions")
          .select(`
            id,
            admission_date,
            patient:patients(first_name, last_name),
            attending_doctor:doctors(profiles(full_name))
          `)
          .in("id", occupiedBedIds);

        admissions?.forEach((adm: any) => {
          admissionsMap[adm.id] = adm;
        });
      }

      const census: WardCensus[] = (wards || []).map((ward: any) => {
        const beds = ward.beds || [];
        const occupied = beds.filter((b: any) => b.status === "occupied");

        return {
          ward_id: ward.id,
          ward_name: ward.name,
          bed_type: ward.ward_type || "General",
          total_beds: beds.length,
          occupied: occupied.length,
          available: beds.filter((b: any) => b.status === "available").length,
          patients: occupied.map((bed: any) => {
            const adm = admissionsMap[bed.current_admission_id];
            return {
              patient_name: adm?.patient 
                ? `${adm.patient.first_name} ${adm.patient.last_name}`
                : "Unknown",
              bed_number: bed.bed_number,
              admission_date: adm?.admission_date || "",
              doctor_name: adm?.attending_doctor?.profiles?.full_name || "Not Assigned",
            };
          }),
        };
      });

      return census;
    },
    staleTime: 60 * 1000,
  });
}

export function useAverageLOS(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["ipd-average-los", dateFrom, dateTo],
    queryFn: async () => {
      const { data: admissions, error } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_date,
          actual_discharge_date,
          ward:wards(name)
        `)
        .not("actual_discharge_date", "is", null)
        .gte("actual_discharge_date", dateFrom)
        .lte("actual_discharge_date", dateTo);

      if (error) throw error;

      // Calculate LOS by ward
      const losByWard: Record<string, { total_days: number; count: number; min: number; max: number }> = {};

      admissions?.forEach((adm: any) => {
        const wardName = adm.ward?.name || "Unknown";
        const admissionDate = new Date(adm.admission_date);
        const dischargeDate = new Date(adm.actual_discharge_date);
        const los = differenceInDays(dischargeDate, admissionDate) || 1;

        if (!losByWard[wardName]) {
          losByWard[wardName] = { total_days: 0, count: 0, min: Infinity, max: 0 };
        }
        losByWard[wardName].total_days += los;
        losByWard[wardName].count++;
        losByWard[wardName].min = Math.min(losByWard[wardName].min, los);
        losByWard[wardName].max = Math.max(losByWard[wardName].max, los);
      });

      const result: LOSData[] = Object.entries(losByWard).map(([dept, data]) => ({
        department: dept,
        avg_los: data.count > 0 ? Math.round((data.total_days / data.count) * 10) / 10 : 0,
        min_los: data.min === Infinity ? 0 : data.min,
        max_los: data.max,
        patient_count: data.count,
      }));

      // Calculate overall average
      const totalDays = Object.values(losByWard).reduce((sum, d) => sum + d.total_days, 0);
      const totalPatients = Object.values(losByWard).reduce((sum, d) => sum + d.count, 0);
      const overallAvgLOS = totalPatients > 0 ? Math.round((totalDays / totalPatients) * 10) / 10 : 0;

      return {
        byDepartment: result.sort((a, b) => b.avg_los - a.avg_los),
        overall: {
          avg_los: overallAvgLOS,
          total_patients: totalPatients,
          total_bed_days: totalDays,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDailyMovement(date: string) {
  return useQuery({
    queryKey: ["ipd-daily-movement", date],
    queryFn: async () => {
      // Get admissions for the date
      const { data: admissions } = await supabase
        .from("admissions")
        .select(`
          id,
          admission_type,
          ward:wards(name),
          patient:patients(first_name, last_name)
        `)
        .eq("admission_date", date);

      // Get discharges for the date
      const { data: discharges } = await supabase
        .from("admissions")
        .select(`
          id,
          discharge_type,
          ward:wards(name),
          patient:patients(first_name, last_name)
        `)
        .eq("actual_discharge_date", date);

      // Get transfers for the date
      const { data: transfers } = await supabase
        .from("bed_transfers")
        .select(`
          id,
          from_ward:wards!bed_transfers_from_ward_id_fkey(name),
          to_ward:wards!bed_transfers_to_ward_id_fkey(name),
          admission:admissions(patient:patients(first_name, last_name))
        `)
        .gte("transferred_at", `${date}T00:00:00`)
        .lte("transferred_at", `${date}T23:59:59`);

      return {
        admissions: (admissions || []).map((a: any) => ({
          patient_name: a.patient ? `${a.patient.first_name} ${a.patient.last_name}` : "Unknown",
          ward: a.ward?.name || "Unknown",
          type: a.admission_type || "routine",
        })),
        discharges: (discharges || []).map((d: any) => ({
          patient_name: d.patient ? `${d.patient.first_name} ${d.patient.last_name}` : "Unknown",
          ward: d.ward?.name || "Unknown",
          type: d.discharge_type || "normal",
        })),
        transfers: (transfers || []).map((t: any) => ({
          patient_name: t.admission?.patient 
            ? `${t.admission.patient.first_name} ${t.admission.patient.last_name}` 
            : "Unknown",
          from_ward: t.from_ward?.name || "Unknown",
          to_ward: t.to_ward?.name || "Unknown",
        })),
        summary: {
          total_admissions: admissions?.length || 0,
          total_discharges: discharges?.length || 0,
          total_transfers: transfers?.length || 0,
          net_change: (admissions?.length || 0) - (discharges?.length || 0),
        },
      };
    },
    staleTime: 60 * 1000,
  });
}
