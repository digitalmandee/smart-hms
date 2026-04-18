import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ArrowDownCircle, ArrowUpCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format, startOfQuarter, endOfQuarter } from "date-fns";

/**
 * VAT Return — sourced from the Tax Payable GL account (TAX-VAT-001 / 2200).
 * - Output VAT  = CREDIT movements on the Tax Payable account (sales / output tax)
 * - Input VAT   = DEBIT  movements on the Tax Payable account (purchase / input tax claim)
 * - Reconciliation tab cross-references GL Output VAT to invoice tax_amount and GL Input VAT
 *   to GRN tax_amount for the same period.
 */
export default function VatReturnPage() {
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [period, setPeriod] = useState("current_month");

  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === "current_month") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === "last_month") return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    if (period === "current_quarter") return { start: startOfQuarter(now), end: endOfQuarter(now) };
    return { start: startOfQuarter(subMonths(now, 3)), end: endOfQuarter(subMonths(now, 3)) };
  }, [period]);

  const startStr = format(dateRange.start, "yyyy-MM-dd");
  const endStr = format(dateRange.end, "yyyy-MM-dd");

  // Resolve Tax Payable account
  const { data: taxAccount } = useQuery({
    queryKey: ["tax-payable-account", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, account_number, name, current_balance")
        .eq("organization_id", profile!.organization_id!)
        .eq("is_active", true)
        .or("account_number.eq.TAX-VAT-001,account_number.eq.2200")
        .order("account_number")
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!profile?.organization_id,
  });

  // GL movements on the Tax Payable account for the period
  const { data: glLines, isLoading: loadingGL } = useQuery({
    queryKey: ["vat-gl-lines", profile?.organization_id, taxAccount?.id, startStr, endStr],
    queryFn: async () => {
      if (!taxAccount?.id) return [];
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          id, debit_amount, credit_amount, description,
          journal_entry:journal_entries!inner(id, entry_number, entry_date, reference_type, reference_id, description, is_posted)
        `)
        .eq("account_id", taxAccount.id)
        .eq("journal_entry.is_posted", true)
        .gte("journal_entry.entry_date", startStr)
        .lte("journal_entry.entry_date", endStr)
        .order("journal_entry(entry_date)", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!taxAccount?.id,
  });

  // Source-doc cross-reference: invoices and GRNs in the period (for reconciliation tab)
  const { data: invoiceTax } = useQuery({
    queryKey: ["invoice-tax-cross-ref", profile?.organization_id, startStr, endStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, tax_amount, status")
        .eq("organization_id", profile!.organization_id!)
        .gte("invoice_date", startStr)
        .lte("invoice_date", endStr)
        .neq("status", "cancelled");
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const { data: grnTax } = useQuery({
    queryKey: ["grn-tax-cross-ref", profile?.organization_id, startStr, endStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goods_received_notes")
        .select("id, grn_number, received_date, total_amount, tax_amount")
        .eq("organization_id", profile!.organization_id!)
        .gte("received_date", startStr)
        .lte("received_date", endStr);
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Split GL lines: credits = output VAT, debits = input VAT
  const outputLines = (glLines || []).filter((l: any) => Number(l.credit_amount) > 0);
  const inputLines = (glLines || []).filter((l: any) => Number(l.debit_amount) > 0);

  const totalOutputVat = outputLines.reduce((s: number, l: any) => s + Number(l.credit_amount || 0), 0);
  const totalInputVat = inputLines.reduce((s: number, l: any) => s + Number(l.debit_amount || 0), 0);
  const netVat = totalOutputVat - totalInputVat;

  // Source-doc totals for reconciliation
  const sourceOutputVat = (invoiceTax || []).reduce((s, i: any) => s + Number(i.tax_amount || 0), 0);
  const sourceInputVat = (grnTax || []).reduce((s, g: any) => s + Number(g.tax_amount || 0), 0);

  const outputDelta = totalOutputVat - sourceOutputVat;
  const inputDelta = totalInputVat - sourceInputVat;
  const outputReconciled = Math.abs(outputDelta) < 0.01;
  const inputReconciled = Math.abs(inputDelta) < 0.01;

  return (
    <div>
      <PageHeader
        title="VAT Return Report"
        description="Output and Input VAT — sourced from the Tax Payable General Ledger account"
        breadcrumbs={[
          { label: "Accounts", href: "/app/accounts" },
          { label: "Reports", href: "/app/accounts/reports" },
          { label: "VAT Return" },
        ]}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium">Period:</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[200px] ml-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Current Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="current_quarter">Current Quarter</SelectItem>
                  <SelectItem value="last_quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-sm text-muted-foreground">
              {format(dateRange.start, "dd MMM yyyy")} — {format(dateRange.end, "dd MMM yyyy")}
            </span>
            {taxAccount ? (
              <Badge variant="outline" className="ml-auto">
                GL Account: <span className="font-mono ml-1">{taxAccount.account_number}</span> · {taxAccount.name}
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-auto">No Tax Payable account configured</Badge>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4" />Output VAT (GL Credits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOutputVat)}</div>
              <p className="text-xs text-muted-foreground">{outputLines.length} GL postings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4" />Input VAT (GL Debits)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInputVat)}</div>
              <p className="text-xs text-muted-foreground">{inputLines.length} GL postings</p>
            </CardContent>
          </Card>
          <Card className={netVat >= 0 ? "border-destructive/30" : "border-green-500/30"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Receipt className="h-4 w-4" />{netVat >= 0 ? "VAT Payable" : "VAT Refundable"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netVat >= 0 ? "text-destructive" : ""}`}>
                {formatCurrency(Math.abs(netVat))}
              </div>
              <Badge variant={netVat >= 0 ? "destructive" : "default"} className="mt-1">
                {netVat >= 0 ? "Payable to Authority" : "Refundable from Authority"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="output" className="w-full">
          <TabsList>
            <TabsTrigger value="output">Output VAT (GL)</TabsTrigger>
            <TabsTrigger value="input">Input VAT (GL)</TabsTrigger>
            <TabsTrigger value="recon">Reconciliation</TabsTrigger>
          </TabsList>

          {/* Output VAT — GL */}
          <TabsContent value="output">
            <Card>
              <CardHeader><CardTitle>Output VAT — Postings to Tax Payable (Credits)</CardTitle></CardHeader>
              <CardContent>
                {loadingGL ? <Skeleton className="h-40 w-full" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>JE #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">VAT (Credit)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outputLines.slice(0, 100).map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-mono text-sm">{l.journal_entry?.entry_number}</TableCell>
                          <TableCell>{format(new Date(l.journal_entry?.entry_date), "dd MMM yyyy")}</TableCell>
                          <TableCell><Badge variant="outline">{l.journal_entry?.reference_type || "manual"}</Badge></TableCell>
                          <TableCell className="text-sm">{l.description || l.journal_entry?.description}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(Number(l.credit_amount))}</TableCell>
                        </TableRow>
                      ))}
                      {outputLines.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No Output VAT postings in period</TableCell></TableRow>
                      )}
                      {outputLines.length > 0 && (
                        <TableRow className="font-bold border-t-2">
                          <TableCell colSpan={4} className="text-right">Total Output VAT (GL)</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalOutputVat)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Input VAT — GL */}
          <TabsContent value="input">
            <Card>
              <CardHeader><CardTitle>Input VAT — Postings to Tax Payable (Debits)</CardTitle></CardHeader>
              <CardContent>
                {loadingGL ? <Skeleton className="h-40 w-full" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>JE #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">VAT (Debit)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inputLines.slice(0, 100).map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-mono text-sm">{l.journal_entry?.entry_number}</TableCell>
                          <TableCell>{format(new Date(l.journal_entry?.entry_date), "dd MMM yyyy")}</TableCell>
                          <TableCell><Badge variant="outline">{l.journal_entry?.reference_type || "manual"}</Badge></TableCell>
                          <TableCell className="text-sm">{l.description || l.journal_entry?.description}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(Number(l.debit_amount))}</TableCell>
                        </TableRow>
                      ))}
                      {inputLines.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No Input VAT postings in period</TableCell></TableRow>
                      )}
                      {inputLines.length > 0 && (
                        <TableRow className="font-bold border-t-2">
                          <TableCell colSpan={4} className="text-right">Total Input VAT (GL)</TableCell>
                          <TableCell className="text-right">{formatCurrency(totalInputVat)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconciliation */}
          <TabsContent value="recon">
            <Card>
              <CardHeader><CardTitle>GL vs Source Document Reconciliation</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">GL (Tax Payable)</TableHead>
                      <TableHead className="text-right">Source Documents</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Output VAT</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(totalOutputVat)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sourceOutputVat)}
                        <p className="text-xs text-muted-foreground">{(invoiceTax || []).length} invoices</p>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${outputReconciled ? "" : "text-destructive"}`}>
                        {formatCurrency(outputDelta)}
                      </TableCell>
                      <TableCell>
                        {outputReconciled ? (
                          <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Reconciled</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Variance</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Input VAT</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(totalInputVat)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(sourceInputVat)}
                        <p className="text-xs text-muted-foreground">{(grnTax || []).length} GRNs</p>
                      </TableCell>
                      <TableCell className={`text-right font-mono ${inputReconciled ? "" : "text-destructive"}`}>
                        {formatCurrency(inputDelta)}
                      </TableCell>
                      <TableCell>
                        {inputReconciled ? (
                          <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Reconciled</Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Variance</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground italic mt-4">
                  A variance indicates that some invoices or GRNs in the period did not post to the Tax Payable GL account
                  (e.g., zero-tax items, draft invoices, or trigger failures). Investigate variances before filing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
