import { useState } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Package, Building, ClipboardPen, PackageCheck, 
  FileInput, AlertTriangle, BarChart3, Plus, Warehouse, ArrowLeftRight
} from "lucide-react";
import { useInventoryDashboardStats } from "@/hooks/useInventory";
import { StatsCard } from "@/components/StatsCard";
import { LowStockAlertWidget } from "@/components/inventory/LowStockAlertWidget";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useRequisitions } from "@/hooks/useRequisitions";
import { POStatusBadge } from "@/components/inventory/POStatusBadge";
import { RequisitionStatusBadge } from "@/components/inventory/RequisitionStatusBadge";
import { StoreSelector } from "@/components/inventory/StoreSelector";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryDashboard() {
  const { profile } = useAuth();
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const storeId = selectedStore === "all" ? undefined : selectedStore;

  const { data: stats, isLoading: statsLoading } = useInventoryDashboardStats(storeId);
  const { data: recentPOs, isLoading: posLoading } = usePurchaseOrders();
  const { data: pendingReqs, isLoading: reqsLoading } = useRequisitions({ status: "pending" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory & Procurement</h1>
          <p className="text-muted-foreground">Manage stock, vendors, and purchase orders</p>
        </div>
        <div className="flex gap-2 items-center">
          <StoreSelector
            branchId={profile?.branch_id || undefined}
            value={selectedStore}
            onChange={setSelectedStore}
            showAll
            className="w-[200px]"
          />
          <Button asChild variant="outline">
            <Link to="/app/inventory/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/inventory/purchase-orders/new">
              <ClipboardPen className="mr-2 h-4 w-4" />
              New PO
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /></CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard title="Total Items" value={stats?.totalItems || 0} icon={Package} description="Active inventory items" />
            <StatsCard title="Low Stock Items" value={stats?.lowStockCount || 0} icon={AlertTriangle} description="Below reorder level" />
            <StatsCard title="Pending POs" value={stats?.pendingPOs || 0} icon={ClipboardPen} description="Awaiting approval" />
            <StatsCard title="Inventory Value" value={formatCurrency((stats?.totalValue || 0))} icon={BarChart3} description="Total stock value" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link to="/app/inventory/items">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Item Catalog</h3>
                <p className="text-sm text-muted-foreground">Manage items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/inventory/vendors">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Vendors</h3>
                <p className="text-sm text-muted-foreground">{stats?.vendorCount || 0} active</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/inventory/grn">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <PackageCheck className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Goods Receipt</h3>
                <p className="text-sm text-muted-foreground">Receive stock</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/inventory/requisitions">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <FileInput className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Requisitions</h3>
                <p className="text-sm text-muted-foreground">{stats?.pendingRequisitions || 0} pending</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/inventory/stores">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <Warehouse className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Warehouses</h3>
                <p className="text-sm text-muted-foreground">Manage stores</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/app/inventory/transfers">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <ArrowLeftRight className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Transfers</h3>
                <p className="text-sm text-muted-foreground">Inter-store</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LowStockAlertWidget />

        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Recent Purchase Orders</span>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link to="/app/inventory/purchase-orders">View all →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : recentPOs?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchase orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentPOs?.slice(0, 5).map((po) => (
                  <Link key={po.id} to={`/app/inventory/purchase-orders/${po.id}`} className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-md -mx-2">
                    <div>
                      <p className="text-sm font-medium">{po.po_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {po.vendor?.name} • {format(new Date(po.order_date), "dd MMM yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <POStatusBadge status={po.status} />
                      <p className="text-xs text-muted-foreground mt-1">{formatCurrency(po.total_amount)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requisitions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Pending Requisitions</span>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link to="/app/inventory/requisitions">View all →</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reqsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : pendingReqs?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requisitions</p>
            ) : (
              <div className="space-y-3">
                {pendingReqs?.slice(0, 5).map((req) => (
                  <Link key={req.id} to={`/app/inventory/requisitions/${req.id}`} className="flex items-center justify-between hover:bg-accent/50 p-2 rounded-md -mx-2">
                    <div>
                      <p className="text-sm font-medium">{req.requisition_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.requested_by_profile?.full_name} • {req.department?.name || "General"}
                      </p>
                    </div>
                    <div className="text-right">
                      <RequisitionStatusBadge status={req.status} />
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(req.request_date), "dd MMM")}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
