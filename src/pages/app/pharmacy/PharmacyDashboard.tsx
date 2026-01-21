import { useNavigate } from "react-router-dom";
import { Package, ClipboardList, AlertTriangle, Clock, Pill, TrendingUp, Plus } from "lucide-react";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePharmacyStats, usePrescriptionQueue, useLowStockItems, useExpiringItems } from "@/hooks/usePharmacy";
import { LowStockAlert } from "@/components/pharmacy/LowStockAlert";
import { ExpiryAlert } from "@/components/pharmacy/ExpiryAlert";
import { DailySalesSummary } from "@/components/pharmacy/DailySalesSummary";
import { PrescriptionQueueCard } from "@/components/pharmacy/PrescriptionQueueCard";
import { useAuth } from "@/contexts/AuthContext";

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = usePharmacyStats();
  const { data: queue, isLoading: queueLoading } = usePrescriptionQueue();
  const { data: lowStockItems } = useLowStockItems();
  const { data: expiringItems } = useExpiringItems();

  const recentQueue = queue?.slice(0, 4) || [];
  const firstName = profile?.full_name?.split(" ")[0] || "Pharmacist";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Pharmacy"
        userName={firstName}
        showGreeting
        variant="gradient"
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
        quickStats={[
          { label: "Pending", value: stats?.pendingPrescriptions || 0, variant: "warning" },
          { label: "Dispensed", value: stats?.dispensedToday || 0, variant: "success" },
          { label: "Low Stock", value: lowStockItems?.length || 0, variant: "destructive" },
        ]}
      />

      {/* Alerts */}
      <div className="space-y-3">
        <LowStockAlert count={lowStockItems?.length || 0} />
        <ExpiryAlert count={expiringItems?.length || 0} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <ModernStatsCard
              title="Pending Prescriptions"
              value={stats?.pendingPrescriptions || 0}
              icon={ClipboardList}
              variant="warning"
              onClick={() => navigate("/app/pharmacy/queue")}
              delay={0}
            />
            <ModernStatsCard
              title="Dispensed Today"
              value={stats?.dispensedToday || 0}
              icon={Pill}
              variant="success"
              delay={100}
            />
            <ModernStatsCard
              title="Low Stock Items"
              value={stats?.lowStockItems || 0}
              icon={AlertTriangle}
              variant="destructive"
              onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
              delay={200}
            />
            <ModernStatsCard
              title="Expiring Soon"
              value={stats?.expiringItems || 0}
              icon={Clock}
              variant="info"
              onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
              delay={300}
            />
          </>
        )}
      </div>

      {/* Quick Actions + Daily Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/pharmacy/medicines")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Medicine Catalog</h3>
              <p className="text-sm text-muted-foreground">Manage medicines</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/pharmacy/inventory/add")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Add Stock</h3>
              <p className="text-sm text-muted-foreground">Add new inventory</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/pharmacy/inventory")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-info to-info/80 text-info-foreground shadow-lg shadow-info/30 group-hover:scale-110 transition-transform">
              <Package className="h-6 w-6" />
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
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <ClipboardList className="h-4 w-4 text-warning" />
            </div>
            Prescription Queue
          </CardTitle>
          {queue && queue.length > 4 && (
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/pharmacy/queue")}>
              View All ({queue.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {queueLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
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
