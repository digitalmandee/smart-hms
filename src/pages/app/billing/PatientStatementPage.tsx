import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, CreditCard, Wallet, Receipt, MinusCircle, FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { usePatientStatement } from "@/hooks/usePatientStatement";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganizations";
import {
  StatementPDFTemplate,
  StatementLanguage,
} from "@/components/finance/StatementPDFTemplate";
import { generateStatementPDF, computeAgingFromEntries } from "@/lib/generateStatementPDF";
import { toast } from "sonner";

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  invoice: { label: "Invoice", color: "bg-blue-100 text-blue-800", icon: FileText },
  payment: { label: "Payment", color: "bg-green-100 text-green-800", icon: CreditCard },
  deposit: { label: "Deposit", color: "bg-purple-100 text-purple-800", icon: Wallet },
  deposit_applied: { label: "Deposit Applied", color: "bg-teal-100 text-teal-800", icon: Wallet },
  deposit_refund: { label: "Deposit Refund", color: "bg-orange-100 text-orange-800", icon: Wallet },
  credit_note: { label: "Credit Note", color: "bg-amber-100 text-amber-800", icon: Receipt },
  write_off: { label: "Write Off", color: "bg-red-100 text-red-800", icon: MinusCircle },
};

const TYPE_LABELS: Record<StatementLanguage, Record<string, string>> = {
  en: { invoice: "Invoice", payment: "Payment", deposit: "Deposit", deposit_applied: "Deposit Applied", deposit_refund: "Deposit Refund", credit_note: "Credit Note", write_off: "Write Off" },
  ar: { invoice: "فاتورة", payment: "دفعة", deposit: "إيداع", deposit_applied: "إيداع مستخدم", deposit_refund: "استرداد إيداع", credit_note: "إشعار دائن", write_off: "شطب" },
  ur: { invoice: "انوائس", payment: "ادائیگی", deposit: "ڈپازٹ", deposit_applied: "ڈپازٹ استعمال شدہ", deposit_refund: "ڈپازٹ ریفنڈ", credit_note: "کریڈٹ نوٹ", write_off: "رائٹ آف" },
};

