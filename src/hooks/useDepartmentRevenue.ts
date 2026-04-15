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

/**
 * Now sources from General Ledger (journal_entry_lines) instead of raw invoice_items.
 * This ensures report totals always match GL balances.
 */
export function useDepartmentRevenue(dateFrom: string, dateTo: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["department-revenue", dateFrom, dateTo, branchId],
    queryFn: async (): Promise<{ summary: DepartmentRevenue[]; total: number }> => {
      // Get all revenue accounts with their balances from journal lines in period
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          credit_amount,
          debit_amount,
          description,
          account:accounts!inner(
            id, account_number, name,
            account_type:account_types!inner(category)
          ),
          journal_entry:journal_entries!inner(
            entry_date, is_posted, branch_id, reference_type
          )
        `)
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", dateFrom)
        .lte("journal_entry.entry_date", dateTo)
        .eq("account.account_type.category", "revenue");

      if (branchId && branchId !== "all") {
        query = query.eq("journal_entry.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by department extracted from journal line description or account name
      const grouped: Record<string, { revenue: number; count: number }> = {};
      let total = 0;

      (data || []).forEach((line: any) => {
        const netRevenue = Number(line.credit_amount || 0) - Number(line.debit_amount || 0);
        if (netRevenue <= 0) return;

        // Determine department from account number or description
        const accNum = line.account?.account_number || "";
        const desc = (line.description || "").toLowerCase();
        let dept = "other";

        if (accNum === "REV-001" || accNum === "4110" || desc.includes("consultation")) {
          dept = "consultation";
        } else if (accNum.includes("LAB") || accNum === "4030" || desc.includes("lab")) {
          dept = "lab";
        } else if (accNum.includes("RAD") || accNum === "4040" || desc.includes("radiology")) {
          dept = "radiology";
        } else if (accNum.includes("PHARM") || accNum === "4050" || desc.includes("pharmacy")) {
          dept = "pharmacy";
        } else if (accNum.includes("PROC") || accNum === "4060" || desc.includes("procedure") || desc.includes("surgery")) {
          dept = "procedure";
        } else if (accNum.includes("ROOM") || accNum === "4070" || desc.includes("room")) {
          dept = "room";
        } else if (accNum === "4010" || desc.includes("ipd")) {
          dept = "ipd";
        } else if (desc.includes("emergency")) {
          dept = "emergency";
        }

        if (!grouped[dept]) grouped[dept] = { revenue: 0, count: 0 };
        grouped[dept].revenue += netRevenue;
        grouped[dept].count += 1;
        total += netRevenue;
      });

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
      // Get journal lines for revenue accounts, then trace back to invoices via reference_id
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          id,
          credit_amount,
          debit_amount,
          description,
          account:accounts!inner(account_number, name, account_type:account_types!inner(category)),
          journal_entry:journal_entries!inner(
            entry_date, is_posted, branch_id, reference_id, reference_type, created_at
          )
        `)
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", dateFrom)
        .lte("journal_entry.entry_date", dateTo)
        .eq("account.account_type.category", "revenue")
        .eq("journal_entry.reference_type", "invoice");

      if (branchId && branchId !== "all") {
        query = query.eq("journal_entry.branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by department
      const filtered = (data || []).filter((line: any) => {
        if (department === "all") return true;
        const accNum = line.account?.account_number || "";
        const desc = (line.description || "").toLowerCase();
        
        const deptMap: Record<string, string[]> = {
          consultation: ["REV-001", "4110", "consultation"],
          lab: ["LAB", "4030", "lab"],
          radiology: ["RAD", "4040", "radiology"],
          pharmacy: ["PHARM", "4050", "pharmacy"],
          procedure: ["PROC", "4060", "procedure", "surgery"],
          room: ["ROOM", "4070", "room"],
          ipd: ["4010", "ipd"],
          emergency: ["emergency"],
        };

        const keys = deptMap[department] || [department];
        return keys.some(k => accNum.includes(k) || desc.includes(k.toLowerCase()));
      });

      // Look up invoice details for each line
      const invoiceIds = [...new Set(filtered.map((l: any) => l.journal_entry?.reference_id).filter(Boolean))];
      
      let invoiceMap: Record<string, any> = {};
      if (invoiceIds.length > 0) {
        const { data: invoices } = await supabase
          .from("invoices")
          .select("id, invoice_number, invoice_date, patient:patients!invoices_patient_id_fkey(first_name, last_name)")
          .in("id", invoiceIds.slice(0, 100));
        
        (invoices || []).forEach((inv: any) => { invoiceMap[inv.id] = inv; });
      }

      return filtered.map((line: any) => {
        const inv = invoiceMap[line.journal_entry?.reference_id] || {};
        const patient = inv.patient;
        const netAmount = Number(line.credit_amount || 0) - Number(line.debit_amount || 0);
        return {
          id: line.id,
          invoice_number: inv.invoice_number || "-",
          invoice_date: inv.invoice_date || line.journal_entry?.entry_date || "-",
          patient_name: patient ? `${patient.first_name} ${patient.last_name || ""}`.trim() : "Unknown",
          description: line.description || "",
          amount: netAmount,
          department: department,
          created_at: line.journal_entry?.created_at || "",
        };
      });
    },
    enabled: !!profile?.organization_id && department !== "all",
  });
}
