/**
 * Day-End Summary Report
 * Comprehensive financial summary with collections, payouts, and net cash calculation
 */

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Users,
  Building,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useDayEndSummary } from "@/hooks/useDayEndSummary";
import { generateDayEndSummaryPDF } from "@/lib/pdfExport";
import { useOrganizationBranding } from "@/hooks/useOrganizationBranding";

export default function DayEndSummaryReport() {
  const { data: branding } = useOrganizationBranding();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    doctorSettlements: true,
    vendorPayments: true,
    expenses: true,
  });

  const { data: summary, isLoading, error } = useDayEndSummary(selectedDate);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportPDF = () => {
    if (!summary) return;
    generateDayEndSummaryPDF({
      summary,
      organization: {
        name: branding?.name || "SmartHMS",
        address: branding?.address || undefined,
        phone: branding?.phone || undefined,
        email: branding?.email || undefined,
        logo_url: branding?.logo_url || undefined,
      },
    });
  };

  const handlePrint = () => {
    handleExportPDF();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load day-end summary. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const netCashStatus =
    summary?.reconciliation.netCashToSubmit && summary.reconciliation.netCashToSubmit >= 0
      ? "positive"
      : "negative";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Day-End Summary</h1>
          <p className="text-muted-foreground">
            Complete financial overview for {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" onClick={handlePrint} disabled={!summary}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          <Button onClick={handleExportPDF} disabled={!summary}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(summary?.collections.grandTotal || 0)}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>Cash: {formatCurrency(summary?.collections.totalCash || 0)}</span>
              <span>Other: {formatCurrency(summary?.collections.totalNonCash || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Payouts */}
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Payouts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(summary?.payouts.totalPayouts || 0)}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>Doctors: {formatCurrency(summary?.payouts.doctorSettlements.total || 0)}</span>
              <span>Vendors: {formatCurrency(summary?.payouts.vendorPayments.total || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Cash to Submit */}
        <Card
          className={cn(
            "bg-gradient-to-br border",
            netCashStatus === "positive"
              ? "from-blue-500/10 to-blue-500/5 border-blue-500/20"
              : "from-amber-500/10 to-amber-500/5 border-amber-500/20"
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Net Cash to Submit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                netCashStatus === "positive" ? "text-blue-700" : "text-amber-700"
              )}
            >
              {formatCurrency(summary?.reconciliation.netCashToSubmit || 0)}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {netCashStatus === "positive" ? (
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-600" />
              )}
              <span className="text-muted-foreground">
                {netCashStatus === "positive" ? "Ready to submit" : "Payouts exceed collections"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-purple-600" />
              Outstanding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">
              {formatCurrency(summary?.outstanding.pendingAmount || 0)}
            </p>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{summary?.outstanding.pendingInvoices || 0} invoices</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="collections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* By Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">By Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.collections.byMethod.map((item) => (
                      <TableRow key={item.method}>
                        <TableCell className="font-medium">{item.method}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!summary?.collections.byMethod || summary.collections.byMethod.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No collections for this date
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By Department */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">By Department</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.collections.byDepartment.map((item) => (
                      <TableRow key={item.department}>
                        <TableCell className="font-medium">{item.department}</TableCell>
                        <TableCell className="text-right">{item.count}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!summary?.collections.byDepartment ||
                      summary.collections.byDepartment.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No collections for this date
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          {/* Doctor Settlements */}
          <Card>
            <Collapsible
              open={expandedSections.doctorSettlements}
              onOpenChange={() => toggleSection("doctorSettlements")}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Doctor Settlements</CardTitle>
                      <Badge variant="secondary">
                        {summary?.payouts.doctorSettlements.items.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(summary?.payouts.doctorSettlements.total || 0)}
                      </span>
                      {expandedSections.doctorSettlements ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Settlement #</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary?.payouts.doctorSettlements.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">
                            {item.settlementNumber}
                          </TableCell>
                          <TableCell className="font-medium">{item.doctorName}</TableCell>
                          <TableCell>{item.paymentMethod || "-"}</TableCell>
                          <TableCell>{item.referenceNumber || "-"}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!summary?.payouts.doctorSettlements.items ||
                        summary.payouts.doctorSettlements.items.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No doctor settlements for this date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Vendor Payments */}
          <Card>
            <Collapsible
              open={expandedSections.vendorPayments}
              onOpenChange={() => toggleSection("vendorPayments")}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-lg">Vendor Payments</CardTitle>
                      <Badge variant="secondary">
                        {summary?.payouts.vendorPayments.items.length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-red-600">
                        {formatCurrency(summary?.payouts.vendorPayments.total || 0)}
                      </span>
                      {expandedSections.vendorPayments ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary?.payouts.vendorPayments.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.paymentNumber}</TableCell>
                          <TableCell className="font-medium">{item.vendorName}</TableCell>
                          <TableCell>{item.paymentMethod || "-"}</TableCell>
                          <TableCell>{item.referenceNumber || "-"}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!summary?.payouts.vendorPayments.items ||
                        summary.payouts.vendorPayments.items.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No vendor payments for this date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation">
          <Card>
            <CardHeader>
              <CardTitle>Cash Reconciliation Summary</CardTitle>
              <CardDescription>
                Net cash calculation after all payouts and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cash Flow Table */}
                <Table>
                  <TableBody>
                    <TableRow className="bg-green-50 dark:bg-green-950/20">
                      <TableCell className="font-medium">Total Cash Collected</TableCell>
                      <TableCell className="text-right font-mono text-lg text-green-700">
                        + {formatCurrency(summary?.reconciliation.totalCashCollected || 0)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium pl-8">Doctor Settlements (Cash)</TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        - {formatCurrency(summary?.payouts.doctorSettlements.cashTotal || 0)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium pl-8">Vendor Payments (Cash)</TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        - {formatCurrency(summary?.payouts.vendorPayments.cashTotal || 0)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium pl-8">Expenses/Petty Cash</TableCell>
                      <TableCell className="text-right font-mono text-red-600">
                        - {formatCurrency(summary?.payouts.expenses.total || 0)}
                      </TableCell>
                    </TableRow>

                    <TableRow className="border-t-2 bg-blue-50 dark:bg-blue-950/20">
                      <TableCell className="font-bold text-lg">Net Cash to Submit</TableCell>
                      <TableCell className="text-right font-mono text-xl font-bold text-blue-700">
                        = {formatCurrency(summary?.reconciliation.netCashToSubmit || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {/* Outstanding Summary */}
                <div className="mt-6 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-3">Outstanding Receivables</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Pending Invoices</p>
                      <p className="font-bold">{summary?.outstanding.pendingInvoices || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending Amount</p>
                      <p className="font-bold">
                        {formatCurrency(summary?.outstanding.pendingAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Given Today</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(summary?.outstanding.creditGivenToday || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Credit Recovered</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(summary?.outstanding.creditRecoveredToday || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature Lines for Print */}
                <div className="mt-8 pt-8 border-t grid grid-cols-3 gap-8 print:block hidden">
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 h-12"></div>
                    <p className="text-sm text-muted-foreground">Prepared By (Cashier)</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 h-12"></div>
                    <p className="text-sm text-muted-foreground">Verified By (Manager)</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 mb-2 h-12"></div>
                    <p className="text-sm text-muted-foreground">Received By (Accountant)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
