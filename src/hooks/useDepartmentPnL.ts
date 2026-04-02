import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DepartmentPnLRow {
  department: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  marginPercent: number;
}

export interface PharmacyMedicineProfit {
  medicine_name: string;
  quantity_sold: number;
  cost_price: number;
  selling_price: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  margin_percent: number;
}

export interface DepartmentTransaction {
  date: string;
  journal_number: string;
  description: string;
  department: string;
  account_name: string;
  account_number: string;
  type: "Revenue" | "COGS" | "Expense";
  debit: number;
  credit: number;
  net_amount: number;
}

export interface DepartmentPnLData {
  departments: DepartmentPnLRow[];
  totals: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
  };
  pharmacyMedicines: PharmacyMedicineProfit[];
  transactions: DepartmentTransaction[];
}

// Map account_number to department
function mapAccountToDepartment(accountNumber: string, accountName: string): string {
  const num = accountNumber.toUpperCase();
  if (num === "REV-001") return "OPD";
  if (num === "4010") return "IPD";
  if (num === "4020") return "Emergency";
  if (num === "4030") return "Laboratory";
  if (num === "4040") return "Dialysis";
  if (num === "4050") return "Imaging/Radiology";
  if (num.startsWith("REV-PHARM") || num.startsWith("REV-POS")) return "Pharmacy";
  if (num.startsWith("EXP-COGS")) return "Pharmacy";
  if (num.startsWith("EXP-WO") || num.startsWith("EXP-SHIP")) return "Pharmacy";
  if (num.startsWith("EXP-SAL") || num === "5500") return "General/Admin";
  if (num.startsWith("EXP-PETTY") || num.startsWith("EXP-ADM")) return "General/Admin";
  const nameLower = accountName.toLowerCase();
  if (nameLower.includes("pharmacy") || nameLower.includes("cogs")) return "Pharmacy";
  if (nameLower.includes("laboratory") || nameLower.includes("lab ")) return "Laboratory";
  if (nameLower.includes("opd")) return "OPD";
  if (nameLower.includes("ipd")) return "IPD";
  if (nameLower.includes("dialysis")) return "Dialysis";
  if (nameLower.includes("emergency")) return "Emergency";
  return "General/Admin";
}

function classifyAccountType(accountNumber: string, category: string): "Revenue" | "COGS" | "Expense" {
  if (category.toLowerCase() === "revenue") return "Revenue";
  const num = accountNumber.toUpperCase();
  if (num.startsWith("EXP-COGS")) return "COGS";
  return "Expense";
}

