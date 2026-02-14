import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/hooks/useStores";
import { useAllStoreRacks } from "@/hooks/useStoreRacks";
import { useInventory } from "@/hooks/usePharmacy";
import { ArrowLeft, Edit, LayoutGrid, Warehouse, Package, AlertTriangle, DollarSign, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WarehouseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: store, isLoading } = useStore(id || "");
  const { data: racks } = useAllStoreRacks(id || "");
  const { data: storeInventory } = useInventory(undefined, { storeId: id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!store) return <div>Warehouse not found</div>;

  const activeRacks = racks?.filter((r) => r.is_active) || [];
  const totalItems = storeInventory?.length || 0;
  const totalValue = storeInventory?.reduce((sum, i) => sum + (i.quantity || 0) * (i.unit_price || 0), 0) || 0;
  const lowStockCount = storeInventory?.filter((i) => (i.quantity || 0) <= (i.reorder_level || 10)).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={store.name}
        description={store.description || `${store.store_type} warehouse`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy/warehouses")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => navigate(`/app/pharmacy/warehouses/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={() => navigate(`/app/pharmacy/warehouses/${id}/racks`)}>
              <LayoutGrid className="mr-2 h-4 w-4" /> Manage Racks
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Info</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{store.name}</span>
              {store.is_central && <Badge>Central</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">Type: {store.store_type}</p>
            {store.code && <p className="text-sm text-muted-foreground">Code: {store.code}</p>}
            <Badge variant={store.is_active ? "default" : "secondary"}>
              {store.is_active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Racks</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activeRacks.length}</p>
                <p className="text-xs text-muted-foreground">Active racks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Stock Items</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Pill className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">Rs. {totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? "text-destructive" : "text-primary"}`} />
              <div>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-xs text-muted-foreground">Items low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick racks list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" /> Racks ({activeRacks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRacks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No racks configured yet.</p>
              <Button variant="link" onClick={() => navigate(`/app/pharmacy/warehouses/${id}/racks`)}>
                Add racks →
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {activeRacks.map((rack) => (
                <div key={rack.id} className="border rounded-lg p-3 text-center hover:bg-accent/50 transition-colors">
                  <p className="font-mono font-bold text-sm">{rack.rack_code}</p>
                  {rack.rack_name && <p className="text-xs text-muted-foreground truncate">{rack.rack_name}</p>}
                  {rack.section && <Badge variant="outline" className="text-xs mt-1">{rack.section}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock in this warehouse */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" /> Stock ({totalItems})
            </CardTitle>
            {totalItems > 0 && (
              <Button variant="link" size="sm" onClick={() => navigate(`/app/pharmacy/inventory?store=${id}`)}>
                View all →
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {totalItems === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No stock in this warehouse yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {storeInventory?.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{item.medicine?.name}</p>
                    {item.batch_number && <p className="text-xs text-muted-foreground">Batch: {item.batch_number}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{item.quantity}</p>
                    {(item.quantity || 0) <= (item.reorder_level || 10) && (
                      <Badge variant="destructive" className="text-xs">Low</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch card at bottom */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Branch</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-lg font-medium">{store.branch?.name || "—"}</p>
              <p className="text-xs text-muted-foreground">Assigned branch</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}