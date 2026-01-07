import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAllPaymentMethods, useTogglePaymentMethodStatus } from "@/hooks/useBilling";
import { Plus, Edit, Banknote, CreditCard, Smartphone, Building2, Wallet } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/integrations/supabase/types";

type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];

const iconMap: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  "credit-card": <CreditCard className="h-4 w-4" />,
  bank: <Building2 className="h-4 w-4" />,
  smartphone: <Smartphone className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
};

export default function PaymentMethodsListPage() {
  const navigate = useNavigate();
  const { data: paymentMethods, isLoading } = useAllPaymentMethods();
  const toggleStatus = useTogglePaymentMethodStatus();

  const columns: ColumnDef<PaymentMethod>[] = [
    {
      accessorKey: "sort_order",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.sort_order}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {iconMap[row.original.icon || "cash"] || <Wallet className="h-4 w-4" />}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <code className="px-2 py-1 bg-muted rounded text-sm">
          {row.original.code}
        </code>
      ),
    },
    {
      accessorKey: "requires_reference",
      header: "Requires Reference",
      cell: ({ row }) => (
        row.original.requires_reference ? (
          <Badge variant="outline">Yes</Badge>
        ) : (
          <span className="text-muted-foreground">No</span>
        )
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Switch
          checked={row.original.is_active ?? true}
          onCheckedChange={() => toggleStatus.mutate(row.original.id)}
          disabled={toggleStatus.isPending}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/app/settings/payment-methods/${row.original.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Configure payment options for billing"
        actions={
          <Button onClick={() => navigate("/app/settings/payment-methods/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={paymentMethods || []}
        searchKey="name"
        searchPlaceholder="Search payment methods..."
        isLoading={isLoading}
      />
    </div>
  );
}
