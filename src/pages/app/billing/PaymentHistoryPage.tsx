import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayments } from "@/hooks/useBilling";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string | null;
  created_at: string;
  reference_number: string | null;
  payment_method?: { name: string } | null;
  received_by_profile?: { full_name: string } | null;
  invoice?: {
    invoice_number: string;
    patient?: {
      first_name: string;
      last_name: string | null;
      patient_number: string;
    };
  };
}

export default function PaymentHistoryPage() {
  const { profile } = useAuth();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { formatCurrency } = useCurrencyFormatter();

  const { data: payments, isLoading } = usePayments(profile?.branch_id || undefined, {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const totalAmount =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const columns: ColumnDef<PaymentRow>[] = [
    {
      accessorKey: "payment_date",
      header: "Date",
      cell: ({ row }) =>
        format(
          new Date(row.original.payment_date || row.original.created_at),
          "MMM dd, yyyy hh:mm a"
        ),
    },
    {
      accessorKey: "invoice",
      header: "Invoice",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.invoice?.invoice_number || "-"}
        </span>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original.invoice?.patient;
        return patient ? (
          <div>
            <p className="font-medium">
              {patient.first_name} {patient.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{patient.patient_number}</p>
          </div>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-semibold text-success">
          {formatCurrency(Number(row.original.amount))}
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Method",
      cell: ({ row }) => row.original.payment_method?.name || "Cash",
    },
    {
      accessorKey: "reference_number",
      header: "Reference",
      cell: ({ row }) => row.original.reference_number || "-",
    },
    {
      accessorKey: "received_by_profile",
      header: "Received By",
      cell: ({ row }) => row.original.received_by_profile?.full_name || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="View all recorded payments"
      />

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs">From Date</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <Label className="text-xs">To Date</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        {payments && payments.length > 0 && (
          <div className="ml-auto px-4 py-2 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            <p className="text-xl font-bold text-success">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={(payments as PaymentRow[]) || []}
        isLoading={isLoading}
      />
    </div>
  );
}
