import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Wallet,
  Undo2,
  Receipt,
  ExternalLink,
  CreditCard,
  User,
  BedDouble,
} from "lucide-react";
import { format } from "date-fns";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { RecordDepositDialog } from "@/components/billing/RecordDepositDialog";
import { RefundDepositDialog } from "@/components/billing/RefundDepositDialog";
import { PatientDepositLedger } from "@/components/billing/PatientDepositLedger";
import { AdmissionRunningBillPanel } from "@/components/ipd/AdmissionRunningBillPanel";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useCashierPatientSnapshot } from "@/hooks/useCashierWorkspace";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PatientLite {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_number: string;
  phone?: string | null;
}

function usePatient(patientId?: string) {
  return useQuery({
    queryKey: ["cashier-patient", patientId],
    queryFn: async (): Promise<PatientLite | null> => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("patients")
        .select("id, first_name, last_name, patient_number, phone")
        .eq("id", patientId)
        .maybeSingle();
      if (error) throw error;
      return (data as any) ?? null;
    },
    enabled: !!patientId,
  });
}

export default function CashierWorkspacePage() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { hasActiveSession, session, isLoading: sessionLoading } = useRequireSession();

  const initialPatientId = params.get("patientId") || undefined;
  const [selected, setSelected] = useState<PatientLite | null>(null);
  const { data: loadedPatient } = usePatient(initialPatientId);

  useEffect(() => {
    if (loadedPatient && !selected) setSelected(loadedPatient);
  }, [loadedPatient, selected]);

  const snapshot = useCashierPatientSnapshot(selected?.id);

  const [depositOpen, setDepositOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const patientName = useMemo(
    () => (selected ? `${selected.first_name} ${selected.last_name ?? ""}`.trim() : ""),
    [selected]
  );

  const handleSelect = (p: PatientLite) => {
    setSelected(p);
    setParams({ patientId: p.id }, { replace: true });
  };

  const handleClear = () => {
    setSelected(null);
    setParams({}, { replace: true });
  };

  if (sessionLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!hasActiveSession) {
    return (
      <div className="container max-w-3xl py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("billing.cashier.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{t("billing.noActiveSession")}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate("/app/billing/sessions")}>
              {t("billing.cashier.openSession")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Session strip */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{t("billing.cashier.session")}</Badge>
            <span className="text-muted-foreground">
              {session?.counter_type ?? ""} · {session?.opened_at ? format(new Date(session.opened_at), "PPp") : ""}
            </span>
          </div>
          <div className="text-muted-foreground">
            {t("billing.cashier.openingFloat")}: {formatCurrency(Number(session?.opening_balance ?? 0))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left pane: patient search + selected card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("billing.cashier.findPatient")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PatientSearch
                onSelect={(p) => handleSelect(p as PatientLite)}
                selectedPatient={selected as any}
              />
              {selected && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={handleClear}>
                  {t("common.clear")}
                </Button>
              )}
            </CardContent>
          </Card>

          {selected && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {patientName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">#{selected.patient_number}</div>
                {snapshot.activeAdmission && (
                  <Badge variant="outline" className="gap-1">
                    <BedDouble className="h-3 w-3" />
                    {snapshot.activeAdmission.admission_number}
                  </Badge>
                )}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">{t("billing.cashier.depositAvailable")}</div>
                    <div className="font-semibold">{formatCurrency(snapshot.totals.depositAvailable)}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-xs text-muted-foreground">{t("billing.cashier.netDue")}</div>
                    <div className="font-semibold text-destructive">{formatCurrency(snapshot.totals.netDue)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right pane: tabs + actions */}
        <div className="space-y-4">
          {!selected ? (
            <Card>
              <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                {t("billing.cashier.selectPatientPrompt")}
              </CardContent>
            </Card>
          ) : (
            <>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">{t("billing.cashier.tabSummary")}</TabsTrigger>
                  <TabsTrigger value="charges">{t("billing.cashier.tabCharges")}</TabsTrigger>
                  <TabsTrigger value="deposits">{t("billing.cashier.tabDeposits")}</TabsTrigger>
                  <TabsTrigger value="pay">{t("billing.cashier.tabPay")}</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4 pt-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <KpiTile
                      icon={<Receipt className="h-4 w-4" />}
                      label={t("billing.cashier.netDue")}
                      value={formatCurrency(snapshot.totals.netDue)}
                      tone="destructive"
                    />
                    <KpiTile
                      icon={<Wallet className="h-4 w-4" />}
                      label={t("billing.cashier.depositAvailable")}
                      value={formatCurrency(snapshot.totals.depositAvailable)}
                    />
                    <KpiTile
                      icon={<CreditCard className="h-4 w-4" />}
                      label={t("billing.cashier.outstandingInvoices")}
                      value={String(snapshot.outstandingInvoices.length)}
                    />
                    <KpiTile
                      icon={<CreditCard className="h-4 w-4" />}
                      label={t("billing.cashier.pharmacyCredit")}
                      value={formatCurrency(
                        snapshot.pharmacyCredits.reduce((s, c) => s + c.balance, 0)
                      )}
                    />
                  </div>

                  {snapshot.activeAdmission && (
                    <AdmissionRunningBillPanel
                      admissionId={snapshot.activeAdmission.id}
                      patientName={patientName}
                    />
                  )}
                </TabsContent>

                <TabsContent value="charges" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t("billing.cashier.openCharges")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {snapshot.outstandingInvoices.length === 0 &&
                      snapshot.pharmacyCredits.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          {t("billing.cashier.noOpenCharges")}
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("common.date")}</TableHead>
                              <TableHead>{t("billing.cashier.category")}</TableHead>
                              <TableHead>{t("common.reference")}</TableHead>
                              <TableHead className="text-end">{t("invoices.amount")}</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {snapshot.outstandingInvoices.map((inv) => (
                              <TableRow key={inv.id}>
                                <TableCell>{format(new Date(inv.created_at), "PP")}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{t("billing.cashier.invoice")}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{inv.invoice_number}</TableCell>
                                <TableCell className="text-end">{formatCurrency(inv.outstanding)}</TableCell>
                                <TableCell className="text-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/app/billing/invoices/${inv.id}/pay`)}
                                  >
                                    {t("billing.cashier.settle")}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {snapshot.pharmacyCredits.map((c) => (
                              <TableRow key={c.id}>
                                <TableCell>{format(new Date(c.created_at), "PP")}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{t("billing.cashier.pharmacyCredit")}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">—</TableCell>
                                <TableCell className="text-end">{formatCurrency(c.balance)}</TableCell>
                                <TableCell />
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="deposits" className="pt-4">
                  <PatientDepositLedger
                    patientId={selected.id}
                    patientName={patientName}
                    onRecordDeposit={() => setDepositOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="pay" className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{t("billing.cashier.payInvoice")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {snapshot.outstandingInvoices.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          {t("billing.cashier.noOpenInvoices")}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {snapshot.outstandingInvoices.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex items-center justify-between rounded-md border p-3"
                            >
                              <div>
                                <div className="font-medium">{inv.invoice_number}</div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(inv.created_at), "PPp")}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-end">
                                  <div className="text-xs text-muted-foreground">
                                    {t("invoices.outstanding")}
                                  </div>
                                  <div className="font-semibold">{formatCurrency(inv.outstanding)}</div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => navigate(`/app/billing/invoices/${inv.id}/pay`)}
                                >
                                  {t("billing.cashier.collect")}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Sticky action bar */}
              <Card className="sticky bottom-2">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
                  <div className="text-sm text-muted-foreground">
                    {t("billing.cashier.actionsFor")}: <span className="font-medium">{patientName}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setDepositOpen(true)}>
                      <Wallet className="me-2 h-4 w-4" />
                      {t("billing.cashier.collectDeposit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRefundOpen(true)}
                      disabled={snapshot.totals.depositAvailable <= 0}
                    >
                      <Undo2 className="me-2 h-4 w-4" />
                      {t("billing.cashier.refund")}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/app/billing/patient-statement/${selected.id}`}>
                        <ExternalLink className="me-2 h-4 w-4" />
                        {t("billing.cashier.viewStatement")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {selected && (
        <>
          <RecordDepositDialog
            open={depositOpen}
            onOpenChange={setDepositOpen}
            prefilledPatient={selected as any}
            lockPatient
          />
          <RefundDepositDialog
            open={refundOpen}
            onOpenChange={setRefundOpen}
            patientId={selected.id}
            patientName={patientName}
          />
        </>
      )}
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={`mt-1 text-xl font-semibold ${tone === "destructive" ? "text-destructive" : ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
