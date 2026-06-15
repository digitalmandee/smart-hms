import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  Wallet,
  Receipt,
  BedDouble,
  Plus,
  Undo2,
  RefreshCw,
  AlertCircle,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useAdmissionRunningBill } from "@/hooks/useAdmissionFinancials";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { RecordDepositDialog } from "@/components/billing/RecordDepositDialog";
import { RefundDepositDialog } from "@/components/billing/RefundDepositDialog";
import { format } from "date-fns";

interface Props {
  admissionId: string;
  patientName?: string;
}

const categoryColor: Record<string, string> = {
  room: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  medication: "bg-green-500/10 text-green-700 dark:text-green-300",
  lab: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  service: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  other: "bg-muted text-muted-foreground",
  pharmacy_credit: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  outstanding_invoice: "bg-red-500/10 text-red-700 dark:text-red-300",
};

export function AdmissionRunningBillPanel({ admissionId, patientName }: Props) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, patientId } = useAdmissionRunningBill(admissionId);

  const [depositOpen, setDepositOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [lastTick, setLastTick] = useState<Date>(new Date());

  // Realtime: ipd_charges (by admission) + patient_deposits (by patient)
  useEffect(() => {
    if (!admissionId) return;
    const channel = supabase
      .channel(`running-bill-${admissionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ipd_charges", filter: `admission_id=eq.${admissionId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admission-running-bill", admissionId] });
          setLastTick(new Date());
        },
      );

    if (patientId) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patient_deposits", filter: `patient_id=eq.${patientId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["patient-balance"] });
          queryClient.invalidateQueries({ queryKey: ["patient-ledger"] });
          setLastTick(new Date());
        },
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [admissionId, patientId, queryClient]);

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isCredit = data.balance < 0;
  const balanceColor = isCredit
    ? "text-green-600 dark:text-green-400"
    : data.balance > 0
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  const prefilledPatient = patientId
    ? {
        id: patientId,
        first_name: patientName?.split(" ")[0] ?? "",
        last_name: patientName?.split(" ").slice(1).join(" ") ?? "",
        patient_number: data.admission.number,
      }
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("ipd.runningBill.title")}
          <Badge variant="outline" className="ml-2 gap-1 text-xs">
            <Radio className="h-3 w-3 animate-pulse text-green-600" />
            {t("ipd.runningBill.live")}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          {data.hasUnbilledCharges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              <AlertCircle className="h-3 w-3 mr-1" />
              {t("ipd.runningBill.unbilled")}
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Summary tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile
            icon={<Receipt className="h-4 w-4 text-primary" />}
            label={t("ipd.runningBill.totalCharges")}
            value={formatCurrency(data.totals.totalCharges)}
          />
          <Tile
            icon={<Wallet className="h-4 w-4 text-primary" />}
            label={t("ipd.runningBill.depositAvailable")}
            value={formatCurrency(data.deposit.available)}
            hint={`${formatCurrency(data.deposit.collected)} ${t("ipd.runningBill.collected")}`}
          />
          <Tile
            icon={<Receipt className={`h-4 w-4 ${balanceColor}`} />}
            label={isCredit ? t("ipd.runningBill.balanceCredit") : t("ipd.runningBill.balanceDue")}
            value={formatCurrency(Math.abs(data.balance))}
            valueClassName={balanceColor}
          />
          <Tile
            icon={<BedDouble className="h-4 w-4 text-blue-500" />}
            label={t("ipd.runningBill.daysAdmitted")}
            value={String(data.admission.daysAdmitted)}
            hint={`${formatCurrency(data.admission.dailyRate)}/day`}
          />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setDepositOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("ipd.runningBill.collectDeposit")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={data.deposit.available <= 0}
            onClick={() => setRefundOpen(true)}
          >
            <Undo2 className="h-4 w-4 mr-1" />
            {t("ipd.runningBill.refund")}
          </Button>
          {patientId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/app/accounts/patient-deposits?patientId=${patientId}`)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              {t("ipd.runningBill.viewLedger")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/app/ipd/charges?admissionId=${admissionId}`)}
          >
            {t("ipd.runningBill.allCharges")}
          </Button>
          <Button
            size="sm"
            variant="default"
            className="ml-auto"
            onClick={() => navigate(`/app/ipd/discharge/${admissionId}`)}
          >
            {t("ipd.runningBill.generateInvoice")}
          </Button>
        </div>

        {/* Itemized lines */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ipd.runningBill.date")}</TableHead>
                <TableHead>{t("ipd.runningBill.category")}</TableHead>
                <TableHead>{t("ipd.runningBill.description")}</TableHead>
                <TableHead className="text-right">{t("ipd.runningBill.qty")}</TableHead>
                <TableHead className="text-right">{t("ipd.runningBill.unit")}</TableHead>
                <TableHead className="text-right">{t("ipd.runningBill.amount")}</TableHead>
                <TableHead>{t("ipd.runningBill.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {t("ipd.runningBill.noCharges")}
                  </TableCell>
                </TableRow>
              ) : (
                data.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(l.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={categoryColor[l.category] || categoryColor.other}>
                        {(t as any)(`ipd.runningBill.category.${l.category}`) || l.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{l.description}</TableCell>
                    <TableCell className="text-right">{l.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(l.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(l.amount)}</TableCell>
                    <TableCell>
                      {l.is_billed ? (
                        <Badge variant="outline" className="text-xs">
                          {t("ipd.runningBill.billed")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          {t("ipd.runningBill.unbilled")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("ipd.runningBill.updatedAt")} {format(lastTick, "HH:mm:ss")} · {data.admission.wardName || "-"} ·{" "}
          {t("ipd.runningBill.bed")} {data.admission.bedNumber || "-"}
        </p>
      </CardContent>

      <RecordDepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        prefilledPatient={prefilledPatient}
        lockPatient
      />
      {patientId && (
        <RefundDepositDialog
          open={refundOpen}
          onOpenChange={setRefundOpen}
          patientId={patientId}
          patientName={patientName}
        />
      )}
    </Card>
  );
}

function Tile({
  icon,
  label,
  value,
  hint,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueClassName || ""}`}>{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
