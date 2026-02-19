import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockLevelBadge } from "@/components/pharmacy/StockLevelBadge";
import { InventoryAdjustmentModal } from "@/components/pharmacy/InventoryAdjustmentModal";
import { useInventory, useMedicineCategories, InventoryWithMedicine } from "@/hooks/usePharmacy";
import { useRackAssignments } from "@/hooks/useStoreRacks";
import { RackLocationBadge } from "@/components/pharmacy/RackLocationBadge";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { ArrowLeft, Plus, Search, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/lib/i18n";

export default function InventoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>(initialFilter || "all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [adjustingItem, setAdjustingItem] = useState<InventoryWithMedicine | null>(null);

  const { data: categories } = useMedicineCategories();
  const { data: rackAssignments } = useRackAssignments();
  const { data: inventory, isLoading } = useInventory(undefined, {
    lowStock: stockFilter === "lowStock", expiringSoon: stockFilter === "expiring",
    categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
    search: search || undefined, storeId: storeFilter !== "all" ? storeFilter : undefined,
  });

  const columns: ColumnDef<InventoryWithMedicine>[] = [
    { accessorKey: "medicine", header: t('pharmacy.medicine' as any), cell: ({ row }) => (<div><p className="font-medium">{row.original.medicine?.name}</p>{row.original.medicine?.generic_name && (<p className="text-xs text-muted-foreground">{row.original.medicine.generic_name}</p>)}</div>) },
    { accessorKey: "batch_number", header: t('pharmacy.batchNumber' as any), cell: ({ row }) => row.original.batch_number || "-" },
    { accessorKey: "quantity", header: t('pharmacy.quantity' as any), cell: ({ row }) => (<div className="flex items-center gap-2"><span className="font-medium">{row.original.quantity}</span><StockLevelBadge quantity={row.original.quantity || 0} reorderLevel={row.original.reorder_level || 10} /></div>) },
    { accessorKey: "unit_price", header: t('pharmacy.unitPrice' as any), cell: ({ row }) => row.original.unit_price ? `Rs. ${row.original.unit_price}` : "-" },
    { accessorKey: "selling_price", header: t('pharmacy.sellingPrice' as any), cell: ({ row }) => row.original.selling_price ? `Rs. ${row.original.selling_price}` : "-" },
    { accessorKey: "expiry_date", header: t('pharmacy.expiry' as any), cell: ({ row }) => { if (!row.original.expiry_date) return "-"; const expDate = new Date(row.original.expiry_date); const isExpired = expDate < new Date(); const isExpiringSoon = !isExpired && expDate < new Date(Date.now() + 30*24*60*60*1000); return <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "outline"}>{format(expDate, "MMM yyyy")}</Badge>; } },
    { id: "rack_location", header: t('pharmacy.rackLocation' as any), cell: ({ row }) => { const assignment = rackAssignments?.find(a => a.medicine_id === row.original.medicine_id); if (!assignment) return <span className="text-xs text-muted-foreground">—</span>; return <RackLocationBadge rackCode={assignment.rack?.rack_code} rackName={assignment.rack?.rack_name} shelfNumber={assignment.shelf_number} position={assignment.position} compact />; } },
    { id: "warehouse", header: t('pharmacy.warehouse' as any), cell: ({ row }) => (<span className="text-sm">{row.original.store?.name || <span className="text-muted-foreground">{t('pharmacy.unassigned' as any)}</span>}</span>) },
    { accessorKey: "supplier_name", header: t('pharmacy.supplier' as any), cell: ({ row }) => row.original.supplier_name || "-" },
    { id: "actions", cell: ({ row }) => (<Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setAdjustingItem(row.original); }}><Edit className="h-4 w-4" /></Button>) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('pharmacy.inventory' as any)}
        description={t('pharmacy.manageStockBatches' as any)}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy")}><ArrowLeft className="mr-2 h-4 w-4" />{t('common.back' as any)}</Button>
            <Button onClick={() => navigate("/app/pharmacy/inventory/add")}><Plus className="mr-2 h-4 w-4" />{t('pharmacy.addStock' as any)}</Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t('pharmacy.searchByMedicineOrBatch' as any)} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <StoreSelector value={storeFilter} onChange={setStoreFilter} showAll placeholder={t('pharmacy.allWarehouses' as any)} className="w-[180px]" context="pharmacy" />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('pharmacy.category' as any)} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pharmacy.allCategories' as any)}</SelectItem>
            {categories?.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('pharmacy.stockStatus' as any)} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('pharmacy.allStock' as any)}</SelectItem>
            <SelectItem value="lowStock">{t('pharmacy.lowStock' as any)}</SelectItem>
            <SelectItem value="expiring">{t('pharmacy.expiringSoon' as any)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={inventory || []} isLoading={isLoading} />
      <InventoryAdjustmentModal inventory={adjustingItem} open={!!adjustingItem} onOpenChange={(open) => !open && setAdjustingItem(null)} />
    </div>
  );
}
