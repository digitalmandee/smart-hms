import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Check, Lock, RefreshCw, MoreHorizontal, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useFiscalYears, useCreateFiscalYear, useCurrentFiscalYear, useAccounts } from "@/hooks/useAccounts";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showNewFiscalYear, setShowNewFiscalYear] = useState(false);
  const [showNewBudget, setShowNewBudget] = useState(false);
  const [newFiscalYear, setNewFiscalYear] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [newBudget, setNewBudget] = useState({ account_id: "", allocated_amount: "" });

  const { data: fiscalYears, isLoading, refetch } = useFiscalYears();
  const createFiscalYear = useCreateFiscalYear();
  const { data: currentFiscalYear } = useCurrentFiscalYear();
  const { data: accounts } = useAccounts({ isActive: true });

  // Get expense accounts for budget allocation
  const expenseAccounts = (accounts as any[])?.filter((a: any) => a.account_type?.category === "expense") || [];

  // Fetch or create a budget_period for the current fiscal year
  const { data: budgetPeriod } = useQuery({
    queryKey: ["budget-period", currentFiscalYear?.id],
    queryFn: async () => {
      // Try to find existing
      const { data, error } = await supabase
        .from("budget_periods")
        .select("*")
        .eq("fiscal_year_id", currentFiscalYear!.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      // Create one
      const { data: created, error: createErr } = await supabase
        .from("budget_periods")
        .insert({
          fiscal_year_id: currentFiscalYear!.id,
          organization_id: profile!.organization_id!,
          name: currentFiscalYear!.name,
          start_date: currentFiscalYear!.start_date,
          end_date: currentFiscalYear!.end_date,
        })
        .select()
        .single();
      if (createErr) throw createErr;
      return created;
    },
    enabled: !!currentFiscalYear?.id && !!profile?.organization_id,
  });

  // Fetch budget allocations for current fiscal year via budget_period
  const { data: budgetAllocations, isLoading: budgetsLoading } = useQuery({
    queryKey: ["budget-allocations", budgetPeriod?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_allocations")
        .select("*, account:accounts(id, name, account_number)")
        .eq("budget_period_id", budgetPeriod!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!budgetPeriod?.id,
  });

  // Fetch actual spent amounts from journal entries for those accounts
  const { data: actualSpentMap } = useQuery({
    queryKey: ["budget-actuals", currentFiscalYear?.id, budgetAllocations?.map((b: any) => b.account_id)],
    queryFn: async () => {
      if (!budgetAllocations?.length || !currentFiscalYear) return {};
      const accountIds = budgetAllocations.map((b: any) => b.account_id);
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select("account_id, debit_amount, journal_entry:journal_entries!inner(is_posted, entry_date)")
        .in("account_id", accountIds)
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", currentFiscalYear.start_date)
        .lte("journal_entry.entry_date", currentFiscalYear.end_date);
      if (error) throw error;
      const map: Record<string, number> = {};
      (data || []).forEach((line: any) => {
        map[line.account_id] = (map[line.account_id] || 0) + (line.debit_amount || 0);
      });
      return map;
    },
    enabled: !!budgetAllocations?.length && !!currentFiscalYear,
  });

  // Create budget allocation
  const createBudget = useMutation({
    mutationFn: async (values: { account_id: string; allocated_amount: number }) => {
      const { error } = await supabase.from("budget_allocations").insert({
        account_id: values.account_id,
        allocated_amount: values.allocated_amount,
        budget_period_id: budgetPeriod!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Budget allocation created");
      queryClient.invalidateQueries({ queryKey: ["budget-allocations"] });
      setShowNewBudget(false);
      setNewBudget({ account_id: "", allocated_amount: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Set fiscal year as current
  const setAsCurrent = useMutation({
    mutationFn: async (fyId: string) => {
      // First unset all current flags for this org
      const { error: unsetError } = await supabase
        .from("fiscal_years")
        .update({ is_current: false })
        .eq("organization_id", profile!.organization_id!);
      if (unsetError) throw unsetError;
      // Set selected as current
      const { error } = await supabase
        .from("fiscal_years")
        .update({ is_current: true })
        .eq("id", fyId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fiscal year set as current");
      queryClient.invalidateQueries({ queryKey: ["fiscal-years"] });
      queryClient.invalidateQueries({ queryKey: ["current-fiscal-year"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Close fiscal year
  const closeYear = useMutation({
    mutationFn: async (fyId: string) => {
      const { error } = await supabase
        .from("fiscal_years")
        .update({ is_closed: true })
        .eq("id", fyId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fiscal year closed successfully");
      queryClient.invalidateQueries({ queryKey: ["fiscal-years"] });
      queryClient.invalidateQueries({ queryKey: ["current-fiscal-year"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleCreateFiscalYear = async () => {
    if (!newFiscalYear.name || !newFiscalYear.start_date || !newFiscalYear.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createFiscalYear.mutateAsync(newFiscalYear);
      setShowNewFiscalYear(false);
      setNewFiscalYear({ name: "", start_date: "", end_date: "", is_current: false });
    } catch { /* handled */ }
  };

  // Overall budget summary
  const totalAllocated = budgetAllocations?.reduce((s: number, b: any) => s + (b.allocated_amount || 0), 0) || 0;
  const totalSpent = budgetAllocations?.reduce((s: number, b: any) => s + ((actualSpentMap || {})[b.account_id] || 0), 0) || 0;
  const overallPercent = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets & Fiscal Years"
        description="Manage fiscal year periods and budget allocations"
        breadcrumbs={[{ label: "Accounts", href: "/app/accounts" }, { label: "Budgets & Fiscal Years" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            <Dialog open={showNewFiscalYear} onOpenChange={setShowNewFiscalYear}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Fiscal Year</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Fiscal Year</DialogTitle>
                  <DialogDescription>Add a new fiscal year period for your organization</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="e.g., FY 2025-26" value={newFiscalYear.name} onChange={(e) => setNewFiscalYear({ ...newFiscalYear, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date *</Label>
                      <Input id="start_date" type="date" value={newFiscalYear.start_date} onChange={(e) => setNewFiscalYear({ ...newFiscalYear, start_date: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date *</Label>
                      <Input id="end_date" type="date" value={newFiscalYear.end_date} onChange={(e) => setNewFiscalYear({ ...newFiscalYear, end_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>Set as Current</Label>
                      <p className="text-sm text-muted-foreground">Make this the active fiscal year</p>
                    </div>
                    <Switch checked={newFiscalYear.is_current} onCheckedChange={(checked) => setNewFiscalYear({ ...newFiscalYear, is_current: checked })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewFiscalYear(false)}>Cancel</Button>
                  <Button onClick={handleCreateFiscalYear} disabled={createFiscalYear.isPending}>{createFiscalYear.isPending ? "Creating..." : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Current Fiscal Year Card */}
      {currentFiscalYear && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Current Fiscal Year</CardTitle>
                <CardDescription>{currentFiscalYear.name}</CardDescription>
              </div>
              <Badge className="bg-primary">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Start Date</div><div className="font-medium">{format(new Date(currentFiscalYear.start_date), "dd MMM yyyy")}</div></div>
              <div><div className="text-sm text-muted-foreground">End Date</div><div className="font-medium">{format(new Date(currentFiscalYear.end_date), "dd MMM yyyy")}</div></div>
              <div><div className="text-sm text-muted-foreground">Status</div><div className="font-medium flex items-center gap-1"><Check className="h-4 w-4 text-green-600" />Open</div></div>
              <div><div className="text-sm text-muted-foreground">Days Remaining</div><div className="font-medium">{Math.max(0, Math.ceil((new Date(currentFiscalYear.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days</div></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fiscal Years List */}
      <Card>
        <CardHeader><CardTitle>All Fiscal Years</CardTitle><CardDescription>Manage fiscal year periods</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fiscalYears?.map((fy) => (
                  <TableRow key={fy.id}>
                    <TableCell className="font-medium">{fy.name}</TableCell>
                    <TableCell>{format(new Date(fy.start_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>{format(new Date(fy.end_date), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      {fy.is_closed ? <Badge variant="secondary" className="gap-1"><Lock className="h-3 w-3" />Closed</Badge> : fy.is_current ? <Badge className="bg-green-100 text-green-800">Current</Badge> : <Badge variant="outline">Open</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setAsCurrent.mutate(fy.id)}>Set as Current</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/app/accounts/reports/profit-loss`)}>View Reports</DropdownMenuItem>
                          {!fy.is_closed && <DropdownMenuItem className="text-destructive" onClick={() => closeYear.mutate(fy.id)}>Close Year</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && fiscalYears?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No fiscal years configured. Create your first fiscal year to get started.</div>
          )}
        </CardContent>
      </Card>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />{t("accounts.budgetAllocation" as any, "Budget vs Actual")}</CardTitle>
              <CardDescription>Budget utilization for {currentFiscalYear?.name || "current fiscal year"}</CardDescription>
            </div>
            {currentFiscalYear && (
              <Dialog open={showNewBudget} onOpenChange={setShowNewBudget}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Budget</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t("accounts.budgetAllocation" as any, "Budget Allocation")}</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Expense Account</Label>
                      <Select value={newBudget.account_id} onValueChange={(v) => setNewBudget({ ...newBudget, account_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {expenseAccounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.account_number} — {a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Allocated Amount</Label>
                      <Input type="number" min="0" value={newBudget.allocated_amount} onChange={(e) => setNewBudget({ ...newBudget, allocated_amount: e.target.value })} placeholder="0.00" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewBudget(false)}>Cancel</Button>
                    <Button disabled={createBudget.isPending || !newBudget.account_id || !newBudget.allocated_amount} onClick={() => createBudget.mutate({ account_id: newBudget.account_id, allocated_amount: parseFloat(newBudget.allocated_amount) })}>
                      {createBudget.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!currentFiscalYear ? (
            <div className="text-center py-8 text-muted-foreground">Set up a fiscal year first to manage budgets.</div>
          ) : budgetsLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <>
              {/* Overall summary */}
              {budgetAllocations && budgetAllocations.length > 0 && (
                <div className="mb-6 p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Budget Utilization</span>
                    <span className={`text-sm font-bold ${overallPercent > 100 ? "text-destructive" : overallPercent > 80 ? "text-amber-600" : "text-green-600"}`}>{overallPercent}%</span>
                  </div>
                  <Progress value={Math.min(overallPercent, 100)} className={`h-3 ${overallPercent > 100 ? "[&>div]:bg-destructive" : overallPercent > 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`} />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{t("accounts.budgetAllocation" as any, "Allocated")}: {formatCurrency(totalAllocated)}</span>
                    <span>{t("accounts.actualSpent" as any, "Spent")}: {formatCurrency(totalSpent)}</span>
                  </div>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">{t("accounts.budgetAllocation" as any, "Budget Allocated")}</TableHead>
                    <TableHead className="text-right">{t("accounts.actualSpent" as any, "Actual Spent")}</TableHead>
                    <TableHead className="text-right">{t("accounts.variance" as any, "Variance")}</TableHead>
                    <TableHead className="text-right">{t("accounts.percentUsed" as any, "% Used")}</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetAllocations?.map((b: any) => {
                    const spent = (actualSpentMap || {})[b.account_id] || 0;
                    const variance = b.allocated_amount - spent;
                    const pct = b.allocated_amount > 0 ? Math.round((spent / b.allocated_amount) * 100) : 0;
                    const colorClass = pct > 100 ? "text-destructive" : pct > 80 ? "text-amber-600" : "text-green-600";
                    const barClass = pct > 100 ? "[&>div]:bg-destructive" : pct > 80 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500";
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.account?.name || "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.allocated_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(spent)}</TableCell>
                        <TableCell className={`text-right ${variance < 0 ? "text-destructive" : ""}`}>{formatCurrency(variance)}</TableCell>
                        <TableCell className={`text-right font-bold ${colorClass}`}>{pct}%</TableCell>
                        <TableCell><Progress value={Math.min(pct, 100)} className={`h-2 ${barClass}`} /></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {budgetAllocations?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No budget allocations yet. Click "Add Budget" to get started.</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
