import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Landmark,
  CheckCircle2,
  User,
  CalendarDays,
  CreditCard,
  FileText,
  BookOpen,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DepositDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depositId: string;
}

function useDepositDetail(depositId: string, open: boolean) {
  return useQuery({
    queryKey: ["deposit-detail", depositId],
    queryFn: async () => {
      // Fetch deposit record
      const { data: deposit, error } = await supabase
        .from("patient_deposits")
        .select(`
          *,
          patient:patients!patient_deposits_patient_id_fkey(id, first_name, last_name, patient_number),
          payment_method:payment_methods!patient_deposits_payment_method_id_fkey(name),
          created_by_profile:profiles!patient_deposits_created_by_fkey(full_name)
        `)
        .eq("id", depositId)
        .single();

      if (error) throw error;

      // Fetch linked journal entries via reference
      const { data: journalEntries } = await supabase
        .from("journal_entries")
        .select(`
          id, entry_number, entry_date, description, is_posted,
          lines:journal_entry_lines(
            id, debit_amount, credit_amount, description,
            account:accounts!journal_entry_lines_account_id_fkey(id, name, account_number)
          )
        `)
        .eq("reference_id", depositId)
        .eq("reference_type", "patient_deposit")
        .order("entry_date", { ascending: true });

      return { deposit, journalEntries: journalEntries || [] };
    },
    enabled: !!depositId && open,
  });
}

export function DepositDetailDialog({
  open,
  onOpenChange,
  depositId,
}: DepositDetailDialogProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data, isLoading } = useDepositDetail(depositId, open);

  const deposit = data?.deposit;
  const journalEntries = data?.journalEntries || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            {t("billing.depositDetails")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
          </div>
        ) : !deposit ? (
          <p className="text-muted-foreground text-center py-8">
            {t("common.noData")}
          </p>
        ) : (
          <div className="space-y-5">
            {/* Amount & Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{formatCurrency(Number(deposit.amount))}</p>
                <p className="text-sm text-muted-foreground capitalize">{deposit.type}</p>
              </div>
              <Badge className="bg-success/10 text-success border-success gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {deposit.status}
              </Badge>
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">{t("invoices.patient")}</p>
                  <p className="font-medium">
                    {deposit.patient?.first_name} {deposit.patient?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deposit.patient?.patient_number}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">{t("invoices.date")}</p>
                  <p className="font-medium">
                    {format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">{t("billing.paymentMethod")}</p>
                  <p className="font-medium">
                    {deposit.payment_method?.name || "Cash"}
                  </p>
                </div>
              </div>

              {deposit.reference_number && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">{t("billing.referenceNumber")}</p>
                    <p className="font-medium font-mono">{deposit.reference_number}</p>
                  </div>
                </div>
              )}

              {deposit.created_by_profile?.full_name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">{t("billing.collectedBy")}</p>
                    <p className="font-medium">{deposit.created_by_profile.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            {deposit.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("common.notes")}</p>
                  <p className="text-sm">{deposit.notes}</p>
                </div>
              </>
            )}

            {/* GL / Journal Entries */}
            <Separator />
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4" />
                {t("billing.glEntries")}
              </h4>

              {journalEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  {t("billing.noGLEntries")}
                </p>
              ) : (
                <div className="space-y-3">
                  {journalEntries.map((je: any) => (
                    <div
                      key={je.id}
                      className="border rounded-lg p-3 space-y-2 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {je.entry_number}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(je.entry_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/app/accounts/ledger?journal=${je.id}`}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>

                      {je.description && (
                        <p className="text-xs text-muted-foreground">{je.description}</p>
                      )}

                      {/* DR/CR lines */}
                      <div className="space-y-1">
                        {je.lines?.map((line: any) => (
                          <div
                            key={line.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-muted-foreground">
                                {line.account?.account_number}
                              </span>
                              <span>{line.account?.name}</span>
                            </div>
                            <div className="flex gap-4">
                              {Number(line.debit_amount) > 0 && (
                                <span className="text-success font-medium">
                                  DR {formatCurrency(Number(line.debit_amount))}
                                </span>
                              )}
                              {Number(line.credit_amount) > 0 && (
                                <span className="text-destructive font-medium">
                                  CR {formatCurrency(Number(line.credit_amount))}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Link to patient profile */}
            {deposit.patient?.id && (
              <>
                <Separator />
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/app/patients/${deposit.patient.id}?tab=billing`}>
                    <User className="h-4 w-4 mr-2" />
                    {t("billing.viewPatientBilling")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
