import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Monitor, Clock, DollarSign, CreditCard, Layers } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n/translations/en";
import { useTranslation } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import {
  useSession,
  useSessionTransactions,
  SessionStatus,
  CounterType,
  CashDenominations,
} from "@/hooks/useBillingSessions";
import { CloseSessionDialog } from "@/components/billing/CloseSessionDialog";
import { useState, useMemo } from "react";

const COUNTER_LABELS: Record<CounterType, TranslationKey> = {
  reception: "billing.counterReception",
  opd: "billing.counterOpd",
  ipd: "billing.counterIpd",
  pharmacy: "billing.counterPharmacy",
  er: "billing.counterEr",
};

const SHIFT_LABELS: Record<string, TranslationKey> = {
  morning: "billing.shiftMorning",
  evening: "billing.shiftEvening",
  night: "billing.shiftNight",
};

export default function SessionDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(id);
  const { data: transactions, isLoading: txLoading } = useSessionTransactions(id);
  const [showClose, setShowClose] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!session) {
    return <div className="text-center py-12 text-muted-foreground">{t("common.noResults")}</div>;
  }

  const statusLabel: Record<SessionStatus, string> = {
    open: t("billing.open"),
    closed: t("billing.closed"),
    reconciled: t("billing.reconciled"),
  };

  const denominations = session.cash_denominations as CashDenominations | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("billing.sessionDetail")} — ${session.session_number}`}
        breadcrumbs={[
          { label: t("nav.billing"), href: "/app/billing" },
          { label: t("billing.sessionsPage"), href: "/app/billing/sessions" },
          { label: session.session_number },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/billing/sessions")}>
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
            {session.status === "open" && (
              <Button onClick={() => setShowClose(true)}>{t("billing.closeSession")}</Button>
            )}
          </div>
        }
      />

      {/* Session Info */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("billing.counter")}</p>
                <p className="font-medium">{t(COUNTER_LABELS[session.counter_type])}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("billing.shift")}</p>
                <p className="font-medium">{session.shift || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("billing.openedAt")}</p>
              <p className="font-medium">{format(new Date(session.opened_at), "dd MMM yyyy hh:mm a")}</p>
              <p className="text-xs text-muted-foreground">{session.opened_by_profile?.full_name}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("common.status")}</p>
              <Badge variant={session.status === "open" ? "default" : "secondary"}>
                {statusLabel[session.status]}
              </Badge>
              {session.closed_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("billing.closed")}: {format(new Date(session.closed_at), "hh:mm a")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t("billing.cashBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t("billing.openingCash")}</p>
              <p className="text-xl font-bold">{formatCurrency(session.opening_cash)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t("billing.collections")}</p>
              <p className="text-xl font-bold">{formatCurrency(session.total_collections)}</p>
              <p className="text-xs text-muted-foreground">{session.transaction_count} {t("billing.transactions")}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t("billing.expectedCash")}</p>
              <p className="text-xl font-bold">{formatCurrency(session.expected_cash)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t("billing.actualCash")}</p>
              <p className="text-xl font-bold">{session.actual_cash != null ? formatCurrency(session.actual_cash) : "—"}</p>
              {session.cash_difference != null && session.cash_difference !== 0 && (
                <p className={`text-sm font-medium ${session.cash_difference < 0 ? "text-destructive" : "text-green-600"}`}>
                  {t("billing.difference")}: {formatCurrency(session.cash_difference)}
                </p>
              )}
            </div>
          </div>

          {/* Payment method breakdown */}
          {(session.card_total > 0 || session.upi_total > 0 || session.other_total > 0) && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {session.card_total > 0 && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{t("billing.cardPayments")}: {formatCurrency(session.card_total)}</span>
                </div>
              )}
              {session.upi_total > 0 && (
                <span>{t("billing.upiOnline")}: {formatCurrency(session.upi_total)}</span>
              )}
              {session.other_total > 0 && (
                <span>{t("billing.other")}: {formatCurrency(session.other_total)}</span>
              )}
            </div>
          )}

          {/* Denomination breakdown */}
          {denominations && Object.keys(denominations).length > 0 && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">Cash Denominations</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {Object.entries(denominations).map(([key, count]) =>
                  count && count > 0 ? (
                    <span key={key} className="bg-background rounded px-2 py-1 border">
                      {key.replace("note_", "₨")} × {count}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Discrepancy */}
          {session.discrepancy_reason && (
            <div className="mt-4 rounded-lg border-destructive/30 border p-3 bg-destructive/5">
              <p className="text-sm font-medium text-destructive">{t("billing.discrepancy")}</p>
              <p className="text-sm">{session.discrepancy_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("billing.transactionList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.time")}</TableHead>
                    <TableHead>{t("billing.invoiceNumber")}</TableHead>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("billing.paymentMethod")}</TableHead>
                    <TableHead className="text-right">{t("common.amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">{format(new Date(tx.created_at), "hh:mm a")}</TableCell>
                      <TableCell className="font-mono text-sm">{tx.invoice?.invoice_number || "—"}</TableCell>
                      <TableCell>
                        {tx.invoice?.patient
                          ? `${tx.invoice.patient.first_name} ${tx.invoice.patient.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell>{tx.payment_method?.name || "—"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(tx.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">{t("billing.noTransactions")}</p>
          )}
        </CardContent>
      </Card>

      {session.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("common.notes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
          </CardContent>
        </Card>
      )}

      {showClose && (
        <CloseSessionDialog
          open={showClose}
          onOpenChange={setShowClose}
          sessionId={session.id}
        />
      )}
    </div>
  );
}
