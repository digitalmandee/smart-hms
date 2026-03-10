import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Unlock, Calendar, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function FiscalPeriodManagementPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; periodId: string; periodName: string; action: "lock" | "unlock" } | null>(null);

  // Fetch fiscal years with their periods
  const { data: fiscalYears, isLoading: fyLoading } = useQuery({
    queryKey: ["fiscal-years-periods", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: budgetPeriods, isLoading: bpLoading } = useQuery({
    queryKey: ["budget-periods-all", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_periods")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Get journal entry count for a period (to show impact)
  const { data: periodStats } = useQuery({
    queryKey: ["period-journal-stats", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, entry_date, is_posted")
        .eq("is_posted", true);

      if (error) throw error;
      return (data || []) as { id: string; entry_date: string; is_posted: boolean }[];
    },
    enabled: !!profile?.organization_id,
  });

  const togglePeriodLock = useMutation({
    mutationFn: async ({ periodId, lock }: { periodId: string; lock: boolean }) => {
      const { error } = await supabase
        .from("budget_periods")
        .update({ is_closed: lock })
        .eq("id", periodId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-periods-all"] });
      queryClient.invalidateQueries({ queryKey: ["fiscal-years-periods"] });
      toast.success(confirmDialog?.action === "lock" ? "Period locked successfully" : "Period unlocked successfully");
      setConfirmDialog(null);
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });

  const toggleFiscalYearLock = useMutation({
    mutationFn: async ({ fyId, lock }: { fyId: string; lock: boolean }) => {
      const updateData: any = { is_closed: lock };
      if (lock) {
        updateData.closed_at = new Date().toISOString();
        updateData.closed_by = profile?.id;
      } else {
        updateData.closed_at = null;
        updateData.closed_by = null;
      }
      const { error } = await supabase
        .from("fiscal_years")
        .update(updateData)
        .eq("id", fyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-years-periods"] });
      queryClient.invalidateQueries({ queryKey: ["budget-periods-all"] });
      toast.success("Fiscal year updated");
    },
    onError: (e: Error) => toast.error("Failed: " + e.message),
  });

  const getJournalCountForPeriod = (startDate: string, endDate: string) => {
    if (!periodStats) return 0;
    return periodStats.filter(j => j.entry_date >= startDate && j.entry_date <= endDate).length;
  };

  const isLoading = fyLoading || bpLoading;

  return (
    <div>
      <PageHeader
        title="Fiscal Period Management"
        description="Lock and unlock accounting periods to prevent unauthorized modifications"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Period Management" },
        ]}
      />

      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Locking a period prevents creating, editing, or reversing journal entries dated within that period.
            This is an essential financial control for audit compliance.
          </AlertDescription>
        </Alert>

        {/* Fiscal Years */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Fiscal Years</CardTitle>
            <CardDescription>Close a fiscal year to lock all its periods at once</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fiscal Year</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Closed At</TableHead>
                    <TableHead className="text-center">Journals</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fiscalYears?.map(fy => (
                    <TableRow key={fy.id}>
                      <TableCell className="font-medium">{fy.name}</TableCell>
                      <TableCell>{format(parseISO(fy.start_date), "dd MMM yyyy")} — {format(parseISO(fy.end_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        {fy.is_closed ? (
                          <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" /> Closed</Badge>
                        ) : fy.is_current ? (
                          <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" /> Current</Badge>
                        ) : (
                          <Badge variant="secondary">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell>{fy.closed_at ? format(parseISO(fy.closed_at), "dd MMM yyyy HH:mm") : "—"}</TableCell>
                      <TableCell className="text-center">{getJournalCountForPeriod(fy.start_date, fy.end_date)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={fy.is_closed ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => toggleFiscalYearLock.mutate({ fyId: fy.id, lock: !fy.is_closed })}
                          disabled={toggleFiscalYearLock.isPending}
                        >
                          {fy.is_closed ? <><Unlock className="h-3 w-3 mr-1" /> Reopen</> : <><Lock className="h-3 w-3 mr-1" /> Close Year</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!fiscalYears?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No fiscal years configured</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Budget Periods (Monthly/Quarterly) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Accounting Periods</CardTitle>
            <CardDescription>Lock individual monthly or quarterly periods</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-48" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Journal Entries</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetPeriods?.map(period => {
                    const journalCount = getJournalCountForPeriod(period.start_date, period.end_date);
                    return (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>{format(parseISO(period.start_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>{format(parseISO(period.end_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          {period.is_closed ? (
                            <Badge variant="destructive" className="gap-1"><Lock className="h-3 w-3" /> Locked</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1"><Unlock className="h-3 w-3" /> Open</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{journalCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={period.is_closed ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => setConfirmDialog({
                              open: true,
                              periodId: period.id,
                              periodName: period.name,
                              action: period.is_closed ? "unlock" : "lock",
                            })}
                          >
                            {period.is_closed ? <><Unlock className="h-3 w-3 mr-1" /> Unlock</> : <><Lock className="h-3 w-3 mr-1" /> Lock</>}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!budgetPeriods?.length && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No accounting periods found. Create periods in Budgets & Fiscal Years.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDialog?.open} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {confirmDialog?.action === "lock" ? "Lock Period?" : "Unlock Period?"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.action === "lock"
                ? `Locking "${confirmDialog?.periodName}" will prevent any journal entries from being created, edited, or reversed within this period.`
                : `Unlocking "${confirmDialog?.periodName}" will allow journal entries to be modified within this period. This should only be done for corrections.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              variant={confirmDialog?.action === "lock" ? "destructive" : "default"}
              onClick={() => confirmDialog && togglePeriodLock.mutate({ periodId: confirmDialog.periodId, lock: confirmDialog.action === "lock" })}
              disabled={togglePeriodLock.isPending}
            >
              {confirmDialog?.action === "lock" ? "Lock Period" : "Unlock Period"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
