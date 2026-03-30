import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useInventory } from "@/hooks/usePharmacy";
import { format, differenceInDays } from "date-fns";
import { AlertTriangle, Package, Calendar, ShoppingCart, FileText } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

interface InventoryItem {
  id: string;
  medicine_id?: string;
  medicine?: { id?: string; name: string; generic_name?: string };
  batch_number: string;
  quantity: number;
  reorder_level?: number;
  expiry_date: string;
  purchase_price?: number;
  selling_price?: number;
}

export default function StockAlertsPage() {
  const navigate = useNavigate();
  const { data: inventory = [], isLoading } = useInventory();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const lowStockItems = inventory.filter((item: InventoryItem) => 
    item.quantity < (item.reorder_level || 10) && item.quantity > 0
  );

  const outOfStockItems = inventory.filter((item: InventoryItem) => item.quantity === 0);

  const expiringItems = inventory.filter((item: InventoryItem) => {
    const daysUntilExpiry = differenceInDays(new Date(item.expiry_date), new Date());
    return daysUntilExpiry > 0 && daysUntilExpiry <= 90 && item.quantity > 0;
  }).sort((a: InventoryItem, b: InventoryItem) => 
    new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );

  const expiredItems = inventory.filter((item: InventoryItem) => {
    const daysUntilExpiry = differenceInDays(new Date(item.expiry_date), new Date());
    return daysUntilExpiry <= 0 && item.quantity > 0;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allReorderItems = [...lowStockItems, ...outOfStockItems];

  const toggleAllReorder = () => {
    if (selectedIds.size === allReorderItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allReorderItems.map(i => i.id)));
    }
  };

  const handleCreateRequisition = () => {
    const items = allReorderItems
      .filter(item => selectedIds.size === 0 || selectedIds.has(item.id))
      .map((item: InventoryItem) => ({
        medicine_id: item.medicine_id || item.medicine?.id,
        name: item.medicine?.name || "Unknown",
        quantity: Math.max((item.reorder_level || 10) - item.quantity, 1),
      }));

    navigate("/app/inventory/requisitions/new", {
      state: { reorderMedicines: items },
    });
  };

  const lowStockColumns: ColumnDef<InventoryItem>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allReorderItems.length > 0 && selectedIds.size === allReorderItems.length}
          onCheckedChange={toggleAllReorder}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={() => toggleSelect(row.original.id)}
        />
      ),
      size: 40,
    },
    {
      accessorKey: "medicine.name",
      header: "Medicine",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.medicine?.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.medicine?.generic_name}</p>
        </div>
      ),
    },
    {
      accessorKey: "batch_number",
      header: "Batch",
    },
    {
      accessorKey: "quantity",
      header: "Current Stock",
      cell: ({ row }) => (
        <Badge variant="destructive">{row.original.quantity}</Badge>
      ),
    },
    {
      accessorKey: "reorder_level",
      header: "Reorder Level",
      cell: ({ row }) => row.original.reorder_level || 10,
    },
    {
      accessorKey: "expiry_date",
      header: "Expires",
      cell: ({ row }) => format(new Date(row.original.expiry_date), "PP"),
    },
  ];

  const expiryColumns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: "medicine.name",
      header: "Medicine",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.medicine?.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.medicine?.generic_name}</p>
        </div>
      ),
    },
    {
      accessorKey: "batch_number",
      header: "Batch",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry Date",
      cell: ({ row }) => {
        const daysUntilExpiry = differenceInDays(new Date(row.original.expiry_date), new Date());
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (daysUntilExpiry <= 0) variant = "destructive";
        else if (daysUntilExpiry <= 30) variant = "destructive";
        else if (daysUntilExpiry <= 60) variant = "outline";

        return (
          <Badge variant={variant}>
            {daysUntilExpiry <= 0 ? "EXPIRED" : `${daysUntilExpiry} days left`}
          </Badge>
        );
      },
    },
    {
      accessorKey: "selling_price",
      header: "Value",
      cell: ({ row }) => (
        <span className="font-mono">
          Rs. {((row.original.selling_price || 0) * row.original.quantity).toFixed(2)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Alerts"
        description="Monitor low stock and expiring medicines"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCreateRequisition}
              disabled={allReorderItems.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              Create Requisition
              {selectedIds.size > 0 && ` (${selectedIds.size})`}
            </Button>
            <Button onClick={() => navigate("/app/pharmacy/inventory/add")}>
              <Package className="mr-2 h-4 w-4" />
              Add Stock
            </Button>
          </div>
        }
      />

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">{lowStockItems.length}</div>
            <p className="text-xs text-amber-600">Items need reordering</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{outOfStockItems.length}</div>
            <p className="text-xs text-red-600">Items with zero stock</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{expiringItems.length}</div>
            <p className="text-xs text-orange-600">Expires within 90 days</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800 dark:text-red-200">{expiredItems.length}</div>
            <p className="text-xs text-red-600">Needs disposal</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="low-stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="low-stock" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Low Stock ({lowStockItems.length})
          </TabsTrigger>
          <TabsTrigger value="out-of-stock" className="gap-2">
            <Package className="h-4 w-4" />
            Out of Stock ({outOfStockItems.length})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="gap-2">
            <Calendar className="h-4 w-4" />
            Expiring ({expiringItems.length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Expired ({expiredItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock">
          <DataTable columns={lowStockColumns} data={lowStockItems} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="out-of-stock">
          <DataTable columns={lowStockColumns} data={outOfStockItems} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="expiring">
          <DataTable columns={expiryColumns} data={expiringItems} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="expired">
          <DataTable columns={expiryColumns} data={expiredItems} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
