import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";
import { StockLevelIndicator } from "@/components/inventory/StockLevelIndicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Package,
  AlertTriangle,
  Calendar,
  Building2,
  ShoppingCart,
} from "lucide-react";
import { useInventoryItem, useInventoryStock, useStockAdjustments } from "@/hooks/useInventory";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export default function ItemDetailPage() {
  const { formatCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: item, isLoading } = useInventoryItem(id || "");
  const { data: stockRecords } = useInventoryStock(id);
  const { data: adjustments } = useStockAdjustments(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Item not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/inventory/items")}>
          Back to Items
        </Button>
      </div>
    );
  }

  const totalStock = item.total_stock || 0;
  const isLowStock = totalStock <= (item.reorder_level || 0);
  const isCritical = totalStock <= (item.minimum_stock || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.name}
        description={`${item.item_code} • ${item.category?.name || "Uncategorized"}`}
      />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate("/app/inventory/items")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => navigate(`/app/inventory/items/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Item
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/app/inventory/purchase-orders/new?itemId=${id}`)}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{totalStock}</span>
              <span className="text-muted-foreground">{item.unit_of_measure}</span>
              {isCritical && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critical
                </Badge>
              )}
              {isLowStock && !isCritical && (
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800">
                  Low Stock
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reorder Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{item.reorder_level || 0}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Standard Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {formatCurrency(item.standard_cost || 0)}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {formatCurrency(totalStock * (item.standard_cost || 0))}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Item Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Item Code</p>
                <p className="font-medium">{item.item_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{item.category?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit of Measure</p>
                <p className="font-medium">{item.unit_of_measure}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consumable</p>
                <Badge variant="outline">
                  {item.is_consumable ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Minimum Stock</p>
                <p className="font-medium">{item.minimum_stock || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reorder Level</p>
                <p className="font-medium">{item.reorder_level || 0}</p>
              </div>
            </div>
            {item.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="mt-1">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock by Branch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Stock by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockRecords && stockRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Expiry</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRecords.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">
                        {stock.branch?.name || "—"}
                      </TableCell>
                      <TableCell>{stock.batch_number || "—"}</TableCell>
                      <TableCell>
                        <StockLevelIndicator
                          currentStock={stock.quantity}
                          reorderLevel={item.reorder_level || 0}
                          minimumStock={item.minimum_stock || 0}
                        />
                      </TableCell>
                      <TableCell>
                        {stock.expiry_date ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {format(new Date(stock.expiry_date), "MMM dd, yyyy")}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No stock records found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Adjustments History */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          {adjustments && adjustments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty Change</TableHead>
                  <TableHead>Previous → New</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.slice(0, 10).map((adj) => {
                  const qtyChange = adj.new_quantity - adj.previous_quantity;
                  return (
                    <TableRow key={adj.id}>
                      <TableCell>
                        {format(new Date(adj.created_at!), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {adj.adjustment_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={
                          qtyChange > 0
                            ? "text-emerald-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {qtyChange > 0 ? "+" : ""}
                        {qtyChange}
                      </TableCell>
                      <TableCell>
                        {adj.previous_quantity} → {adj.new_quantity}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {adj.reason || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No adjustment history
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
