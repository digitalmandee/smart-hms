import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/integrations/supabase/types";

type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string | null;
  status: InvoiceStatus | null;
  total_amount: number | null;
  paid_amount: number | null;
  patient: {
    first_name: string;
    last_name: string | null;
    patient_number: string;
  };
}

const columns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.invoice_number}</span>
    ),
  },
  {
    accessorKey: "invoice_date",
    header: "Date",
    cell: ({ row }) =>
      row.original.invoice_date
        ? format(new Date(row.original.invoice_date), "MMM dd, yyyy")
        : "-",
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.patient?.first_name} {row.original.patient?.last_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.original.patient?.patient_number}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">
        Rs. {Number(row.original.total_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "paid_amount",
    header: "Paid",
    cell: ({ row }) => (
      <span className="text-success">
        Rs. {Number(row.original.paid_amount || 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance =
        Number(row.original.total_amount || 0) -
        Number(row.original.paid_amount || 0);
      return (
        <span className={balance > 0 ? "text-destructive font-medium" : ""}>
          Rs. {balance.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
  },
];

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    (searchParams.get("status") as InvoiceStatus) || "all"
  );

  const { data: invoices, isLoading } = useInvoices(
    profile?.branch_id || undefined,
    { status: statusFilter }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage all patient invoices"
        actions={
          <Button onClick={() => navigate("/app/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={(invoices as InvoiceRow[]) || []}
        searchKey="invoice_number"
        searchPlaceholder="Search invoices..."
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/app/billing/invoices/${row.id}`)}
      />
    </div>
  );
}
