import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServiceCategoryBadge } from "@/components/billing/ServiceCategoryBadge";
import { useAllServiceTypes, useToggleServiceTypeStatus } from "@/hooks/useBilling";
import { Plus, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Tables"]["service_types"]["Row"];
type ServiceCategory = Database["public"]["Enums"]["service_category"];

export default function ServiceTypesListPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | "all">("all");
  const { data: serviceTypes, isLoading } = useAllServiceTypes();
  const toggleStatus = useToggleServiceTypeStatus();

  const filteredData = serviceTypes?.filter((st) => 
    categoryFilter === "all" || st.category === categoryFilter
  ) || [];

  const columns: ColumnDef<ServiceType>[] = [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <ServiceCategoryBadge category={row.original.category} />
      ),
    },
    {
      accessorKey: "default_price",
      header: "Default Price",
      cell: ({ row }) => (
        <span className="font-mono">
          Rs. {Number(row.original.default_price || 0).toLocaleString()}
        </span>
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
          onClick={() => navigate(`/app/settings/services/${row.original.id}`)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Types"
        description="Configure billable services like consultations, lab tests, and procedures"
        actions={
          <Button onClick={() => navigate("/app/settings/services/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <Select
          value={categoryFilter}
          onValueChange={(val) => setCategoryFilter(val as ServiceCategory | "all")}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="consultation">Consultation</SelectItem>
            <SelectItem value="procedure">Procedure</SelectItem>
            <SelectItem value="lab">Lab</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
            <SelectItem value="room">Room</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Search services..."
        isLoading={isLoading}
      />
    </div>
  );
}
