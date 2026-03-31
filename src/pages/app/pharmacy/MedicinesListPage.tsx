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
import { useTranslation } from "@/lib/i18n";

export default function MedicinesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data: medicines, isLoading } = useMedicines(search);

  const columns: ColumnDef<MedicineWithCategory>[] = [
    {
      accessorKey: "name",
      header: t('common.name' as any),
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
      header: t('pharmacy.category' as any),
      cell: ({ row }) => row.original.category?.name || "-",
    },
    {
      accessorKey: "strength",
      header: t('pharmacy.strength' as any),
      cell: ({ row }) => row.original.strength || "-",
    },
    {
      accessorKey: "unit",
      header: t('pharmacy.unit' as any),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.unit || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "cost_price",
      header: t('pharmacy.costPrice' as any),
      cell: ({ row }) => {
        const val = Number(row.original.cost_price) || 0;
        return val > 0 ? val.toFixed(2) : "-";
      },
    },
    {
      accessorKey: "sale_price",
      header: t('pharmacy.salePrice' as any),
      cell: ({ row }) => {
        const val = Number(row.original.sale_price) || 0;
        return val > 0 ? val.toFixed(2) : "-";
      },
    },
    {
      id: "profit_margin",
      header: t('pharmacy.profitMargin' as any),
      cell: ({ row }) => {
        const cost = Number(row.original.cost_price) || 0;
        const sale = Number(row.original.sale_price) || 0;
        if (sale <= 0) return "-";
        const margin = ((sale - cost) / sale * 100).toFixed(1);
        const profit = sale - cost;
        return (
          <Badge variant={profit >= 0 ? "default" : "destructive"}>
            {margin}%
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: t('common.status' as any),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? t('common.active' as any) : t('common.inactive' as any)}
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
          {t('common.edit' as any)}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pharmacy.medicineCatalog' as any)}
        description={t('pharmacy.manageMedicines' as any)}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back' as any)}
            </Button>
            <Button onClick={() => navigate("/app/pharmacy/medicines/new")}>
              <Plus className="mr-2 h-4 w-4" />
              {t('pharmacy.addMedicine' as any)}
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={medicines || []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder={t('pharmacy.searchMedicines' as any)}
        onRowClick={(row) => navigate(`/app/pharmacy/medicines/${row.id}/edit`)}
      />
    </div>
  );
}
