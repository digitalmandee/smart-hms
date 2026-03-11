import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportSummaryCard } from "@/components/reports/ReportSummaryCard";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { Wallet, Banknote, TrendingUp, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const labels = {
  title: { en: "Cash to Bank Deposits", ur: "بینک میں نقد جمع", ar: "إيداعات نقدية في البنك" },
  subtitle: { en: "Track all cash deposits submitted to bank accounts", ur: "بینک اکاؤنٹس میں جمع کی گئی تمام نقد رقم کا ٹریک رکھیں", ar: "تتبع جميع الإيداعات النقدية المقدمة إلى الحسابات البنكية" },
  cashInHand: { en: "Current Cash in Hand", ur: "موجودہ نقد رقم", ar: "النقد الحالي في اليد" },
  totalDeposits: { en: "Total Deposits", ur: "کل جمع", ar: "إجمالي الإيداعات" },
  thisMonth: { en: "This Month", ur: "اس ماہ", ar: "هذا الشهر" },
  lastMonth: { en: "Last Month", ur: "پچھلا مہینہ", ar: "الشهر الماضي" },
  depositCount: { en: "Deposit Count", ur: "جمع کی تعداد", ar: "عدد الإيداعات" },
  dateFrom: { en: "From Date", ur: "تاریخ سے", ar: "من تاريخ" },
  dateTo: { en: "To Date", ur: "تاریخ تک", ar: "إلى تاريخ" },
  bankAccount: { en: "Bank Account", ur: "بینک اکاؤنٹ", ar: "الحساب البنكي" },
  allBanks: { en: "All Bank Accounts", ur: "تمام بینک اکاؤنٹس", ar: "جميع الحسابات البنكية" },
  date: { en: "Date", ur: "تاریخ", ar: "التاريخ" },
  bank: { en: "Bank", ur: "بینک", ar: "البنك" },
  amount: { en: "Amount", ur: "رقم", ar: "المبلغ" },
  referenceNo: { en: "Reference", ur: "حوالہ", ar: "المرجع" },
  description: { en: "Description", ur: "تفصیل", ar: "الوصف" },
  noDeposits: { en: "No cash deposits found for the selected period", ur: "منتخب مدت کے لیے کوئی نقد جمع نہیں ملی", ar: "لم يتم العثور على إيداعات نقدية للفترة المحددة" },
  monthlyBreakdown: { en: "Monthly Breakdown", ur: "ماہانہ تفصیل", ar: "التفصيل الشهري" },
};

interface DepositRow {
  id: string;
  transaction_date: string;
  credit_amount: number;
  reference_number: string | null;
  description: string | null;
  bank_name: string;
  account_number: string;
}

export default function CashToBankReportPage() {
  const { profile } = useAuth();
  const lang = (profile as any)?.organization?.default_language || "en";
  const l = (key: keyof typeof labels) => (labels[key] as any)[lang] || (labels[key] as any).en;
  const { formatCurrency } = useCurrencyFormatter();
  const orgId = profile?.organization_id;

  const [dateFrom, setDateFrom] = useState(format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedBank, setSelectedBank] = useState("all");

  // Fetch cash balance
  const { data: cashAccount } = useQuery({
    queryKey: ["cash-account-balance", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, current_balance, name")
        .eq("organization_id", orgId!)
        .eq("account_number", "CASH-001")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  // Fetch bank accounts for filter
  const { data: bankAccounts } = useQuery({
    queryKey: ["bank-accounts-list", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id, bank_name, account_number")
        .eq("organization_id", orgId!)
        .eq("is_active", true)
        .order("bank_name");
      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });

  // Fetch cash deposit transactions
  const { data: deposits, isLoading } = useQuery({
    queryKey: ["cash-to-bank-deposits", orgId, dateFrom, dateTo, selectedBank],
    queryFn: async () => {
      let query = supabase
        .from("bank_transactions")
        .select("id, transaction_date, credit_amount, reference_number, description, bank_account_id, bank_accounts!inner(bank_name, account_number, organization_id)")
        .eq("transaction_type", "cash_deposit")
        .eq("bank_accounts.organization_id", orgId!)
        .gte("transaction_date", dateFrom)
        .lte("transaction_date", dateTo)
        .order("transaction_date", { ascending: false });

      if (selectedBank !== "all") {
        query = query.eq("bank_account_id", selectedBank);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        transaction_date: row.transaction_date,
        credit_amount: row.credit_amount,
        reference_number: row.reference_number,
        description: row.description,
        bank_name: row.bank_accounts?.bank_name || "-",
        account_number: row.bank_accounts?.account_number || "-",
      })) as DepositRow[];
    },
    enabled: !!orgId,
  });

  // Calculate summaries
  const summaries = useMemo(() => {
    if (!deposits) return { total: 0, thisMonth: 0, lastMonth: 0, count: 0, monthly: [] as { month: string; total: number; count: number }[] };

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    let total = 0, thisMonth = 0, lastMonth = 0;
    const monthlyMap: Record<string, { total: number; count: number }> = {};

    deposits.forEach((d) => {
      total += d.credit_amount;
      const dt = parseISO(d.transaction_date);
      if (dt >= thisMonthStart) thisMonth += d.credit_amount;
      if (dt >= lastMonthStart && dt <= lastMonthEnd) lastMonth += d.credit_amount;

      const monthKey = format(dt, "yyyy-MM");
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { total: 0, count: 0 };
      monthlyMap[monthKey].total += d.credit_amount;
      monthlyMap[monthKey].count += 1;
    });

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({ month, ...data }));

    return { total, thisMonth, lastMonth, count: deposits.length, monthly };
  }, [deposits]);

  const columns: Column<DepositRow>[] = [
    {
      key: "transaction_date",
      header: l("date"),
      sortable: true,
      cell: (row) => format(parseISO(row.transaction_date), "dd MMM yyyy"),
    },
    {
      key: "bank_name",
      header: l("bank"),
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.bank_name}</p>
          <p className="text-xs text-muted-foreground">{row.account_number}</p>
        </div>
      ),
    },
    {
      key: "credit_amount",
      header: l("amount"),
      sortable: true,
      className: "text-right font-semibold",
      cell: (row) => formatCurrency(row.credit_amount),
    },
    {
      key: "reference_number",
      header: l("referenceNo"),
      cell: (row) => row.reference_number || "-",
    },
    {
      key: "description",
      header: l("description"),
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.description || "-"}
        </span>
      ),
    },
  ];

  const exportColumns = [
    { key: "transaction_date", header: "Date", format: (v: any) => v ? format(parseISO(v), "dd MMM yyyy") : "-" },
    { key: "bank_name", header: "Bank" },
    { key: "account_number", header: "Account #" },
    { key: "credit_amount", header: "Amount", format: (v: any) => formatCurrency(v) },
    { key: "reference_number", header: "Reference" },
    { key: "description", header: "Description" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={l("title")}
          description={l("subtitle")}
        />
        <ReportExportButton
          data={deposits || []}
          filename="cash-to-bank-deposits"
          columns={exportColumns}
          title={l("title")}
          pdfOptions={{
            title: l("title"),
            subtitle: l("subtitle"),
            dateRange: { from: new Date(dateFrom), to: new Date(dateTo) },
            orientation: "landscape",
          }}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard
          title={l("cashInHand")}
          value={formatCurrency(cashAccount?.current_balance ?? 0)}
          icon={Wallet}
          variant="info"
        />
        <ReportSummaryCard
          title={l("totalDeposits")}
          value={formatCurrency(summaries.total)}
          subtitle={`${summaries.count} ${l("depositCount").toLowerCase()}`}
          icon={Banknote}
          variant="success"
        />
        <ReportSummaryCard
          title={l("thisMonth")}
          value={formatCurrency(summaries.thisMonth)}
          icon={TrendingUp}
          variant="default"
        />
        <ReportSummaryCard
          title={l("lastMonth")}
          value={formatCurrency(summaries.lastMonth, currencyConfig)}
          icon={Calendar}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{l("dateFrom")}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{l("dateTo")}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{l("bankAccount")}</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{l("allBanks")}</SelectItem>
                  {bankAccounts?.map((ba) => (
                    <SelectItem key={ba.id} value={ba.id}>
                      {ba.bank_name} - {ba.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      {summaries.monthly.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{l("monthlyBreakdown")}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {summaries.monthly.map((m) => (
                <div key={m.month} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{format(parseISO(m.month + "-01"), "MMM yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{m.count} deposits</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatCurrency(m.total, currencyConfig)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposits Table */}
      <ReportTable
        data={deposits || []}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder={`${l("bank")}...`}
        emptyMessage={l("noDeposits")}
        stickyHeader
      />
    </div>
  );
}
