import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockLevelBadge } from "@/components/pharmacy/StockLevelBadge";
import { InventoryAdjustmentModal } from "@/components/pharmacy/InventoryAdjustmentModal";
import { useInventory, useMedicineCategories, InventoryWithMedicine } from "@/hooks/usePharmacy";
import { ArrowLeft, Plus, Search, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export default function InventoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>(initialFilter || "all");
  const [adjustingItem, setAdjustingItem] = useState<InventoryWithMedicine | null>(null);

  const { data: categories } = useMedicineCategories();
  const { data: inventory, isLoading } = useInventory(undefined, {
    lowStock: stockFilter === "lowStock",
    expiringSoon: stockFilter === "expiring",
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    search: search || undefined,
  });

  const columns: ColumnDef<InventoryWithMedicine>[] = [
    {
      accessorKey: "medicine",
      header: "Medicine",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.medicine?.name}</p>
          {row.original.medicine?.generic_name && (
            <p className="text-xs text-muted-foreground">{row.original.medicine.generic_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "batch_number",
      header: "Batch #",
      cell: ({ row }) => row.original.batch_number || "-",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.quantity}</span>
          <StockLevelBadge 
            quantity={row.original.quantity || 0} 
            reorderLevel={row.original.reorder_level || 10} 
          />
        </div>
      ),
    },
    {
      accessorKey: "unit_price",
      header: "Unit Price",
      cell: ({ row }) => row.original.unit_price ? `Rs. ${row.original.unit_price}` : "-",
    },
    {
      accessorKey: "selling_price",
      header: "Selling Price",
      cell: ({ row }) => row.original.selling_price ? `Rs. ${row.original.selling_price}` : "-",
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry",
      cell: ({ row }) => {
        if (!row.original.expiry_date) return "-";
        const expDate = new Date(row.original.expiry_date);
        const isExpired = expDate < new Date();
        const isExpiringSoon = !isExpired && expDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <Badge 
            variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "outline"}
          >
            {format(expDate, "MMM yyyy")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "supplier_name",
      header: "Supplier",
      cell: ({ row }) => row.original.supplier_name || "-",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setAdjustingItem(row.original);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Manage medicine stock and batches"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate("/app/pharmacy/inventory/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by medicine name or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="lowStock">Low Stock</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={inventory || []}
        isLoading={isLoading}
      />

      <InventoryAdjustmentModal
        inventory={adjustingItem}
        open={!!adjustingItem}
        onOpenChange={(open) => !open && setAdjustingItem(null)}
      />
    </div>
  );
}
