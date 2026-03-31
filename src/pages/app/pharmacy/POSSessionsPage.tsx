import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOSSessionHistory } from "@/hooks/usePOSSessions";
import { POSSession } from "@/hooks/usePOS";
import { format } from "date-fns";
import { Store, Clock, Wallet, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";

export default function POSSessionsPage() {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = usePOSSessionHistory();

  const columns: ColumnDef<POSSession>[] = [
    {
      accessorKey: "opened_at",
      header: "Date",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{format(new Date(row.original.opened_at), "PPP")}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.original.opened_at), "h:mm a")}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "session_number",
      header: "Session #",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.session_number}</span>
      ),
    },
    {
      accessorKey: "opener",
      header: "Cashier",
      cell: ({ row }) => row.original.opener?.full_name || "Unknown",
    },
    {
      accessorKey: "opening_balance",
      header: "Opening",
      cell: ({ row }) => (
        <span className="font-mono">{formatCurrency(Number(row.original.opening_balance))}</span>
      ),
    },
    {
      accessorKey: "total_sales",
      header: "Total Sales",
      cell: ({ row }) => (
        <span className="font-mono font-medium text-green-600">
          {formatCurrency(Number(row.original.total_sales || 0))}
        </span>
      ),
    },
    {
      accessorKey: "closing_balance",
      header: "Closing",
      cell: ({ row }) => (
        <span className="font-mono">
          {row.original.closing_balance != null
            ? formatCurrency(Number(row.original.closing_balance))
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "cash_difference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = Number(row.original.cash_difference || 0);
        if (row.original.status !== "closed") return <span className="text-muted-foreground">—</span>;
        return (
          <Badge variant={diff === 0 ? "default" : "destructive"} className="font-mono text-xs">
            {diff > 0 && <ArrowUp className="h-3 w-3 mr-1" />}
            {diff < 0 && <ArrowDown className="h-3 w-3 mr-1" />}
            {diff === 0 && <Minus className="h-3 w-3 mr-1" />}
            {formatCurrency(Math.abs(diff))}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "open" ? "secondary" : "default"}>
          {row.original.status === "open" ? "Open" : "Closed"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/pharmacy/pos/sessions/${row.original.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  // Summary stats
  const closedSessions = sessions.filter(s => s.status === "closed");
  const totalSalesAll = closedSessions.reduce((s, ses) => s + Number(ses.total_sales || 0), 0);
  const totalTransactionsAll = closedSessions.reduce((s, ses) => s + Number(ses.total_transactions || 0), 0);
  const openSessions = sessions.filter(s => s.status === "open");

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Sessions"
        description="Daily opening/closing register history"
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
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {openSessions.length} currently open
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSalesAll)}</div>
            <p className="text-xs text-muted-foreground">From closed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactionsAll}</div>
            <p className="text-xs text-muted-foreground">Across all sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Sessions</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openSessions.length}</div>
            <p className="text-xs text-muted-foreground">Active registers</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <DataTable
        columns={columns}
        data={sessions}
        isLoading={isLoading}
      />
    </div>
  );
}
