import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wallet, ArrowDownCircle, ArrowUpCircle, RotateCcw, Printer, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { usePatientLedger, useDepositBalance } from "@/hooks/usePatientDeposits";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { RefundDepositDialog } from "./RefundDepositDialog";

interface Props {
  patientId: string;
  patientName?: string;
  onRecordDeposit?: () => void;
}

export function PatientDepositLedger({ patientId, patientName, onRecordDeposit }: Props) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data: rows, isLoading } = usePatientLedger(patientId);
  const { data: balance } = useDepositBalance(patientId);
  const [refundOpen, setRefundOpen] = useState(false);

  const totalDeposits = balance?.deposits ?? 0;
  const totalRefunds = balance?.refunds ?? 0;
  const totalApplied = balance?.applied ?? 0;
  const available = balance?.balance ?? 0;

  const typeBadge = (type: string) => {
    const variant = type === "deposit" ? "default" : type === "refund" ? "destructive" : "secondary";
    return <Badge variant={variant as any}>{t(`deposits.type.${type}` as any)}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("deposits.totalDeposits")}</p>
          <div className="text-xl font-bold text-green-600 flex items-center gap-2 mt-1">
            <ArrowDownCircle className="h-5 w-5" />{formatCurrency(totalDeposits)}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("deposits.totalRefunds")}</p>
          <div className="text-xl font-bold text-red-600 flex items-center gap-2 mt-1">
            <ArrowUpCircle className="h-5 w-5" />{formatCurrency(totalRefunds)}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("deposits.totalApplied")}</p>
          <div className="text-xl font-bold mt-1">{formatCurrency(totalApplied)}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("deposits.availableBalance")}</p>
          <div className="text-xl font-bold text-blue-600 flex items-center gap-2 mt-1">
            <Wallet className="h-5 w-5" />{formatCurrency(available)}
          </div>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold">{t("deposits.ledgerTitle")}</h3>
        <div className="ms-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" />{t("deposits.printStatement")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefundOpen(true)}
            disabled={available <= 0}
          >
            <RotateCcw className="h-4 w-4 mr-1" />{t("deposits.refund")}
          </Button>
          {onRecordDeposit && (
            <Button size="sm" onClick={onRecordDeposit}>
              <Plus className="h-4 w-4 mr-1" />{t("deposits.recordDeposit")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("ledger.type.label")}</TableHead>
                  <TableHead>{t("deposits.referenceNumber")}</TableHead>
                  <TableHead>{t("billing.paymentMethod")}</TableHead>
                  <TableHead className="text-right">{t("ledger.amount") !== "ledger.amount" ? t("ledger.amount") : "Amount"}</TableHead>
                  <TableHead className="text-right">{t("deposits.runningBalance")}</TableHead>
                  <TableHead>{t("common.notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rows || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t("deposits.noTransactions")}
                    </TableCell>
                  </TableRow>
                ) : (
                  (rows || []).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{format(new Date(r.date), "dd MMM yyyy HH:mm")}</TableCell>
                      <TableCell>{typeBadge(r.type)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {r.invoice_id ? (
                          <Link to={`/app/billing/invoices/${r.invoice_id}`} className="text-primary hover:underline inline-flex items-center gap-1">
                            {r.invoice_number || r.reference || t("deposits.appliedToInvoice")}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (r.reference || "—")}
                      </TableCell>
                      <TableCell className="text-xs">{r.payment_method_name || "—"}</TableCell>
                      <TableCell className={`text-right font-mono ${r.signed_amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {r.signed_amount >= 0 ? "+" : "−"}{formatCurrency(r.amount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(r.running_balance)}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">{r.notes || "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RefundDepositDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        patientId={patientId}
        patientName={patientName}
      />
    </div>
  );
}
