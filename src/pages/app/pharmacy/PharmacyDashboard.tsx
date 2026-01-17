import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LowStockAlert } from "@/components/pharmacy/LowStockAlert";
import { ExpiryAlert } from "@/components/pharmacy/ExpiryAlert";
import { PrescriptionQueueCard } from "@/components/pharmacy/PrescriptionQueueCard";
import { DailySalesSummary } from "@/components/pharmacy/DailySalesSummary";
import { usePharmacyStats, usePrescriptionQueue, useLowStockItems, useExpiringItems } from "@/hooks/usePharmacy";
import { ClipboardList, Package, Pill, AlertTriangle, History, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePharmacyStats();
  const { data: queue, isLoading: queueLoading } = usePrescriptionQueue();
  const { data: lowStockItems } = useLowStockItems();
  const { data: expiringItems } = useExpiringItems();

  const recentQueue = queue?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        description="Manage prescriptions and inventory"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/pharmacy/inventory")}>
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button onClick={() => navigate("/app/pharmacy/queue")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              View Queue
            </Button>
          </div>
        }
      />

      {/* Alerts */}
      <div className="space-y-3">
        <LowStockAlert count={lowStockItems?.length || 0} />
        <ExpiryAlert count={expiringItems?.length || 0} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Pending Prescriptions"
              value={stats?.pendingPrescriptions || 0}
              icon={ClipboardList}
              onClick={() => navigate("/app/pharmacy/queue")}
            />
            <StatsCard
              title="Dispensed Today"
              value={stats?.dispensedToday || 0}
              icon={History}
            />
            <StatsCard
              title="Low Stock Items"
              value={stats?.lowStockItems || 0}
              icon={AlertTriangle}
              className={stats?.lowStockItems ? "border-orange-200" : ""}
              onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
            />
            <StatsCard
              title="Expiring Soon"
              value={stats?.expiringItems || 0}
              icon={Pill}
              className={stats?.expiringItems ? "border-amber-200" : ""}
              onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
            />
          </>
        )}
      </div>

      {/* Quick Actions + Daily Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/pharmacy/medicines")}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Medicine Catalog</h3>
              <p className="text-sm text-muted-foreground">Manage medicines</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/pharmacy/inventory/add")}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Add Stock</h3>
              <p className="text-sm text-muted-foreground">Add new inventory</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/app/pharmacy/inventory")}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">View Inventory</h3>
              <p className="text-sm text-muted-foreground">Stock levels & batches</p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Sales Summary */}
        <div className="md:col-span-3 lg:col-span-1 lg:row-span-2">
          <DailySalesSummary />
        </div>
      </div>

      {/* Prescription Queue Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prescription Queue</CardTitle>
          {queue && queue.length > 4 && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/pharmacy/queue")}>
              View All ({queue.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {queueLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentQueue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending prescriptions</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {recentQueue.map((prescription) => (
                <PrescriptionQueueCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
