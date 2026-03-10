import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format, startOfQuarter, endOfQuarter } from "date-fns";

export default function VatReturnPage() {
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const [period, setPeriod] = useState("current_month");

  const dateRange = (() => {
    const now = new Date();
    if (period === "current_month") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === "last_month") return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    if (period === "current_quarter") return { start: startOfQuarter(now), end: endOfQuarter(now) };
    return { start: startOfQuarter(subMonths(now, 3)), end: endOfQuarter(subMonths(now, 3)) };
  })();

  // Output VAT (from sales invoices)
  const { data: outputVat, isLoading: loadingOutput } = useQuery({
    queryKey: ["output-vat", profile?.organization_id, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, total_amount, tax_amount, status, patients(first_name, last_name)")
        .eq("organization_id", profile!.organization_id!)
        .gte("invoice_date", format(dateRange.start, "yyyy-MM-dd"))
        .lte("invoice_date", format(dateRange.end, "yyyy-MM-dd"))
        .in("status", ["paid", "partially_paid", "pending"])
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Input VAT (from GRNs / purchase orders with VAT)
  const { data: inputVat, isLoading: loadingInput } = useQuery({
    queryKey: ["input-vat", profile?.organization_id, period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("goods_received_notes")
        .select("id, grn_number, received_date, total_amount, tax_amount, vendors(name)")
        .eq("organization_id", profile!.organization_id!)
        .gte("received_date", format(dateRange.start, "yyyy-MM-dd"))
        .lte("received_date", format(dateRange.end, "yyyy-MM-dd"))
        .order("received_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  const totalOutputVat = (outputVat || []).reduce((s: number, i: any) => s + (Number(i.tax_amount) || 0), 0);
  const totalInputVat = (inputVat || []).reduce((s: number, i: any) => s + (Number(i.tax_amount) || 0), 0);
  const netVat = totalOutputVat - totalInputVat;
  const isLoading = loadingOutput || loadingInput;

  return (
    <div>
      <PageHeader
        title="VAT Return Report"
        description="Input vs Output VAT summary for ZATCA filing"
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
          </CardContent>
        </Card>

        {/* VAT Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><ArrowUpCircle className="h-4 w-4" />Output VAT (Sales)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalOutputVat)}</div><p className="text-xs text-muted-foreground">{(outputVat || []).length} invoices</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><ArrowDownCircle className="h-4 w-4" />Input VAT (Purchases)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(totalInputVat)}</div><p className="text-xs text-muted-foreground">{(inputVat || []).length} GRNs</p></CardContent>
          </Card>
          <Card className={netVat >= 0 ? "border-destructive/30" : "border-green-500/30"}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Receipt className="h-4 w-4" />{netVat >= 0 ? "VAT Payable" : "VAT Refundable"}</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netVat >= 0 ? "text-destructive" : ""}`}>
                {formatCurrency(Math.abs(netVat))}
              </div>
              <Badge variant={netVat >= 0 ? "destructive" : "default"} className="mt-1">
                {netVat >= 0 ? "Payable to ZATCA" : "Refundable from ZATCA"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Output VAT Detail */}
        <Card>
          <CardHeader><CardTitle>Output VAT — Sales Invoices</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">VAT Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(outputVat || []).slice(0, 50).map((inv: any) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                      <TableCell>{format(new Date(inv.invoice_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>{inv.patients ? `${inv.patients.first_name} ${inv.patients.last_name}` : "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total_amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(inv.tax_amount || 0)}</TableCell>
                      <TableCell><Badge variant="outline">{inv.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {(!outputVat || outputVat.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No invoices in period</TableCell></TableRow>
                  )}
                  {(outputVat || []).length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={4} className="text-right">Total Output VAT</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalOutputVat)}</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Input VAT Detail */}
        <Card>
          <CardHeader><CardTitle>Input VAT — Purchase GRNs</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-40 w-full" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">VAT Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inputVat || []).slice(0, 50).map((grn: any) => (
                    <TableRow key={grn.id}>
                      <TableCell className="font-mono text-sm">{grn.grn_number}</TableCell>
                      <TableCell>{format(new Date(grn.received_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>{(grn.vendors as any)?.name || "—"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(grn.total_amount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(grn.tax_amount || 0)}</TableCell>
                    </TableRow>
                  ))}
                  {(!inputVat || inputVat.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No GRNs in period</TableCell></TableRow>
                  )}
                  {(inputVat || []).length > 0 && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell colSpan={4} className="text-right">Total Input VAT</TableCell>
                      <TableCell className="text-right">{formatCurrency(totalInputVat)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
