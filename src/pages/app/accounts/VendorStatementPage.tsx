import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, CreditCard, Building2 } from "lucide-react";
import { format, subMonths } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useVendorStatement } from "@/hooks/useVendorStatement";
import { useTranslation } from "@/lib/i18n";
import { ReportExportButton } from "@/components/reports/ReportExportButton";

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  grn: { label: "Goods Received", color: "bg-blue-100 text-blue-800", icon: FileText },
  payment: { label: "Payment Made", color: "bg-green-100 text-green-800", icon: CreditCard },
  po: { label: "Purchase Order", color: "bg-purple-100 text-purple-800", icon: FileText },
  credit_note: { label: "Credit Note", color: "bg-amber-100 text-amber-800", icon: FileText },
  opening: { label: "Opening Balance", color: "bg-gray-100 text-gray-800", icon: FileText },
};

export default function VendorStatementPage() {
  const { vendorId: urlVendorId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedVendorId, setSelectedVendorId] = useState(urlVendorId || "");
  const [fromDate, setFromDate] = useState(subMonths(new Date(), 3).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch vendor list for selector (when no urlVendorId)
  const { data: vendors } = useQuery({
    queryKey: ["vendors-list", profile?.organization_id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("vendors")
        .select("id, name")
        .eq("organization_id", profile!.organization_id)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!profile?.organization_id && !urlVendorId,
  });

  const { data, isLoading } = useVendorStatement(selectedVendorId, fromDate, toDate);
  const entries = data?.entries || [];

  const exportColumns = [
    { key: "date", header: t("common.date" as any, "Date"), format: (v: string) => v ? format(new Date(v), "dd MMM yyyy") : "-" },
    { key: "type", header: t("common.type" as any, "Type") },
    { key: "reference", header: t("finance.reference" as any, "Reference") },
    { key: "description", header: t("common.description" as any, "Description") },
    { key: "debit", header: t("finance.debit" as any, "Paid"), format: (v: number) => v > 0 ? String(v) : "" },
    { key: "credit", header: t("finance.credit" as any, "Received"), format: (v: number) => v > 0 ? String(v) : "" },
    { key: "balance", header: t("finance.balance" as any, "Balance"), format: (v: number) => String(v) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("finance.vendor_statement" as any, "Vendor Statement")}
        description={t("finance.vendor_statement_desc" as any, "Complete payable ledger per vendor — GRNs, payments, and running balance")}
        breadcrumbs={[
          { label: t("nav.accounts" as any, "Accounts"), href: "/app/accounts" },
          { label: t("finance.vendor_statement" as any, "Vendor Statement") },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back" as any, "Back")}
            </Button>
            <ReportExportButton
              data={entries}
              filename={`vendor-statement-${selectedVendorId}`}
              columns={exportColumns}
              title={t("finance.vendor_statement" as any, "Vendor Statement")}
              disabled={entries.length === 0}
            />
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {!urlVendorId && (
              <div className="space-y-1.5">
                <Label>{t("finance.select_vendor" as any, "Select Vendor")}</Label>
                <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                  <SelectTrigger><SelectValue placeholder={t("finance.select_vendor" as any, "Select vendor")} /></SelectTrigger>
                  <SelectContent>
                    {(vendors || []).map((v: any) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>{t("common.from" as any, "From")}</Label>
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("common.to" as any, "To")}</Label>
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Info */}
      {selectedVendorId && data?.vendor && (
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{data.vendor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {[data.vendor.contact_person, data.vendor.phone, data.vendor.email].filter(Boolean).join(" • ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {selectedVendorId && data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.total_received" as any, "Total Received (GRN)")}</p>
              <p className="text-2xl font-bold">{formatCurrency(data.totalCredit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.total_paid" as any, "Total Paid")}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.totalDebit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t("finance.outstanding_payable" as any, "Outstanding Payable")}</p>
              <p className={`text-2xl font-bold ${data.closingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(Math.abs(data.closingBalance))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statement Table */}
      {selectedVendorId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("finance.transactions" as any, "Transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("finance.no_transactions" as any, "No transactions in selected period")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.date" as any, "Date")}</TableHead>
                    <TableHead>{t("common.type" as any, "Type")}</TableHead>
                    <TableHead>{t("finance.reference" as any, "Reference")}</TableHead>
                    <TableHead>{t("common.description" as any, "Description")}</TableHead>
                    <TableHead className="text-right">{t("finance.paid" as any, "Paid")}</TableHead>
                    <TableHead className="text-right">{t("finance.received" as any, "Received")}</TableHead>
                    <TableHead className="text-right">{t("finance.balance" as any, "Balance")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map(entry => {
                    const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.grn;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date ? format(new Date(entry.date), "dd MMM yyyy") : "-"}</TableCell>
                        <TableCell><Badge className={cfg.color}>{cfg.label}</Badge></TableCell>
                        <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                        <TableCell className="text-sm">{entry.description}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${entry.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4} className="text-right">{t("common.total" as any, "Total")}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(data?.totalDebit || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(data?.totalCredit || 0)}</TableCell>
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
    </div>
  );
}
