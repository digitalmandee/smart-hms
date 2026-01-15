import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePOSSessions, POSSession } from "@/hooks/usePOS";
import { format } from "date-fns";
import { Store, Clock, Wallet, TrendingUp } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

export default function POSSessionsPage() {
  const navigate = useNavigate();
  const { data: sessions = [], isLoading } = usePOSSessions();

  const columns: ColumnDef<POSSession>[] = [
    {
      accessorKey: "opened_at",
      header: "Opened",
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
      accessorKey: "opener",
      header: "Opened By",
      cell: ({ row }) => row.original.opener?.full_name || "Unknown",
    },
    {
      accessorKey: "opening_balance",
      header: "Opening",
      cell: ({ row }) => (
        <span className="font-mono">Rs. {Number(row.original.opening_balance).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "cash_sales",
      header: "Cash Sales",
      cell: ({ row }) => (
        <span className="font-mono text-green-600">
          Rs. {Number(row.original.cash_sales || 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "expected_balance",
      header: "Expected",
      cell: ({ row }) => (
        <span className="font-mono">
          Rs. {Number(row.original.expected_balance || 0).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "closing_balance",
      header: "Closing",
      cell: ({ row }) => (
        row.original.closing_balance !== null ? (
          <span className="font-mono">
            Rs. {Number(row.original.closing_balance).toFixed(2)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'open' ? 'default' : 'secondary'}>
          {row.original.status === 'open' ? 'Active' : 'Closed'}
        </Badge>
      ),
    },
    {
      accessorKey: "closed_at",
      header: "Closed",
      cell: ({ row }) => (
        row.original.closed_at ? (
          <div>
            <p className="text-sm">{format(new Date(row.original.closed_at), "h:mm a")}</p>
            <p className="text-xs text-muted-foreground">
              by {row.original.closer?.full_name || "Unknown"}
            </p>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      ),
    },
  ];

  // Calculate summary stats
  const closedSessions = sessions.filter(s => s.status === 'closed');
  const totalCashSales = closedSessions.reduce((sum, s) => sum + (s.cash_sales || 0), 0);
  const totalDiscrepancy = closedSessions.reduce((sum, s) => {
    if (s.closing_balance !== null && s.expected_balance !== null) {
      return sum + (s.closing_balance - s.expected_balance);
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cash Sessions"
        subtitle="View POS session history and cash reconciliation"
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
              {sessions.filter(s => s.status === 'open').length} currently open
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed Sessions</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedSessions.length}</div>
            <p className="text-xs text-muted-foreground">Successfully reconciled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs. {totalCashSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From closed sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Discrepancy</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalDiscrepancy >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {totalDiscrepancy >= 0 ? '+' : ''}Rs. {totalDiscrepancy.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Actual vs expected</p>
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
