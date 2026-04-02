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

export interface ExpenseRecord {
  id: string;
  date: string;
  expense_number: string;
  category: string;
  description: string;
  amount: number;
  paid_to: string;
  payment_method: string;
  created_by: string;
}

export interface GRNRecord {
  id: string;
  grn_number: string;
  vendor_name: string;
  invoice_amount: number;
  received_date: string;
  status: string;
  total_paid: number;
  balance_due: number;
  payment_status: "Paid" | "Partial" | "Credit Payable";
}

export interface VendorPayable {
  vendor_name: string;
  vendor_code: string;
  total_grn_value: number;
  total_paid: number;
  outstanding_balance: number;
  last_payment_date: string | null;
}

export interface DepartmentPnLData {
  departments: DepartmentPnLRow[];
  totals: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    totalExpensesRecorded: number;
    totalProcurement: number;
    totalVendorPayable: number;
  };
  pharmacyMedicines: PharmacyMedicineProfit[];
  transactions: DepartmentTransaction[];
  expenseRecords: ExpenseRecord[];
  grnRecords: GRNRecord[];
  vendorPayables: VendorPayable[];
}

// Map account_number to department
function mapAccountToDepartment(accountNumber: string, accountName: string): string {
  const num = accountNumber.toUpperCase();
  if (num === "REV-001") return "OPD";
  if (num === "4010") return "IPD";
  if (num === "4020") return "Emergency";
  if (num === "4030" || num === "4200") return "Laboratory";
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

      // 2. Get journal entry lines with date filter
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          account_id, debit_amount, credit_amount, description,
          journal_entry:journal_entries!inner(entry_date, is_posted, organization_id, branch_id, entry_number, description)
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
        if (acct.category.toLowerCase() !== "revenue" && acct.category.toLowerCase() !== "expense") continue;

        if (!accountTotals[line.account_id]) {
          accountTotals[line.account_id] = { debit: 0, credit: 0 };
        }
        accountTotals[line.account_id].debit += Number(line.debit_amount) || 0;
        accountTotals[line.account_id].credit += Number(line.credit_amount) || 0;

        const je = line.journal_entry as any;
        const debit = Number(line.debit_amount) || 0;
        const credit = Number(line.credit_amount) || 0;
        const netAmount = acct.is_debit_normal ? debit - credit : credit - debit;

        transactions.push({
          date: je?.entry_date || "",
          journal_number: je?.entry_number || "",
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
        const tots = accountTotals[acct.id];
        if (!tots) continue;

        const netAmount = isDebitNormal ? tots.debit - tots.credit : tots.credit - tots.debit;
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
        .map(([department, d]) => {
          const grossProfit = d.revenue - d.cogs;
          const netProfit = grossProfit - d.expenses;
          const marginPercent = d.revenue > 0 ? (netProfit / d.revenue) * 100 : 0;
          return { department, ...d, grossProfit, netProfit, marginPercent };
        })
        .sort((a, b) => b.revenue - a.revenue);

      const deptTotals = departments.reduce(
        (acc, d) => ({
          revenue: acc.revenue + d.revenue,
          cogs: acc.cogs + d.cogs,
          grossProfit: acc.grossProfit + d.grossProfit,
          expenses: acc.expenses + d.expenses,
          netProfit: acc.netProfit + d.netProfit,
        }),
        { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 }
      );

      // 6. Pharmacy medicine-level profit from POS (no FK joins — query separately)
      let pharmacyMedicines: PharmacyMedicineProfit[] = [];
      try {
        // Step 1: Get POS transaction IDs filtered by org/date/branch
        let txQuery = supabase
          .from("pharmacy_pos_transactions")
          .select("id, created_at")
          .eq("organization_id", profile.organization_id);

        if (startDate) txQuery = txQuery.gte("created_at", startDate);
        if (endDate) txQuery = txQuery.lte("created_at", endDate);
        if (branchId) txQuery = txQuery.eq("branch_id", branchId);

        const { data: posTxns } = await txQuery;
        const txIds = (posTxns || []).map((t: any) => t.id);

        if (txIds.length > 0) {
          // Step 2: Get POS items for those transactions (no joins)
          const { data: posItems } = await supabase
            .from("pharmacy_pos_items")
            .select("medicine_id, quantity, unit_price, total_price, transaction_id")
            .in("transaction_id", txIds);

          if (posItems && posItems.length > 0) {
            // Step 3: Get medicine cost prices
            const medIds = [...new Set(posItems.map((i: any) => i.medicine_id).filter(Boolean))];
            const medLookup: Record<string, { name: string; cost_price: number }> = {};

            if (medIds.length > 0) {
              const { data: meds } = await supabase
                .from("medicines")
                .select("id, name, cost_price")
                .in("id", medIds);
              for (const m of meds || []) {
                medLookup[m.id] = { name: m.name, cost_price: Number(m.cost_price) || 0 };
              }
            }

            // Step 4: Aggregate
            const medMap: Record<string, PharmacyMedicineProfit> = {};
            for (const item of posItems) {
              const med = medLookup[item.medicine_id] || null;
              const name = med?.name || "Unknown";
              const costPrice = med?.cost_price || Number(item.unit_price) * 0.65;
              const sellingPrice = Number(item.unit_price) || 0;
              const qty = Number(item.quantity) || 0;

              if (!medMap[name]) {
                medMap[name] = {
                  medicine_name: name, quantity_sold: 0, cost_price: costPrice,
                  selling_price: sellingPrice, total_revenue: 0, total_cost: 0, profit: 0, margin_percent: 0,
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
        }
      } catch {
        // POS data optional
      }

      // 7. Expenses from expenses table
      let expenseRecords: ExpenseRecord[] = [];
      try {
        let expQuery = supabase
          .from("expenses")
          .select(`
            id, created_at, expense_number, category, description, amount, paid_to,
            created_by_profile:profiles!expenses_created_by_fkey(full_name),
            payment_method:payment_methods(name)
          `)
          .eq("organization_id", profile.organization_id);

        if (startDate) expQuery = expQuery.gte("created_at", startDate);
        if (endDate) expQuery = expQuery.lte("created_at", endDate + "T23:59:59");
        if (branchId) expQuery = expQuery.eq("branch_id", branchId);

        expQuery = expQuery.order("created_at", { ascending: false });

        const { data: expData } = await expQuery;
        if (expData) {
          expenseRecords = expData.map((e: any) => ({
            id: e.id,
            date: e.created_at?.slice(0, 10) || "",
            expense_number: e.expense_number || "",
            category: e.category || "",
            description: e.description || "",
            amount: Number(e.amount) || 0,
            paid_to: e.paid_to || "—",
            payment_method: e.payment_method?.name || "Cash",
            created_by: e.created_by_profile?.full_name || "—",
          }));
        }
      } catch {
        // optional
      }

      // 8. GRN records
      let grnRecords: GRNRecord[] = [];
      try {
        let grnQuery = supabase
          .from("goods_received_notes")
          .select(`
            id, grn_number, invoice_amount, received_date, status,
            vendor:vendors(name)
          `)
          .eq("organization_id", profile.organization_id);

        if (startDate) grnQuery = grnQuery.gte("received_date", startDate);
        if (endDate) grnQuery = grnQuery.lte("received_date", endDate);
        if (branchId) grnQuery = grnQuery.eq("branch_id", branchId);

        grnQuery = grnQuery.order("received_date", { ascending: false });

        const { data: grnData } = await grnQuery;

        if (grnData && grnData.length > 0) {
          // Fetch vendor payments for these GRNs
          const grnIds = grnData.map((g: any) => g.id);
          const { data: payments } = await supabase
            .from("vendor_payments")
            .select("grn_id, amount, status")
            .in("grn_id", grnIds)
            .in("status", ["approved", "paid"]);

          const paymentsByGrn: Record<string, number> = {};
          for (const p of payments || []) {
            if (p.grn_id) {
              paymentsByGrn[p.grn_id] = (paymentsByGrn[p.grn_id] || 0) + (Number(p.amount) || 0);
            }
          }

          grnRecords = grnData.map((g: any) => {
            const invoiceAmt = Number(g.invoice_amount) || 0;
            const totalPaid = paymentsByGrn[g.id] || 0;
            const balanceDue = invoiceAmt - totalPaid;
            let paymentStatus: "Paid" | "Partial" | "Credit Payable" = "Credit Payable";
            if (balanceDue <= 0) paymentStatus = "Paid";
            else if (totalPaid > 0) paymentStatus = "Partial";

            return {
              id: g.id,
              grn_number: g.grn_number || "",
              vendor_name: g.vendor?.name || "—",
              invoice_amount: invoiceAmt,
              received_date: g.received_date || "",
              status: g.status || "",
              total_paid: totalPaid,
              balance_due: Math.max(0, balanceDue),
              payment_status: paymentStatus,
            };
          });
        }
      } catch {
        // optional
      }

      // 9. Vendor payables aggregation
      const vendorMap: Record<string, VendorPayable> = {};
      for (const grn of grnRecords) {
        const key = grn.vendor_name;
        if (!vendorMap[key]) {
          vendorMap[key] = {
            vendor_name: grn.vendor_name,
            vendor_code: "",
            total_grn_value: 0,
            total_paid: 0,
            outstanding_balance: 0,
            last_payment_date: null,
          };
        }
        vendorMap[key].total_grn_value += grn.invoice_amount;
        vendorMap[key].total_paid += grn.total_paid;
        vendorMap[key].outstanding_balance += grn.balance_due;
      }

      // Get vendor codes + last payment dates
      try {
        const vendorNames = Object.keys(vendorMap);
        if (vendorNames.length > 0) {
          const { data: vendors } = await supabase
            .from("vendors")
            .select("name, vendor_code")
            .eq("organization_id", profile.organization_id)
            .in("name", vendorNames);

          for (const v of vendors || []) {
            if (vendorMap[v.name]) {
              vendorMap[v.name].vendor_code = v.vendor_code || "";
            }
          }

          // Get last payment dates
          const { data: lastPayments } = await supabase
            .from("vendor_payments")
            .select("vendor_id, payment_date, vendor:vendors(name)")
            .eq("organization_id", profile.organization_id)
            .in("status", ["approved", "paid"])
            .order("payment_date", { ascending: false });

          const seenVendors = new Set<string>();
          for (const p of lastPayments || []) {
            const vName = (p.vendor as any)?.name;
            if (vName && vendorMap[vName] && !seenVendors.has(vName)) {
              vendorMap[vName].last_payment_date = p.payment_date;
              seenVendors.add(vName);
            }
          }
        }
      } catch {
        // optional
      }

      const vendorPayables = Object.values(vendorMap)
        .filter((v) => v.outstanding_balance > 0)
        .sort((a, b) => b.outstanding_balance - a.outstanding_balance);

      const totalExpensesRecorded = expenseRecords.reduce((s, e) => s + e.amount, 0);
      const totalProcurement = grnRecords.reduce((s, g) => s + g.invoice_amount, 0);
      const totalVendorPayable = vendorPayables.reduce((s, v) => s + v.outstanding_balance, 0);

      return {
        departments,
        totals: {
          ...deptTotals,
          totalExpensesRecorded,
          totalProcurement,
          totalVendorPayable,
        },
        pharmacyMedicines,
        transactions,
        expenseRecords,
        grnRecords,
        vendorPayables,
      };
    },
    enabled: !!profile?.organization_id,
  });
}
