import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Package } from "lucide-react";
import { useInventoryItems, useAllCategories } from "@/hooks/useInventory";
import { StockLevelIndicator } from "@/components/inventory/StockLevelIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/PageHeader";

export default function ItemsListPage() {
  const { formatCurrency } = useCurrencyFormatter();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [showLowStock, setShowLowStock] = useState(false);

  const { data: items, isLoading } = useInventoryItems({
    search,
    categoryId: categoryId !== "all" ? categoryId : undefined,
    lowStock: showLowStock,
  });
  const { data: categories } = useAllCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Item Catalog"
        description="Manage your inventory items"
        actions={
          <Button asChild>
            <Link to="/app/inventory/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[200px]">
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
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              Low Stock Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items?.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No items found</h3>
              <p className="text-muted-foreground">
                {search || categoryId ? "Try adjusting your filters" : "Add your first inventory item"}
              </p>
              <Button asChild className="mt-4">
                <Link to="/app/inventory/items/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead className="text-right">Standard Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item, index) => (
                  <TableRow key={`${item.id}-${item.store_id || index}`}>
                    <TableCell>
                      <Link
                        to={`/app/inventory/items/${item.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {item.item_code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category?.name || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.store_name || "—"}
                    </TableCell>
                    <TableCell>{item.unit_of_measure}</TableCell>
                    <TableCell>
                      <StockLevelIndicator
                        currentStock={item.total_stock || 0}
                        reorderLevel={item.reorder_level}
                        minimumStock={item.minimum_stock}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.standard_cost)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
