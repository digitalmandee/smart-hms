import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { usePOSSessionDetail } from "@/hooks/usePOSSessions";
import { POSTransaction } from "@/hooks/usePOS";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Download, Wallet, CreditCard, Smartphone, DollarSign, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Loader2 } from "lucide-react";

export default function POSSessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = usePOSSessionDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">Session not found.</div>
    );
  }

  const { session, transactions } = data;
  const completedTxns = transactions.filter(t => t.status === "completed");
  const totalSales = completedTxns.reduce((s, t) => s + Number(t.total_amount), 0);

  const cashSales = completedTxns.reduce((sum, t) => {
    const cashPayments = (t.payments || []).filter(p => p.payment_method === "cash");
    return sum + cashPayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const cardSales = completedTxns.reduce((sum, t) => {
    const cardPayments = (t.payments || []).filter(p => p.payment_method === "card");
    return sum + cardPayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const mobileSales = completedTxns.reduce((sum, t) => {
    const mobilePayments = (t.payments || []).filter(p =>
      ["jazzcash", "easypaisa"].includes(p.payment_method)
    );
    return sum + mobilePayments.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);

  const openingBalance = Number(session.opening_balance) || 0;
  const closingBalance = Number(session.closing_balance) || 0;
  const expectedCash = Number(session.expected_cash) || (openingBalance + cashSales);
  const cashDifference = Number(session.cash_difference) || (closingBalance - expectedCash);

  const columns: ColumnDef<POSTransaction>[] = [
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }) => format(new Date(row.original.created_at), "h:mm a"),
    },
    {
      accessorKey: "transaction_number",
      header: "Transaction #",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.transaction_number}</span>,
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => row.original.customer_name || "Walk-in",
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => <span className="font-mono">{formatCurrency(Number(row.original.total_amount))}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "completed" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  // Export config
  const exportColumns = [
    { key: "transaction_number", header: "Transaction #" },
    { key: "created_at", header: "Time", format: (v: string) => format(new Date(v), "h:mm a") },
    { key: "customer_name", header: "Customer", format: (v: string) => v || "Walk-in" },
    { key: "total_amount", header: "Amount", format: (v: number) => formatCurrency(Number(v)), align: "right" as const },
    { key: "status", header: "Status" },
  ];

  const summaryRow = {
    transaction_number: `Total: ${completedTxns.length} transactions`,
    total_amount: formatCurrency(totalSales),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Session ${session.session_number}`}
        description={`${session.opener?.full_name || "Unknown"} • ${format(new Date(session.opened_at), "PPP")}`}
        actions={
          <div className="flex gap-2">
            <ReportExportButton
              data={transactions}
              filename={`session-${session.session_number}`}
              columns={exportColumns}
              summaryRow={summaryRow}
              pdfOptions={{
                title: "POS Session Report",
                subtitle: `Session: ${session.session_number} | Cashier: ${session.opener?.full_name || "Unknown"}`,
              }}
            />
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Opening Balance</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(openingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-xl font-bold font-mono text-green-600">{formatCurrency(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Expected Cash</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(expectedCash)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Cash Difference</p>
            <div className="flex items-center gap-1">
              {session.status === "closed" ? (
                <Badge variant={cashDifference === 0 ? "default" : "destructive"} className="text-base font-mono">
                  {cashDifference > 0 && <ArrowUp className="h-3 w-3 mr-1" />}
                  {cashDifference < 0 && <ArrowDown className="h-3 w-3 mr-1" />}
                  {cashDifference === 0 && <Minus className="h-3 w-3 mr-1" />}
                  {formatCurrency(Math.abs(cashDifference))}
                </Badge>
              ) : (
                <Badge variant="secondary">Open</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">{formatCurrency(cashSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Card Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">{formatCurrency(cardSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mobile Payments</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold font-mono">{formatCurrency(mobileSales)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <DataTable columns={columns} data={transactions} isLoading={isLoading} />
    </div>
  );
}