export function useDepartmentPnL(startDate?: string, endDate?: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["department-pnl", profile?.organization_id, startDate, endDate, branchId],
    queryFn: async (): Promise<DepartmentPnLData> => {
      if (!profile?.organization_id) throw new Error("No organization");

      // 1. Get all active posting accounts with their type
      const { data: accounts, error: accErr } = await supabase
        .from("accounts")
        .select(`
          id, name, account_number,
          account_type:account_types(name, category, is_debit_normal)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("is_active", true)
        .eq("is_header", false);

      if (accErr) throw accErr;

      // 2. Get journal entry lines with date filter — include journal details for transactions
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          account_id, debit_amount, credit_amount, description,
          journal_entry:journal_entries!inner(entry_date, is_posted, organization_id, branch_id, journal_number, description)
        `)
        .eq("journal_entry.is_posted", true)
        .eq("journal_entry.organization_id", profile.organization_id);

      if (startDate) query = query.gte("journal_entry.entry_date", startDate);
      if (endDate) query = query.lte("journal_entry.entry_date", endDate);
      if (branchId) query = query.eq("journal_entry.branch_id", branchId);

      const { data: lines, error: linesErr } = await query;
      if (linesErr) throw linesErr;

      // Build account lookup
      const accountMap: Record<string, {
        name: string;
        account_number: string;
        category: string;
        is_debit_normal: boolean;
      }> = {};
      for (const acct of accounts || []) {
        const acctType = acct.account_type as any;
        if (!acctType) continue;
        accountMap[acct.id] = {
          name: acct.name,
          account_number: acct.account_number,
          category: acctType.category,
          is_debit_normal: acctType.is_debit_normal,
        };
      }

      // 3. Aggregate per account + build transactions
      const accountTotals: Record<string, { debit: number; credit: number }> = {};
      const transactions: DepartmentTransaction[] = [];

      for (const line of lines || []) {
        const acct = accountMap[line.account_id];
        if (!acct) continue;
        
        // Only include Revenue and Expense categories
        if (acct.category.toLowerCase() !== "revenue" && acct.category.toLowerCase() !== "expense") continue;

        // Aggregate
        if (!accountTotals[line.account_id]) {
          accountTotals[line.account_id] = { debit: 0, credit: 0 };
        }
        accountTotals[line.account_id].debit += Number(line.debit_amount) || 0;
        accountTotals[line.account_id].credit += Number(line.credit_amount) || 0;

        // Build transaction row
        const je = line.journal_entry as any;
        const debit = Number(line.debit_amount) || 0;
        const credit = Number(line.credit_amount) || 0;
        const netAmount = acct.is_debit_normal ? debit - credit : credit - debit;

        transactions.push({
          date: je?.entry_date || "",
          journal_number: je?.journal_number || "",
          description: (line.description || je?.description || "").toString(),
          department: mapAccountToDepartment(acct.account_number, acct.name),
          account_name: acct.name,
          account_number: acct.account_number,
          type: classifyAccountType(acct.account_number, acct.category),
          debit,
          credit,
          net_amount: netAmount,
        });
      }

      // Sort transactions by date descending
      transactions.sort((a, b) => b.date.localeCompare(a.date));

      // 4. Build department buckets
      const deptData: Record<string, { revenue: number; cogs: number; expenses: number }> = {};

      const ensureDept = (d: string) => {
        if (!deptData[d]) deptData[d] = { revenue: 0, cogs: 0, expenses: 0 };
      };

      for (const acct of accounts || []) {
        const acctType = acct.account_type as any;
        if (!acctType) continue;
        const category = acctType.category;
        const isDebitNormal = acctType.is_debit_normal;
        const totals = accountTotals[acct.id];
        if (!totals) continue;

        const netAmount = isDebitNormal
          ? totals.debit - totals.credit
          : totals.credit - totals.debit;

        const dept = mapAccountToDepartment(acct.account_number, acct.name);
        ensureDept(dept);

        if (category.toLowerCase() === "revenue") {
          deptData[dept].revenue += netAmount;
        } else if (category.toLowerCase() === "expense") {
          const num = acct.account_number.toUpperCase();
          if (num.startsWith("EXP-COGS")) {
            deptData[dept].cogs += netAmount;
          } else {
            deptData[dept].expenses += netAmount;
          }
        }
      }

      // 5. Build department rows
      const departments: DepartmentPnLRow[] = Object.entries(deptData)
        .map(([department, data]) => {
          const grossProfit = data.revenue - data.cogs;
          const netProfit = grossProfit - data.expenses;
          const marginPercent = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;
          return { department, ...data, grossProfit, netProfit, marginPercent };
        })
        .sort((a, b) => b.revenue - a.revenue);

      const totals = departments.reduce(
        (acc, d) => ({
          revenue: acc.revenue + d.revenue,
          cogs: acc.cogs + d.cogs,
          grossProfit: acc.grossProfit + d.grossProfit,
          expenses: acc.expenses + d.expenses,
          netProfit: acc.netProfit + d.netProfit,
        }),
        { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 }
      );

      // 6. Pharmacy medicine-level profit from POS
      let pharmacyMedicines: PharmacyMedicineProfit[] = [];
      try {
        let posQuery = supabase
          .from("pharmacy_pos_items")
          .select(`
            quantity, unit_price, total_price,
            medicine:medicines(name, cost_price),
            pos_transaction:pharmacy_pos_transactions!inner(transaction_date, organization_id, branch_id)
          `)
          .eq("pos_transaction.organization_id", profile.organization_id);

        if (startDate) posQuery = posQuery.gte("pos_sale.sale_date", startDate);
        if (endDate) posQuery = posQuery.lte("pos_sale.sale_date", endDate);
        if (branchId) posQuery = posQuery.eq("pos_sale.branch_id", branchId);

        const { data: posItems } = await posQuery;

        if (posItems && posItems.length > 0) {
          const medMap: Record<string, PharmacyMedicineProfit> = {};
          for (const item of posItems) {
            const med = item.medicine as any;
            const name = med?.name || "Unknown";
            const costPrice = Number(med?.cost_price) || Number(item.unit_price) * 0.65;
            const sellingPrice = Number(item.unit_price) || 0;
            const qty = Number(item.quantity) || 0;

            if (!medMap[name]) {
              medMap[name] = {
                medicine_name: name,
                quantity_sold: 0,
                cost_price: costPrice,
                selling_price: sellingPrice,
                total_revenue: 0,
                total_cost: 0,
                profit: 0,
                margin_percent: 0,
              };
            }
            medMap[name].quantity_sold += qty;
            medMap[name].total_revenue += Number(item.total_price) || sellingPrice * qty;
            medMap[name].total_cost += costPrice * qty;
          }

          pharmacyMedicines = Object.values(medMap)
            .map((m) => ({
              ...m,
              profit: m.total_revenue - m.total_cost,
              margin_percent: m.total_revenue > 0 ? ((m.total_revenue - m.total_cost) / m.total_revenue) * 100 : 0,
            }))
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 20);
        }
      } catch {
        // POS data optional
      }

      return { departments, totals, pharmacyMedicines, transactions };
    },
    enabled: !!profile?.organization_id,
  });
}