export default function PatientStatementPage() {
  const { patientId: urlPatientId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState(urlPatientId || "");
  const [pdfLang, setPdfLang] = useState<StatementLanguage>((language as StatementLanguage) || "en");
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = usePatientStatement(selectedPatientId);
  const { data: organization } = useOrganization(profile?.organization_id);
  const entries = data?.entries || [];

  // Fetch selected patient's basic info for the PDF header
  const { data: patient } = useQuery({
    queryKey: ["patient-basic", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const { data } = await (supabase as any)
        .from("patients")
        .select("id, patient_number, first_name, last_name, phone, email, address")
        .eq("id", selectedPatientId)
        .maybeSingle();
      return data;
    },
    enabled: !!selectedPatientId,
  });

  const aging = data ? computeAgingFromEntries(entries) : undefined;

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setGenerating(true);
    try {
      const filename = `patient-statement-${patient?.patient_number || selectedPatientId}-${format(new Date(), "yyyyMMdd")}`;
      await generateStatementPDF(pdfRef.current, filename);
      toast.success(t("finance.pdf_generated" as any, "Statement PDF downloaded"));
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  const exportColumns = [
    { key: "date", header: t("common.date" as any, "Date"), format: (v: string) => v ? format(new Date(v), "dd MMM yyyy") : "-" },
    { key: "type", header: t("common.type" as any, "Type") },
    { key: "reference", header: t("finance.reference" as any, "Reference") },
    { key: "description", header: t("common.description" as any, "Description") },
    { key: "debit", header: t("finance.debit" as any, "Debit"), format: (v: number) => v > 0 ? String(v) : "", align: "right" as const },
    { key: "credit", header: t("finance.credit" as any, "Credit"), format: (v: number) => v > 0 ? String(v) : "", align: "right" as const },
    { key: "balance", header: t("finance.balance" as any, "Balance"), format: (v: number) => String(v), align: "right" as const },
  ];

  const partyName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() + (patient.patient_number ? ` (${patient.patient_number})` : "")
    : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("finance.patient_statement" as any, "Patient Statement")}
        description={t("finance.patient_statement_desc" as any, "Complete financial ledger per patient with running balance")}
        breadcrumbs={[
          { label: t("nav.billing" as any, "Billing"), href: "/app/billing" },
          { label: t("finance.patient_statement" as any, "Patient Statement") },
        ]}
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back" as any, "Back")}
            </Button>
            <Select value={pdfLang} onValueChange={(v) => setPdfLang(v as StatementLanguage)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English PDF</SelectItem>
                <SelectItem value="ar">عربي PDF</SelectItem>
                <SelectItem value="ur">اردو PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleDownloadPDF}
              disabled={!selectedPatientId || generating || entries.length === 0}
            >
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              {t("finance.download_pdf" as any, "Download PDF")}
            </Button>
            <ReportExportButton
              data={entries}
              filename="patient-statement"
              columns={exportColumns}
              title={t("finance.patient_statement" as any, "Patient Statement")}
              disabled={entries.length === 0}
            />
          </div>
        }
      />

      {/* Patient Search */}
      {!urlPatientId && (
        <Card>
          <CardContent className="pt-6">
            <Label>{t("finance.select_patient" as any, "Select Patient")}</Label>
            <PatientSearch onSelect={(p: any) => setSelectedPatientId(p.id)} />
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedPatientId && data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.total_charges" as any, "Total Charges")}</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalDebit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.total_payments" as any, "Total Payments")}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalCredit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.closing_balance" as any, "Closing Balance")}</p>
              <p className={`text-2xl font-bold ${data.closingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(data.closingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statement Table */}
      {selectedPatientId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("finance.transactions" as any, "Transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("finance.no_transactions" as any, "No transactions found for this patient")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date" as any, "Date")}</TableHead>
                    <TableHead>{t("common.type" as any, "Type")}</TableHead>
                    <TableHead>{t("finance.reference" as any, "Reference")}</TableHead>
                    <TableHead>{t("common.description" as any, "Description")}</TableHead>
                    <TableHead className="text-right">{t("finance.debit" as any, "Debit")}</TableHead>
                    <TableHead className="text-right">{t("finance.credit" as any, "Credit")}</TableHead>
                    <TableHead className="text-right">{t("finance.balance" as any, "Balance")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.invoice;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={cfg.color}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {entry.type === "invoice" ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => navigate(`/app/billing/invoices/${entry.id}`)}
                            >
                              {entry.reference}
                            </Button>
                          ) : (
                            entry.reference
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{entry.description}</TableCell>
                        <TableCell className="text-right">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${entry.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">{t("common.total" as any, "Total")}</TableCell>
                    <TableCell className="text-right">{formatCurrency(data?.totalDebit || 0)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(data?.totalCredit || 0)}</TableCell>
                    <TableCell className={`text-right ${(data?.closingBalance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(data?.closingBalance || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden offscreen template for PDF rendering */}
      {selectedPatientId && data && patient && organization && (
        <div style={{ position: "fixed", left: "-10000px", top: 0, pointerEvents: "none", opacity: 0 }} aria-hidden>
          <StatementPDFTemplate
            ref={pdfRef}
            language={pdfLang}
            organizationName={organization.name}
            organizationAddress={(organization as any).address}
            organizationPhone={(organization as any).phone}
            organizationEmail={(organization as any).email}
            organizationLogoUrl={(organization as any).logo_url}
            statementType="patient"
            partyName={partyName}
            partyContact={[patient.phone, patient.email].filter(Boolean).join(" · ")}
            partyAddress={patient.address}
            entries={entries.map((e) => ({
              date: e.date,
              type: TYPE_LABELS[pdfLang][e.type] || e.type,
              reference: e.reference,
              description: e.description,
              debit: e.debit,
              credit: e.credit,
              balance: e.balance,
            }))}
            totalDebit={data.totalDebit}
            totalCredit={data.totalCredit}
            closingBalance={data.closingBalance}
            aging={aging}
            formatCurrency={formatCurrency}
          />
        </div>
      )}
    </div>
  );
}
