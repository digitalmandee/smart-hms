import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Plus, Download, Receipt, DollarSign, TrendingDown, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/currency";
import { RecordExpenseDialog } from "@/components/billing/RecordExpenseDialog";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "@/hooks/useExpenses";
import { exportToCSV, formatDate, formatCurrency as exportFormatCurrency } from "@/lib/exportUtils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  petty_cash: "#3b82f6",
  refund: "#ef4444",
  staff_advance: "#f59e0b",
  misc: "#8b5cf6",
  other: "#6b7280",
};

export default function ExpenseManagementPage() {
  const { profile } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: expenses = [], isLoading, refetch } = useQuery({
    queryKey: ["all-expenses", profile?.organization_id, startDate, endDate],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          created_by_profile:profiles!expenses_created_by_fkey(full_name),
          payment_method:payment_methods(name)
        `)
        .eq("organization_id", profile.organization_id)
        .gte("created_at", `${startDate}T00:00:00`)
        .lte("created_at", `${endDate}T23:59:59`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const filtered = expenses.filter((e: any) => {
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchesSearch = !search ||
      e.expense_number?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.paid_to?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpenses = filtered.reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const categoryBreakdown = filtered.reduce((acc: Record<string, number>, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const pieData = Object.entries(categoryBreakdown).map(([key, value]) => ({
    name: EXPENSE_CATEGORY_LABELS[key as ExpenseCategory] || key,
    value,
    color: CATEGORY_COLORS[key] || "#6b7280",
  }));

  const handleExport = () => {
    exportToCSV(filtered, `expenses-${startDate}-to-${endDate}`, [
      { key: "expense_number", header: "Expense #" },
      { key: "created_at", header: "Date", format: (v: string) => formatDate(v) },
      { key: "category", header: "Category", format: (v: string) => EXPENSE_CATEGORY_LABELS[v as ExpenseCategory] || v },
      { key: "description", header: "Description" },
      { key: "paid_to", header: "Paid To" },
      { key: "amount", header: "Amount", format: (v: number) => exportFormatCurrency(v) },
      { key: "created_by_profile", header: "Recorded By", format: (v: any) => v?.full_name || "-" },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Management"
        description="Track and manage all expenses"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Expense Management" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{filtered.length}</div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{Object.keys(categoryBreakdown).length}</div>
                <div className="text-sm text-muted-foreground">Categories Used</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Expense Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Expenses ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Paid To</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense: any) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-mono">{expense.expense_number}</TableCell>
                    <TableCell>{format(new Date(expense.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] || expense.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{expense.description || "-"}</TableCell>
                    <TableCell>{expense.paid_to || "-"}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.created_by_profile?.full_name || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No expenses found for this period.</div>
          )}
        </CardContent>
      </Card>

      <RecordExpenseDialog open={showAdd} onOpenChange={setShowAdd} onSuccess={() => refetch()} />
    </div>
  );
}
