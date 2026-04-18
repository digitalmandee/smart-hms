import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Types
export interface TrialBalanceRow {
  account_id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  category: string;
  debit: number;
  credit: number;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface ProfitLossSection {
  title: string;
  items: {
    account_id: string;
    account_name: string;
    amount: number;
  }[];
  total: number;
}

export interface BalanceSheetSection {
  title: string;
  items: {
    account_id: string;
    account_name: string;
    amount: number;
  }[];
  total: number;
}

export interface CashFlowItem {
  description: string;
  amount: number;
  category: "operating" | "investing" | "financing";
}

// =====================
// Trial Balance
// =====================

export function useTrialBalance(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["trial-balance", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // Fetch accounts with their types
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select(`
          id,
          account_number,
          name,
          opening_balance,
          current_balance,
          account_type:account_types(
            name,
            category,
            is_debit_normal
          )
        `)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");

      if (accountsError) throw accountsError;

      // Fetch ALL posted journal lines (we'll split into opening vs movement)
      let openingTotals: Record<string, { debit: number; credit: number }> = {};
      let movementTotals: Record<string, { debit: number; credit: number }> = {};
      
      const useDateFilter = !!(startDate && endDate);

      if (useDateFilter) {
        // Opening: all posted entries BEFORE startDate
        const { data: openingLines, error: openingError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .lt("journal_entry.entry_date", startDate);

        if (openingError) throw openingError;

        for (const line of openingLines || []) {
          if (!openingTotals[line.account_id]) {
            openingTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          openingTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          openingTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }

        // Movement: entries within the date range
        const { data: movementLines, error: movementError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .gte("journal_entry.entry_date", startDate)
          .lte("journal_entry.entry_date", endDate);

        if (movementError) throw movementError;

        for (const line of movementLines || []) {
          if (!movementTotals[line.account_id]) {
            movementTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          movementTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          movementTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }
      }

      // Build trial balance
      const trialBalance: TrialBalanceRow[] = (accounts || []).map(account => {
        const isDebitNormal = account.account_type?.is_debit_normal ?? true;
        const openingBal = Number(account.opening_balance) || 0;

        if (useDateFilter) {
          const opening = openingTotals[account.id] || { debit: 0, credit: 0 };
          const movement = movementTotals[account.id] || { debit: 0, credit: 0 };

          // Opening balance = account opening_balance + journal activity before startDate
          const openingNet = isDebitNormal
            ? openingBal + opening.debit - opening.credit
            : openingBal + opening.credit - opening.debit;

          // Movement = activity within date range
          const movementNet = isDebitNormal
            ? movement.debit - movement.credit
            : movement.credit - movement.debit;

          // Closing = opening + movement
          const closingNet = openingNet + movementNet;

          const toDebitCredit = (val: number) => ({
            debit: val >= 0 ? val : 0,
            credit: val < 0 ? Math.abs(val) : 0,
          });

          const op = toDebitCredit(openingNet);
          const mv = toDebitCredit(movementNet);
          const cl = toDebitCredit(closingNet);

          return {
            account_id: account.id,
            account_number: account.account_number,
            account_name: account.name,
            account_type: account.account_type?.name || "Unknown",
            category: account.account_type?.category || "Unknown",
            debit: cl.debit,
            credit: cl.credit,
            openingDebit: op.debit,
            openingCredit: op.credit,
            movementDebit: mv.debit,
            movementCredit: mv.credit,
            closingDebit: cl.debit,
            closingCredit: cl.credit,
          };
        } else {
          const balance = Number(account.current_balance) || 0;
          const db = isDebitNormal ? (balance >= 0 ? balance : 0) : (balance < 0 ? Math.abs(balance) : 0);
          const cr = isDebitNormal ? (balance < 0 ? Math.abs(balance) : 0) : (balance >= 0 ? balance : 0);
          return {
            account_id: account.id,
            account_number: account.account_number,
            account_name: account.name,
            account_type: account.account_type?.name || "Unknown",
            category: account.account_type?.category || "Unknown",
            debit: db,
            credit: cr,
            openingDebit: 0,
            openingCredit: 0,
            movementDebit: db,
            movementCredit: cr,
            closingDebit: db,
            closingCredit: cr,
          };
        }
      });

      // Separate: all rows (for stats) and filtered rows (for display)
      const allRows = trialBalance;
      const activeRows = trialBalance.filter(row => 
        row.closingDebit !== 0 || row.closingCredit !== 0 || 
        row.movementDebit !== 0 || row.movementCredit !== 0
      );

      const totalDebits = allRows.reduce((sum, row) => sum + row.closingDebit, 0);
      const totalCredits = allRows.reduce((sum, row) => sum + row.closingCredit, 0);

      return {
        rows: allRows,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
        totalAccounts: allRows.length,
        accountsWithActivity: activeRows.length,
        zeroBalanceCount: allRows.length - activeRows.length,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Profit & Loss Statement
// =====================

export function useProfitLoss(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["profit-loss", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // Fetch revenue and expense accounts
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select(`
          id,
          name,
          account_number,
          current_balance,
          account_type:account_types(
            name,
            category,
            is_debit_normal
          )
        `)
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");

      if (error) throw error;

      // If date range provided, calculate from journal entries
      let journalTotals: Record<string, { debit: number; credit: number }> = {};
      const useDateFilter = !!(startDate && endDate);
      
      if (useDateFilter) {
        const { data: lines, error: linesError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .eq("journal_entry.organization_id", profile!.organization_id!)
          .gte("journal_entry.entry_date", startDate)
          .lte("journal_entry.entry_date", endDate);

        if (linesError) throw linesError;

        for (const line of lines || []) {
          if (!journalTotals[line.account_id]) {
            journalTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          journalTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          journalTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }
      }

      const getAmount = (account: any) => {
        if (useDateFilter) {
          const totals = journalTotals[account.id] || { debit: 0, credit: 0 };
          const isDebitNormal = account.account_type?.is_debit_normal ?? true;
          return isDebitNormal
            ? totals.debit - totals.credit
            : totals.credit - totals.debit;
        }
        return Math.abs(Number(account.current_balance) || 0);
      };

      const revenueAccounts = (accounts || []).filter(
        a => a.account_type?.category === "revenue"
      );
      const allExpenseAccounts = (accounts || []).filter(
        a => a.account_type?.category === "expense"
      );

      // Separate COGS from operating expenses
      const cogsAccounts = allExpenseAccounts.filter(
        a => (a as any).account_number?.startsWith("EXP-COGS")
      );
      const expenseAccounts = allExpenseAccounts.filter(
        a => !(a as any).account_number?.startsWith("EXP-COGS")
      );

      const revenue: ProfitLossSection = {
        title: "Revenue",
        items: revenueAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(getAmount(a)),
        })).filter(i => i.amount > 0),
        total: revenueAccounts.reduce((sum, a) => sum + Math.abs(getAmount(a)), 0),
      };

      const cogs: ProfitLossSection = {
        title: "Cost of Goods Sold",
        items: cogsAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(getAmount(a)),
        })).filter(i => i.amount > 0),
        total: cogsAccounts.reduce((sum, a) => sum + Math.abs(getAmount(a)), 0),
      };

      const expenses: ProfitLossSection = {
        title: "Expenses",
        items: expenseAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: Math.abs(getAmount(a)),
        })).filter(i => i.amount > 0),
        total: expenseAccounts.reduce((sum, a) => sum + Math.abs(getAmount(a)), 0),
      };

      const grossProfit = revenue.total - cogs.total;
      const netIncome = grossProfit - expenses.total;

      return {
        revenue,
        cogs,
        expenses,
        grossProfit,
        operatingExpenses: expenses.total,
        netIncome,
        isProfit: netIncome >= 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Balance Sheet
// =====================

export function useBalanceSheet(asOfDate?: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["balance-sheet", profile?.organization_id, asOfDate],
    queryFn: async () => {
      // Fetch asset, liability, and equity accounts (L4 posting only)
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select(`
          id,
          name,
          current_balance,
          opening_balance,
          account_type:account_types(
            name,
            category,
            is_debit_normal
          )
        `)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");

      if (error) throw error;

      // If asOfDate provided, calculate balances from journal entries up to that date
      let journalTotals: Record<string, { debit: number; credit: number }> = {};
      const useDateFilter = !!asOfDate;

      if (useDateFilter) {
        const { data: lines, error: linesError } = await supabase
          .from("journal_entry_lines")
          .select(`
            account_id,
            debit_amount,
            credit_amount,
            journal_entry:journal_entries!inner(
              entry_date,
              is_posted
            )
          `)
          .eq("journal_entry.is_posted", true)
          .lte("journal_entry.entry_date", asOfDate);

        if (linesError) throw linesError;

        for (const line of lines || []) {
          if (!journalTotals[line.account_id]) {
            journalTotals[line.account_id] = { debit: 0, credit: 0 };
          }
          journalTotals[line.account_id].debit += Number(line.debit_amount) || 0;
          journalTotals[line.account_id].credit += Number(line.credit_amount) || 0;
        }
      }

      const getBalance = (account: any) => {
        if (useDateFilter) {
          const totals = journalTotals[account.id] || { debit: 0, credit: 0 };
          const isDebitNormal = account.account_type?.is_debit_normal ?? true;
          const opening = Number(account.opening_balance) || 0;
          return isDebitNormal
            ? opening + totals.debit - totals.credit
            : opening + totals.credit - totals.debit;
        }
        return Number(account.current_balance) || 0;
      };

      const assetAccounts = (accounts || []).filter(
        a => a.account_type?.category === "asset"
      );
      const liabilityAccounts = (accounts || []).filter(
        a => a.account_type?.category === "liability"
      );
      const equityAccounts = (accounts || []).filter(
        a => a.account_type?.category === "equity"
      );

      const assets: BalanceSheetSection = {
        title: "Assets",
        items: assetAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: getBalance(a),
        })).filter(i => i.amount !== 0),
        total: assetAccounts.reduce((sum, a) => sum + getBalance(a), 0),
      };

      const liabilities: BalanceSheetSection = {
        title: "Liabilities",
        items: liabilityAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: getBalance(a),
        })).filter(i => i.amount !== 0),
        total: liabilityAccounts.reduce((sum, a) => sum + getBalance(a), 0),
      };

      const equity: BalanceSheetSection = {
        title: "Equity",
        items: equityAccounts.map(a => ({
          account_id: a.id,
          account_name: a.name,
          amount: getBalance(a),
        })).filter(i => i.amount !== 0),
        total: equityAccounts.reduce((sum, a) => sum + getBalance(a), 0),
      };

      const totalLiabilitiesAndEquity = liabilities.total + equity.total;
      const isBalanced = Math.abs(assets.total - totalLiabilitiesAndEquity) < 0.01;

      return {
        assets,
        liabilities,
        equity,
        totalAssets: assets.total,
        totalLiabilitiesAndEquity,
        isBalanced,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Cash Flow Statement (GL-sourced, direct method)
// =====================
// Sourced exclusively from movements on cash & bank GL accounts.
// Categorizes each movement by the COUNTERPART account/reference type:
//  - Operating: revenue, AR, expenses, AP, payroll, tax
//  - Investing: fixed/intangible assets
//  - Financing: long-term liabilities, equity, owner contributions

export function useCashFlow(startDate?: string, endDate?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["cash-flow-gl", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      // 1. Identify all cash & bank accounts for this org
      const { data: cashAccounts, error: caErr } = await supabase
        .from("accounts")
        .select("id, account_number, name")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .or("account_number.in.(CASH-001,1010,1020,1000),name.ilike.%cash%,name.ilike.%bank%");
      if (caErr) throw caErr;

      const cashAccountIds = (cashAccounts || []).map((a) => a.id);
      if (cashAccountIds.length === 0) {
        return {
          operating: [], investing: [], financing: [],
          operatingTotal: 0, investingTotal: 0, financingTotal: 0,
          netCashFlow: 0, openingCash: 0, closingCash: 0,
        };
      }

      // 2. Opening cash = sum of all posted JE lines on cash accounts BEFORE startDate
      let openingQ = supabase
        .from("journal_entry_lines")
        .select(`debit_amount, credit_amount, journal_entry:journal_entries!inner(entry_date, is_posted, organization_id)`)
        .in("account_id", cashAccountIds)
        .eq("journal_entry.is_posted", true)
        .eq("journal_entry.organization_id", profile!.organization_id!);
      if (startDate) openingQ = openingQ.lt("journal_entry.entry_date", startDate);
      const { data: openingLines, error: oErr } = await openingQ;
      if (oErr) throw oErr;
      const openingCash = (openingLines || []).reduce(
        (s: number, l: any) => s + (Number(l.debit_amount) || 0) - (Number(l.credit_amount) || 0), 0
      );

      // 3. Period: every JE that touches a cash account — load full entry + all lines so we can categorize
      let cashJeQ = supabase
        .from("journal_entry_lines")
        .select(`journal_entry_id, debit_amount, credit_amount, journal_entry:journal_entries!inner(id, entry_date, is_posted, reference_type, description, organization_id)`)
        .in("account_id", cashAccountIds)
        .eq("journal_entry.is_posted", true)
        .eq("journal_entry.organization_id", profile!.organization_id!);
      if (startDate) cashJeQ = cashJeQ.gte("journal_entry.entry_date", startDate);
      if (endDate) cashJeQ = cashJeQ.lte("journal_entry.entry_date", endDate);
      const { data: cashLines, error: cErr } = await cashJeQ;
      if (cErr) throw cErr;

      // Sum cash effect per JE (DR cash = inflow positive; CR cash = outflow negative)
      const jeCashEffect: Record<string, { net: number; refType: string; description: string }> = {};
      for (const l of cashLines || []) {
        const jeId = (l as any).journal_entry_id;
        const eff = (Number(l.debit_amount) || 0) - (Number(l.credit_amount) || 0);
        if (!jeCashEffect[jeId]) {
          jeCashEffect[jeId] = {
            net: 0,
            refType: (l as any).journal_entry?.reference_type || "manual",
            description: (l as any).journal_entry?.description || "",
          };
        }
        jeCashEffect[jeId].net += eff;
      }

      // 4. Categorize each cash-touching JE by its reference type / counterpart
      const operatingMap: Record<string, number> = {};
      const investingMap: Record<string, number> = {};
      const financingMap: Record<string, number> = {};

      const FINANCING_REFS = new Set(["loan", "owner_contribution", "dividend", "equity", "borrowing"]);
      const INVESTING_REFS = new Set(["asset_purchase", "asset_disposal", "fixed_asset"]);

      for (const jeId of Object.keys(jeCashEffect)) {
        const { net, refType } = jeCashEffect[jeId];
        if (Math.abs(net) < 0.01) continue;

        let bucket: "operating" | "investing" | "financing" = "operating";
        let label = "";

        if (FINANCING_REFS.has(refType)) {
          bucket = "financing";
          label = net > 0 ? "Financing Inflows (Loans / Equity)" : "Financing Outflows (Repayments / Dividends)";
        } else if (INVESTING_REFS.has(refType)) {
          bucket = "investing";
          label = net > 0 ? "Asset Disposals" : "Asset Purchases";
        } else {
          bucket = "operating";
          switch (refType) {
            case "invoice":
            case "payment":
              label = "Collections from Patients / Customers";
              break;
            case "patient_deposit":
              label = "Patient Deposits Received";
              break;
            case "vendor_payment":
              label = "Payments to Suppliers";
              break;
            case "expense":
              label = "Operating Expenses Paid";
              break;
            case "payroll":
              label = "Salaries & Wages Paid";
              break;
            case "grn":
              label = "Goods Received (Cash purchases)";
              break;
            case "pharmacy_pos":
              label = "Pharmacy POS Cash Sales";
              break;
            case "donation":
              label = "Donations Received";
              break;
            case "credit_note":
              label = "Refunds / Credit Notes";
              break;
            default:
              label = net > 0 ? "Other Operating Receipts" : "Other Operating Payments";
          }
        }

        const target = bucket === "operating" ? operatingMap : bucket === "investing" ? investingMap : financingMap;
        target[label] = (target[label] || 0) + net;
      }

      const toItems = (m: Record<string, number>, cat: "operating" | "investing" | "financing"): CashFlowItem[] =>
        Object.entries(m)
          .filter(([, v]) => Math.abs(v) > 0.01)
          .map(([description, amount]) => ({ description, amount, category: cat }));

      const operating = toItems(operatingMap, "operating");
      const investing = toItems(investingMap, "investing");
      const financing = toItems(financingMap, "financing");

      const operatingTotal = operating.reduce((s, i) => s + i.amount, 0);
      const investingTotal = investing.reduce((s, i) => s + i.amount, 0);
      const financingTotal = financing.reduce((s, i) => s + i.amount, 0);
      const netCashFlow = operatingTotal + investingTotal + financingTotal;

      return {
        operating,
        investing,
        financing,
        operatingTotal,
        investingTotal,
        financingTotal,
        netCashFlow,
        openingCash,
        closingCash: openingCash + netCashFlow,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// IPD Work-In-Progress (Unbilled Revenue) — accrual visibility
// =====================

export function useIPDWorkInProgress() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["ipd-wip", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ipd_charges")
        .select("id, admission_id, total_amount, charge_date, charge_type, is_billed, admissions!inner(admission_number, patients(first_name, last_name))")
        .eq("is_billed", false)
        .eq("admissions.organization_id", profile!.organization_id!);
      if (error) throw error;
      const charges = data || [];
      const total = charges.reduce((s: number, c: any) => s + Number(c.total_amount || 0), 0);
      const byAdmission: Record<string, { admission: string; patient: string; amount: number; count: number }> = {};
      for (const c of charges as any[]) {
        const adm = c.admissions?.admission_number || c.admission_id;
        const pat = c.admissions?.patients
          ? `${c.admissions.patients.first_name} ${c.admissions.patients.last_name}`
          : "—";
        if (!byAdmission[adm]) byAdmission[adm] = { admission: adm, patient: pat, amount: 0, count: 0 };
        byAdmission[adm].amount += Number(c.total_amount || 0);
        byAdmission[adm].count += 1;
      }
      return {
        totalUnbilled: total,
        chargeCount: charges.length,
        admissionCount: Object.keys(byAdmission).length,
        byAdmission: Object.values(byAdmission).sort((a, b) => b.amount - a.amount),
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Detailed P&L (grouped by account type with drill-down)
// =====================

export interface DetailedPnLGroup {
  account_type_id: string;
  account_type_name: string;
  accounts: {
    account_id: string;
    account_name: string;
    account_number: string;
    amount: number;
    journal_lines?: {
      id: string;
      entry_date: string;
      reference_number: string;
      description: string;
      debit: number;
      credit: number;
    }[];
  }[];
  total: number;
}

export interface DetailedPnLData {
  revenueGroups: DetailedPnLGroup[];
  cogsGroups: DetailedPnLGroup[];
  expenseGroups: DetailedPnLGroup[];
  otherIncomeGroups: DetailedPnLGroup[];
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalExpenses: number;
  totalOtherIncome: number;
  operatingProfit: number;
  netIncome: number;
}

export function useDetailedPnL(startDate?: string, endDate?: string, branchId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["detailed-pnl", profile?.organization_id, startDate, endDate, branchId],
    queryFn: async () => {
      // Fetch accounts with type info
      const { data: accounts, error } = await supabase
        .from("accounts")
        .select(`
          id, name, account_number, current_balance,
          account_type_id,
          account_type:account_types(id, name, category, is_debit_normal)
        `)
        .eq("organization_id", profile!.organization_id)
        .eq("is_active", true)
        .eq("is_header", false)
        .order("account_number");
      if (error) throw error;

      // Fetch journal lines for drill-down
      let lineQuery = supabase
        .from("journal_entry_lines")
        .select(`
          id, account_id, debit_amount, credit_amount, description,
          journal_entry:journal_entries!inner(
            id, entry_date, entry_number, description, is_posted
          )
        `)
        .eq("journal_entry.is_posted", true);

      if (startDate) lineQuery = lineQuery.gte("journal_entry.entry_date", startDate);
      if (endDate) lineQuery = lineQuery.lte("journal_entry.entry_date", endDate);

      const { data: lines, error: linesError } = await lineQuery;
      if (linesError) throw linesError;

      // Group lines by account
      const linesByAccount: Record<string, typeof lines> = {};
      const journalTotals: Record<string, { debit: number; credit: number }> = {};
      for (const line of lines || []) {
        if (!linesByAccount[line.account_id]) linesByAccount[line.account_id] = [];
        linesByAccount[line.account_id].push(line);
        if (!journalTotals[line.account_id]) journalTotals[line.account_id] = { debit: 0, credit: 0 };
        journalTotals[line.account_id].debit += Number(line.debit_amount) || 0;
        journalTotals[line.account_id].credit += Number(line.credit_amount) || 0;
      }

      const useDateFilter = !!(startDate && endDate);
      const getAmount = (account: any) => {
        if (useDateFilter) {
          const totals = journalTotals[account.id] || { debit: 0, credit: 0 };
          const isDebitNormal = account.account_type?.is_debit_normal ?? true;
          return isDebitNormal ? totals.debit - totals.credit : totals.credit - totals.debit;
        }
        return Math.abs(Number(account.current_balance) || 0);
      };

      const buildGroups = (categoryFilter: string): DetailedPnLGroup[] => {
        const filtered = (accounts || []).filter(a => a.account_type?.category === categoryFilter);
        const grouped: Record<string, typeof filtered> = {};
        for (const acc of filtered) {
          const typeId = acc.account_type_id;
          if (!grouped[typeId]) grouped[typeId] = [];
          grouped[typeId].push(acc);
        }

        return Object.entries(grouped).map(([typeId, accs]) => {
          const items = accs.map(a => {
            const amount = Math.abs(getAmount(a));
            const accLines = linesByAccount[a.id] || [];
            return {
              account_id: a.id,
              account_name: a.name,
              account_number: a.account_number,
              amount,
              journal_lines: accLines.map(l => ({
                id: l.id,
                entry_date: l.journal_entry?.entry_date || "",
                reference_number: l.journal_entry?.entry_number || "",
                description: l.description || l.journal_entry?.description || "",
                debit: Number(l.debit_amount) || 0,
                credit: Number(l.credit_amount) || 0,
              })),
            };
          }).filter(i => i.amount > 0);

          return {
            account_type_id: typeId,
            account_type_name: accs[0]?.account_type?.name || "Other",
            accounts: items,
            total: items.reduce((s, i) => s + i.amount, 0),
          };
        }).filter(g => g.total > 0);
      };

      const revenueGroups = buildGroups("revenue");
      const allExpenseGroups = buildGroups("expense");

      // Separate COGS groups from operating expense groups
      const cogsGroups = allExpenseGroups.filter(g =>
        g.accounts.some(a => a.account_number.startsWith("EXP-COGS"))
      ).map(g => ({
        ...g,
        accounts: g.accounts.filter(a => a.account_number.startsWith("EXP-COGS")),
        total: g.accounts.filter(a => a.account_number.startsWith("EXP-COGS")).reduce((s, a) => s + a.amount, 0),
      })).filter(g => g.total > 0);

      const expenseGroups = allExpenseGroups.map(g => {
        const nonCogs = g.accounts.filter(a => !a.account_number.startsWith("EXP-COGS"));
        return { ...g, accounts: nonCogs, total: nonCogs.reduce((s, a) => s + a.amount, 0) };
      }).filter(g => g.total > 0);

      const totalRevenue = revenueGroups.reduce((s, g) => s + g.total, 0);
      const totalCOGS = cogsGroups.reduce((s, g) => s + g.total, 0);
      const grossProfit = totalRevenue - totalCOGS;
      const totalExpenses = expenseGroups.reduce((s, g) => s + g.total, 0);
      const netIncome = grossProfit - totalExpenses;

      return {
        revenueGroups,
        cogsGroups,
        expenseGroups,
        otherIncomeGroups: [] as DetailedPnLGroup[],
        totalRevenue,
        totalCOGS,
        grossProfit,
        totalExpenses,
        totalOtherIncome: 0,
        operatingProfit: netIncome,
        netIncome,
      } as DetailedPnLData;
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Monthly P&L Trend (for charts)
// =====================

export function useMonthlyPnLTrend(startDate?: string, endDate?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["monthly-pnl-trend", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("journal_entry_lines")
        .select(`
          debit_amount, credit_amount, account_id,
          account:accounts!inner(
            account_type:account_types(category, is_debit_normal)
          ),
          journal_entry:journal_entries!inner(entry_date, is_posted)
        `)
        .eq("journal_entry.is_posted", true);

      if (startDate) query = query.gte("journal_entry.entry_date", startDate);
      if (endDate) query = query.lte("journal_entry.entry_date", endDate);

      const { data: lines, error } = await query;
      if (error) throw error;

      const monthly: Record<string, { month: string; revenue: number; expenses: number }> = {};

      for (const line of lines || []) {
        const date = line.journal_entry?.entry_date;
        if (!date) continue;
        const month = date.substring(0, 7); // YYYY-MM
        if (!monthly[month]) monthly[month] = { month, revenue: 0, expenses: 0 };

        const category = line.account?.account_type?.category;
        const isDebitNormal = line.account?.account_type?.is_debit_normal ?? true;
        const amount = isDebitNormal
          ? (Number(line.debit_amount) || 0) - (Number(line.credit_amount) || 0)
          : (Number(line.credit_amount) || 0) - (Number(line.debit_amount) || 0);

        if (category === "revenue") monthly[month].revenue += Math.abs(amount);
        else if (category === "expense") monthly[month].expenses += Math.abs(amount);
      }

      return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// Financial Summary
// =====================

export function useFinancialSummary() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ["financial-summary", profile?.organization_id],
    queryFn: async () => {
      // Get total revenue from invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("total_amount, paid_amount, status");

      if (invoicesError) throw invoicesError;

      // Get total payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount");

      if (paymentsError) throw paymentsError;

      const totalRevenue = (invoices || []).reduce((sum, i) => sum + Number(i.total_amount), 0);
      const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const totalOutstanding = totalRevenue - totalCollected;

      return {
        totalRevenue,
        totalCollected,
        totalOutstanding,
        collectionRate: totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0,
      };
    },
    enabled: !!profile?.organization_id,
  });
}

// =====================
// AR Reconciliation
// =====================
export interface ARReconciliationRow {
  account_id: string;
  account_number: string;
  account_name: string;
  category: string;
  is_debit_normal: boolean;
  opening_balance: number;
  total_debits: number;
  total_credits: number;
  computed_balance: number;
  stored_balance: number;
  variance: number;
  is_matched: boolean;
}

export function useARReconciliation() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ar-reconciliation", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      // 1. Get all posting accounts with their type info
      const { data: accounts, error: accErr } = await supabase
        .from("accounts")
        .select(`
          id, account_number, name, current_balance, opening_balance, is_header, is_active,
          account_type:account_types!accounts_account_type_id_fkey(category, is_debit_normal)
        `)
        .eq("organization_id", profile.organization_id)
        .eq("is_header", false)
        .eq("is_active", true);

      if (accErr) throw accErr;

      // 2. Get all posted journal line totals grouped by account
      const { data: journalLines, error: jlErr } = await supabase
        .from("journal_entry_lines")
        .select(`
          account_id,
          debit_amount,
          credit_amount,
          journal_entry:journal_entries!journal_entry_lines_journal_entry_id_fkey(is_posted, organization_id)
        `)
        .eq("journal_entry.organization_id", profile.organization_id)
        .eq("journal_entry.is_posted", true);

      if (jlErr) throw jlErr;

      // 3. Aggregate journal lines by account_id
      const journalTotals: Record<string, { debits: number; credits: number }> = {};
      (journalLines || []).forEach((line: any) => {
        if (!line.journal_entry) return; // filtered out by inner join
        const aid = line.account_id;
        if (!journalTotals[aid]) journalTotals[aid] = { debits: 0, credits: 0 };
        journalTotals[aid].debits += Number(line.debit_amount) || 0;
        journalTotals[aid].credits += Number(line.credit_amount) || 0;
      });

      // 4. Compute reconciliation rows
      const rows: ARReconciliationRow[] = (accounts || []).map((acc: any) => {
        const accType = acc.account_type;
        const category = accType?.category || "Unknown";
        const isDebitNormal = accType?.is_debit_normal ?? true;
        const opening = Number(acc.opening_balance) || 0;
        const totals = journalTotals[acc.id] || { debits: 0, credits: 0 };

        const computed = isDebitNormal
          ? opening + totals.debits - totals.credits
          : opening + totals.credits - totals.debits;

        const stored = Number(acc.current_balance) || 0;
        const variance = Math.round((computed - stored) * 100) / 100;

        return {
          account_id: acc.id,
          account_number: acc.account_number,
          account_name: acc.name,
          category,
          is_debit_normal: isDebitNormal,
          opening_balance: opening,
          total_debits: totals.debits,
          total_credits: totals.credits,
          computed_balance: Math.round(computed * 100) / 100,
          stored_balance: stored,
          variance,
          is_matched: Math.abs(variance) < 0.01,
        };
      });

      return rows.sort((a, b) => a.account_number.localeCompare(b.account_number));
    },
    enabled: !!profile?.organization_id,
  });
}
