import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePOSTransactions, POSTransaction } from "@/hooks/usePOS";
import { format } from "date-fns";
import { Eye, Search, Store } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export default function POSTransactionsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions = [], isLoading } = usePOSTransactions(undefined, {
    date: dateFilter,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const filteredTransactions = transactions.filter(tx =>
    tx.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.customer_phone?.includes(searchTerm)
  );

  const columns: ColumnDef<POSTransaction>[] = [
    {
      accessorKey: "transaction_number",
      header: "Transaction #",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.transaction_number}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }) => format(new Date(row.original.created_at), "h:mm a"),
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
        <span className="font-medium">
          Rs. {Number(row.original.total_amount).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          paid: "default",
          pending: "secondary",
          refunded: "outline",
          voided: "destructive",
        };
        return (
          <Badge variant={variants[status] || "secondary"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "creator",
      header: "Cashier",
      cell: ({ row }) => row.original.creator?.full_name || "Unknown",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/pharmacy/pos/transactions/${row.original.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Calculate summary
  const paidTx = filteredTransactions.filter(tx => tx.status === 'paid');
  const totalSales = paidTx.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Transactions"
        description="View and manage retail sales history"
        actions={
          <Button onClick={() => navigate("/app/pharmacy/pos")}>
            <Store className="mr-2 h-4 w-4" />
            Go to POS
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction #, customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Transactions</p>
          <p className="text-2xl font-bold">{filteredTransactions.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Paid Sales</p>
          <p className="text-2xl font-bold">{paidTx.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">Rs. {totalSales.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        isLoading={isLoading}
      />
    </div>
  );
}
