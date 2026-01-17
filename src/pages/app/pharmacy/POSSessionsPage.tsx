import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOSTransactions, POSTransaction } from "@/hooks/usePOS";
import { format } from "date-fns";
import { Store, Clock, Wallet, TrendingUp } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

export default function POSSessionsPage() {
  const navigate = useNavigate();
  const { data: transactions = [], isLoading } = usePOSTransactions();

  const columns: ColumnDef<POSTransaction>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{format(new Date(row.original.created_at), "PPP")}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.original.created_at), "h:mm a")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "transaction_number",
      header: "Transaction #",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.transaction_number}</span>
      ),
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => row.original.customer_name || "Walk-in",
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-mono font-medium">Rs. {Number(row.original.total_amount).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.payment_status === 'paid' ? 'default' : 'secondary'}>
          {row.original.payment_status}
        </Badge>
      ),
    },
    {
      accessorKey: "creator",
      header: "Cashier",
      cell: ({ row }) => row.original.creator?.full_name || "Unknown",
    },
  ];

  // Calculate summary stats
  const paidTransactions = transactions.filter(t => t.payment_status === 'paid');
  const totalSales = paidTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0);
  const avgSale = paidTransactions.length > 0 ? totalSales / paidTransactions.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales History"
        description="View POS transaction history"
        actions={
          <Button onClick={() => navigate("/app/pharmacy/pos")}>
            <Store className="mr-2 h-4 w-4" />
            Go to POS Terminal
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {paidTransactions.length} paid
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From paid transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs. {avgSale.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voided</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {transactions.filter(t => t.payment_status === 'voided').length}
            </div>
            <p className="text-xs text-muted-foreground">Cancelled sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
      />
    </div>
  );
}
