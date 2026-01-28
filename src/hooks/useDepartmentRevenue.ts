import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentType } from "@/components/reports/DepartmentFilter";
import { ShiftType, getShiftFromTime } from "@/components/reports/ShiftFilter";

export interface DepartmentRevenue {
  department: DepartmentType;
  departmentLabel: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface DepartmentRevenueDetail {
  id: string;
  invoice_number: string;
  invoice_date: string;
  patient_name: string;
  description: string;
  amount: number;
  department: string;
  created_at: string;
}

export function useDepartmentRevenue(dateFrom: string, dateTo: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["department-revenue", dateFrom, dateTo, branchId],
    queryFn: async (): Promise<{ summary: DepartmentRevenue[]; total: number }> => {
      // Fetch invoice items with service types and category info
      let query = supabase
        .from("invoice_items")
        .select(`
          id,
          description,
          total_price,
          service_type_id,
          invoice:invoices!invoice_items_invoice_id_fkey(
            id,
            invoice_date,
            created_at,
            status,
            branch_id
          ),
          service_type:service_types(
            id,
            category,
            name
          )
        `)
        .gte("invoice.invoice_date", dateFrom)
        .lte("invoice.invoice_date", dateTo)
        .neq("invoice.status", "cancelled");

      if (branchId && branchId !== "all") {
        query = query.eq("invoice.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by department/category
      const grouped: Record<string, { revenue: number; count: number }> = {};
      let total = 0;

      data?.forEach((item: any) => {
        if (!item.invoice) return; // Skip if no invoice data
        
        const category = item.service_type?.category || "other";
        const amount = Number(item.total_price || 0);
        
        if (!grouped[category]) {
          grouped[category] = { revenue: 0, count: 0 };
        }
        grouped[category].revenue += amount;
        grouped[category].count += 1;
        total += amount;
      });

      // Map to department labels
      const departmentLabels: Record<string, string> = {
        consultation: "Consultation",
        opd: "OPD Services",
        ipd: "IPD Services",
        lab: "Laboratory",
        radiology: "Radiology",
        pharmacy: "Pharmacy",
        surgery: "Surgery / OT",
        procedure: "Procedures",
        emergency: "Emergency",
        room: "Room Charges",
        other: "Other Services",
      };

      const summary: DepartmentRevenue[] = Object.entries(grouped)
        .map(([dept, data]) => ({
          department: dept as DepartmentType,
          departmentLabel: departmentLabels[dept] || dept,
          revenue: data.revenue,
          count: data.count,
          percentage: total > 0 ? (data.revenue / total) * 100 : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return { summary, total };
    },
    enabled: !!profile?.organization_id,
  });
}

export function useDepartmentRevenueDetails(
  dateFrom: string,
  dateTo: string,
  department: DepartmentType,
  branchId?: string
) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["department-revenue-details", dateFrom, dateTo, department, branchId],
    queryFn: async (): Promise<DepartmentRevenueDetail[]> => {
      let query = supabase
        .from("invoice_items")
        .select(`
          id,
          description,
          total_price,
          invoice:invoices!invoice_items_invoice_id_fkey(
            id,
            invoice_number,
            invoice_date,
            created_at,
            status,
            branch_id,
            patient:patients!invoices_patient_id_fkey(first_name, last_name)
          ),
          service_type:service_types(category, name)
        `)
        .gte("invoice.invoice_date", dateFrom)
        .lte("invoice.invoice_date", dateTo)
        .neq("invoice.status", "cancelled");

      if (branchId && branchId !== "all") {
        query = query.eq("invoice.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by department
      const filtered = data?.filter((item: any) => {
        if (!item.invoice) return false;
        const category = item.service_type?.category || "other";
        return department === "all" || category === department;
      }) || [];

      return filtered.map((item: any) => {
        const patient = item.invoice?.patient;
        return {
          id: item.id,
          invoice_number: item.invoice?.invoice_number || "-",
          invoice_date: item.invoice?.invoice_date || "-",
          patient_name: patient 
            ? `${patient.first_name} ${patient.last_name || ""}`.trim()
            : "Unknown",
          description: item.description,
          amount: Number(item.total_price || 0),
          department: item.service_type?.category || "other",
          created_at: item.invoice?.created_at || "",
        };
      });
    },
    enabled: !!profile?.organization_id && department !== "all",
  });
}
