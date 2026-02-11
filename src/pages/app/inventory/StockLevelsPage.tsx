import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { StockLevelIndicator } from "@/components/inventory/StockLevelIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";
import { useInventoryItems, useAdjustStock, useAllCategories } from "@/hooks/useInventory";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function StockLevelsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: categories } = useAllCategories();
  const adjustStock = useAdjustStock();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(false);

  const { data: items, isLoading } = useInventoryItems({
    search,
    categoryId: categoryFilter === "all" ? undefined : categoryFilter,
    lowStock: showLowStock,
  });

  // Adjustment modal state
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    currentStock: number;
  } | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add");
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const openAdjustment = (item: { id: string; name: string; total_stock?: number }) => {
    setSelectedItem({
      id: item.id,
      name: item.name,
      currentStock: item.total_stock || 0,
    });
    setAdjustmentType("add");
    setAdjustmentQty(0);
    setAdjustmentReason("");
    setAdjustmentOpen(true);
  };

  const handleAdjustment = async () => {
    if (!selectedItem || !profile?.branch_id || adjustmentQty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    try {
      await adjustStock.mutateAsync({
        item_id: selectedItem.id,
        branch_id: profile.branch_id,
        quantity: adjustmentQty,
        adjustment_type: adjustmentType === "add" ? "increase" : "decrease",
        reason: adjustmentReason || undefined,
      });
      toast.success("Stock adjusted successfully");
      setAdjustmentOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Levels"
        description="View and manage current inventory stock"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
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
            <StoreSelector
              branchId={profile?.branch_id || undefined}
              value={storeFilter}
              onChange={setStoreFilter}
              showAll
              className="w-full md:w-48"
            />
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {showLowStock ? "Showing Low Stock" : "Show Low Stock Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items && items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center">Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Standard Cost</TableHead>
                  <TableHead className="text-right">Stock Value</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const stock = item.total_stock || 0;
                  const reorder = item.reorder_level || 0;
                  const minimum = item.minimum_stock || 0;
                  const isLow = stock <= reorder;
                  const isCritical = stock <= minimum;

                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/app/inventory/items/${item.id}`)}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.item_code}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.category?.name || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <StockLevelIndicator
                          currentStock={stock}
                          reorderLevel={reorder}
                          minimumStock={minimum}
                        />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {reorder}
                      </TableCell>
                      <TableCell>
                        {isCritical ? (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Critical
                          </Badge>
                        ) : isLow ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs. {item.standard_cost?.toLocaleString() || "0"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rs. {(stock * (item.standard_cost || 0)).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAdjustment(item);
                          }}
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current Stock: {selectedItem.currentStock}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setAdjustmentType("add")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stock
                </Button>
                <Button
                  variant={adjustmentType === "subtract" ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => setAdjustmentType("subtract")}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Remove Stock
                </Button>
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="e.g., Physical count adjustment, damaged goods..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  New Stock:{" "}
                  <span className="font-bold">
                    {adjustmentType === "add"
                      ? selectedItem.currentStock + adjustmentQty
                      : selectedItem.currentStock - adjustmentQty}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdjustment}
                  disabled={adjustStock.isPending || adjustmentQty <= 0}
                  variant={adjustmentType === "subtract" ? "destructive" : "default"}
                >
                  {adjustmentType === "add" ? "Add" : "Remove"} Stock
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
