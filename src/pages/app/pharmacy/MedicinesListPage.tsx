import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMedicines } from "@/hooks/useMedicines";
import { ArrowLeft, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { MedicineWithCategory } from "@/hooks/useMedicines";

export default function MedicinesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: medicines, isLoading } = useMedicines(search);

  const columns: ColumnDef<MedicineWithCategory>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.generic_name && (
            <p className="text-xs text-muted-foreground">{row.original.generic_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      accessorKey: "strength",
      header: "Strength",
      cell: ({ row }) => row.original.strength || "-",
    },
    {
      accessorKey: "unit",
      header: "Unit",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.unit || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "manufacturer",
      header: "Manufacturer",
      cell: ({ row }) => row.original.manufacturer || "-",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/app/pharmacy/medicines/${row.original.id}/edit`);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Catalog"
        description="Manage your medicine inventory catalog"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate("/app/pharmacy/medicines/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={medicines || []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="Search medicines..."
        onRowClick={(row) => navigate(`/app/pharmacy/medicines/${row.id}/edit`)}
      />
    </div>
  );
}
