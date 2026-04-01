import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  ArrowLeft,
} from "lucide-react";

function useDepositDetail(depositId: string) {
  return useQuery({
    queryKey: ["deposit-detail", depositId],
    queryFn: async () => {
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
        .eq("reference_type", "deposit")
        .order("entry_date", { ascending: true });

      return { deposit, journalEntries: journalEntries || [] };
    },
    enabled: !!depositId,
  });
}

export default function DepositDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data, isLoading } = useDepositDetail(id || "");

  const deposit = data?.deposit;
  const journalEntries = data?.journalEntries || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("billing.depositDetail")} />
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("billing.depositDetail")} />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("common.noData")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    deposit: "bg-success/10 text-success border-success",
    refund: "bg-destructive/10 text-destructive border-destructive",
    applied: "bg-primary/10 text-primary border-primary",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("billing.depositDetail")}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Button>
        }
      />

      {/* Amount & Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Landmark className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{formatCurrency(Number(deposit.amount))}</p>
                <p className="text-sm text-muted-foreground capitalize">{deposit.type}</p>
              </div>
            </div>
            <Badge className={`${typeColors[deposit.type] || typeColors.deposit} gap-1`}>
              <CheckCircle2 className="h-3 w-3" />
              {deposit.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("common.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">{t("invoices.patient")}</p>
                <Link
                  to={`/app/patients/${deposit.patient?.id}?tab=billing`}
                  className="font-medium text-primary hover:underline"
                >
                  {deposit.patient?.first_name} {deposit.patient?.last_name}
                </Link>
                <p className="text-xs text-muted-foreground">{deposit.patient?.patient_number}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">{t("invoices.date")}</p>
                <p className="font-medium">{format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">{t("billing.paymentMethod")}</p>
                <p className="font-medium">{deposit.payment_method?.name || "Cash"}</p>
              </div>
            </div>

            {deposit.reference_number && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("billing.referenceNumber")}</p>
                    <p className="font-medium font-mono">{deposit.reference_number}</p>
                  </div>
                </div>
              </>
            )}

            {deposit.created_by_profile?.full_name && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("billing.collectedBy")}</p>
                    <p className="font-medium">{deposit.created_by_profile.full_name}</p>
                  </div>
                </div>
              </>
            )}

            {deposit.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("common.notes")}</p>
                  <p className="text-sm">{deposit.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* GL / Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t("billing.glEntries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {journalEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4">
                {t("billing.noGLEntries")}
              </p>
            ) : (
              <div className="space-y-4">
                {journalEntries.map((je: any) => (
                  <div key={je.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
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
                        <Link to={`/app/accounts/general-ledger?journal=${je.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t("billing.viewInGL")}
                        </Link>
                      </Button>
                    </div>

                    {je.description && (
                      <p className="text-xs text-muted-foreground">{je.description}</p>
                    )}

                    <div className="space-y-2">
                      {je.lines?.map((line: any) => (
                        <div key={line.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-muted-foreground text-xs">
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
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {deposit.patient?.id && (
        <Card>
          <CardContent className="pt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/app/patients/${deposit.patient.id}?tab=billing`}>
                <User className="h-4 w-4 mr-2" />
                {t("billing.viewPatientBilling")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
