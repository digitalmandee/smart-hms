import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, FileText, Calendar, Hash, CheckCircle, Clock, AlertCircle, Ban, Banknote, Building2 } from "lucide-react";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { toast } from "sonner";
import { useState } from "react";

const VOUCHER_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  CPV: { label: "Cash Payment", color: "bg-orange-100 text-orange-800 border-orange-300" },
  CRV: { label: "Cash Receipt", color: "bg-green-100 text-green-800 border-green-300" },
  BPV: { label: "Bank Payment", color: "bg-blue-100 text-blue-800 border-blue-300" },
  BRV: { label: "Bank Receipt", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  JV: { label: "Journal Voucher", color: "bg-purple-100 text-purple-800 border-purple-300" },
};

const JournalEntryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["journal-entry", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("journal_entries")
        .select(`
          *,
          lines:journal_entry_lines(
            id,
            account:accounts(id, name, account_number),
            description,
            debit_amount,
            credit_amount,
            cost_center_id
          ),
          created_by_profile:profiles!journal_entries_created_by_fkey(id, full_name),
          posted_by_profile:profiles!journal_entries_posted_by_fkey(id, full_name),
          payment_account:accounts!journal_entries_payment_account_id_fkey(id, name, account_number)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!entry || !profile) throw new Error("Missing data");
      // Create reversal entry
      const { data: reversalEntry, error: revError } = await supabase
        .from("journal_entries")
        .insert({
          organization_id: entry.organization_id,
          entry_number: '',
          entry_date: format(new Date(), "yyyy-MM-dd"),
          description: `Reversal of ${entry.entry_number}: ${entry.description || ''}`,
          reference_type: entry.reference_type,
          reference_id: entry.id,
          is_posted: true,
          posted_at: new Date().toISOString(),
          posted_by: profile.id,
          created_by: profile.id,
          branch_id: entry.branch_id,
          voucher_type: entry.voucher_type || 'JV',
          status: 'posted',
        })
        .select("id")
        .single();
      if (revError) throw revError;

      // Insert reversed lines
      const reversalLines = (entry.lines || []).map((line: any) => ({
        journal_entry_id: reversalEntry.id,
        account_id: line.account?.id || line.account_id,
        description: `Reversal: ${line.description || ''}`,
        debit_amount: line.credit_amount || 0,
        credit_amount: line.debit_amount || 0,
      }));
      const { error: linesError } = await supabase.from("journal_entry_lines").insert(reversalLines);
      if (linesError) throw linesError;

      // Mark original as cancelled
      const { error: updateError } = await supabase
        .from("journal_entries")
        .update({
          status: 'cancelled',
          cancelled_by: profile.id,
          cancelled_at: new Date().toISOString(),
          reversal_entry_id: reversalEntry.id,
        })
        .eq("id", entry.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast.success(t("voucher.cancelled_success", "Voucher cancelled and reversal entry created"));
      qc.invalidateQueries({ queryKey: ["journal-entry", id] });
      setShowCancelConfirm(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalDebits = entry?.lines?.reduce((sum: number, line: any) => sum + (line.debit_amount || 0), 0) || 0;
  const totalCredits = entry?.lines?.reduce((sum: number, line: any) => sum + (line.credit_amount || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const voucherInfo = VOUCHER_TYPE_LABELS[(entry as any)?.voucher_type] || VOUCHER_TYPE_LABELS.JV;
  const status = (entry as any)?.status || (entry?.is_posted ? 'posted' : 'draft');

  const getStatusBadge = () => {
    if (status === 'cancelled') {
      return <Badge variant="outline" className="text-destructive border-destructive"><Ban className="h-3 w-3 mr-1" />{t("voucher.status_cancelled", "Cancelled")}</Badge>;
    }
    if (status === 'posted' || entry?.is_posted) {
      return <Badge className="bg-success/10 text-success border-success"><CheckCircle className="h-3 w-3 mr-1" />{t("voucher.status_posted", "Posted")}</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning border-warning"><Clock className="h-3 w-3 mr-1" />{t("voucher.status_draft", "Draft")}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-48" /></div>
        <Card><CardContent className="pt-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <PageHeader title="Journal Entry Not Found" />
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">The journal entry you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => navigate("/app/accounts/journal-entries")} className="mt-4">Back to Journal Entries</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader
          title={`${entry.entry_number}`}
          description={entry.description || "Voucher details"}
          actions={
            status === 'posted' && (
              <Button variant="destructive" size="sm" onClick={() => setShowCancelConfirm(true)}>
                <Ban className="h-4 w-4 mr-1" /> {t("voucher.cancel_voucher", "Cancel Voucher")}
              </Button>
            )
          }
        />
      </div>

      {/* Header Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entry Number</p>
                <p className="font-medium">{entry.entry_number}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Badge className={voucherInfo.color}>{voucherInfo.label}</Badge>
            <p className="text-xs text-muted-foreground mt-1">{(entry as any)?.voucher_type || "JV"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Entry Date</p>
                <p className="font-medium">{format(new Date(entry.entry_date), "dd MMM yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-medium">{entry.reference_id ? `${entry.reference_type || "ref"}: ${String(entry.reference_id).slice(0, 8)}...` : "-"}</p>
              </div>
            </div>
            {entry.reference_type && entry.reference_id && (() => {
              const pathMap: Record<string, string> = {
                invoice: `/app/billing/invoices/${entry.reference_id}`,
                payment: `/app/billing/invoices/${entry.reference_id}`,
                payroll: `/app/hr/payroll/${entry.reference_id}`,
                expense: `/app/accounts/expenses`,
                vendor_payment: `/app/accounts/vendor-payments/${entry.reference_id}`,
                grn: `/app/warehouse/grn/${entry.reference_id}`,
                patient_deposit: `/app/accounts/patient-deposits`,
              };
              const path = pathMap[entry.reference_type];
              return path ? (
                <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-xs" onClick={() => navigate(path)}>
                  View Source →
                </Button>
              ) : null;
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {getStatusBadge()}
            {entry.posted_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Posted: {format(new Date(entry.posted_at), "dd MMM yyyy HH:mm")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Account & Cheque Details (if applicable) */}
      {(entry as any)?.payment_account && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              {t("voucher.payment_account", "Payment/Receipt Account")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Account</p>
                <p className="font-medium">{(entry as any).payment_account.account_number} — {(entry as any).payment_account.name}</p>
              </div>
              {(entry as any)?.cheque_number && (
                <div>
                  <p className="text-muted-foreground">{t("voucher.cheque_no", "Cheque No")}</p>
                  <p className="font-medium">{(entry as any).cheque_number}</p>
                </div>
              )}
              {(entry as any)?.instrument_date && (
                <div>
                  <p className="text-muted-foreground">{t("voucher.instrument_date", "Instrument Date")}</p>
                  <p className="font-medium">{format(new Date((entry as any).instrument_date), "dd MMM yyyy")}</p>
                </div>
              )}
              {(entry as any)?.instrument_reference && (
                <div>
                  <p className="text-muted-foreground">{t("voucher.transaction_ref", "Transaction Ref")}</p>
                  <p className="font-medium">{(entry as any).instrument_reference}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {entry.description && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent><p>{entry.description}</p></CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Line Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entry.lines?.map((line: any) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Link to={`/app/accounts/chart-of-accounts/${line.account?.id}`} className="text-primary hover:underline">
                      {line.account?.account_number} - {line.account?.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{line.description || "-"}</TableCell>
                  <TableCell className="text-right font-mono">{line.debit_amount > 0 ? formatCurrency(line.debit_amount) : "-"}</TableCell>
                  <TableCell className="text-right font-mono">{line.credit_amount > 0 ? formatCurrency(line.credit_amount) : "-"}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold border-t-2">
                <TableCell colSpan={2} className="text-right">Totals:</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(totalDebits)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(totalCredits)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className={`mt-4 p-3 rounded-lg ${isBalanced ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <><CheckCircle className="h-4 w-4 text-success" /><span className="text-success font-medium">Entry is balanced</span></>
              ) : (
                <><AlertCircle className="h-4 w-4 text-destructive" /><span className="text-destructive font-medium">Difference: {formatCurrency(Math.abs(totalDebits - totalCredits))}</span></>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{t("voucher.audit_trail", "Audit Trail")}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p>{entry.created_by_profile?.full_name || "System"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p>{format(new Date(entry.created_at), "dd MMM yyyy HH:mm")}</p>
            </div>
            {entry.posted_by_profile && (
              <div>
                <p className="text-muted-foreground">Posted By</p>
                <p>{entry.posted_by_profile.full_name}</p>
              </div>
            )}
            {entry.posted_at && (
              <div>
                <p className="text-muted-foreground">Posted At</p>
                <p>{format(new Date(entry.posted_at), "dd MMM yyyy HH:mm")}</p>
              </div>
            )}
            {(entry as any)?.cancelled_at && (
              <>
                <div>
                  <p className="text-muted-foreground">Cancelled At</p>
                  <p>{format(new Date((entry as any).cancelled_at), "dd MMM yyyy HH:mm")}</p>
                </div>
              </>
            )}
            {entry.reference_type && (
              <div>
                <p className="text-muted-foreground">Reference Type</p>
                <p className="capitalize">{entry.reference_type}</p>
              </div>
            )}
            {(entry as any)?.external_reference && (
              <div>
                <p className="text-muted-foreground">External Reference</p>
                <p>{(entry as any).external_reference}</p>
              </div>
            )}
            {(entry as any)?.currency && (entry as any).currency !== 'PKR' && (
              <div>
                <p className="text-muted-foreground">Currency / Exchange Rate</p>
                <p>{(entry as any).currency} @ {(entry as any).exchange_rate}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("voucher.cancel_voucher", "Cancel Voucher")}</DialogTitle>
            <DialogDescription>{t("voucher.cancel_confirm", "This will create a reversal entry and mark this voucher as cancelled. Continue?")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>{t("common.cancel", "Cancel")}</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              {t("voucher.cancel_voucher", "Cancel Voucher")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntryDetailPage;
