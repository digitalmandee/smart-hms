import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Pill, 
  AlertTriangle, 
  Clock, 
  ClipboardList,
  Package,
  Plus,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface MobilePharmacyViewProps {
  profile: any;
  stats: {
    pendingPrescriptions?: number;
    dispensedToday?: number;
    lowStockItems?: number;
    expiringItems?: number;
  } | undefined;
  queue: any[];
  lowStockCount: number;
  expiringCount: number;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function MobilePharmacyView({
  profile,
  stats,
  queue,
  lowStockCount,
  expiringCount,
  isLoading,
  onRefresh
}: MobilePharmacyViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleQuickAction = (action: string) => {
    haptics.light();
    switch (action) {
      case "queue":
        navigate("/app/pharmacy/queue");
        break;
      case "inventory":
        navigate("/app/pharmacy/inventory");
        break;
      case "addStock":
        navigate("/app/pharmacy/inventory/add");
        break;
    }
  };

  return (
    <PullToRefresh onRefresh={onRefresh} className="min-h-full bg-background">
      <div className="px-4 py-4 space-y-6 pb-24">
        {/* Greeting Header */}
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Pharmacist"}
          </h1>
        </div>

        {/* Alerts */}
        {(lowStockCount > 0 || expiringCount > 0) && (
          <div className="space-y-2">
            {lowStockCount > 0 && (
              <div 
                onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 touch-manipulation active:scale-[0.98] cursor-pointer"
              >
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive text-sm">
                    {lowStockCount} Low Stock Item{lowStockCount > 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-destructive" />
              </div>
            )}
            {expiringCount > 0 && (
              <div 
                onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
                className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center gap-3 touch-manipulation active:scale-[0.98] cursor-pointer"
              >
                <Clock className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium text-warning text-sm">
                    {expiringCount} Item{expiringCount > 1 ? "s" : ""} Expiring Soon
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-warning" />
              </div>
            )}
          </div>
        )}

        {/* Stats Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Pending"
            value={stats?.pendingPrescriptions || 0}
            icon={<ClipboardList className="h-5 w-5" />}
            onClick={() => navigate("/app/pharmacy/queue")}
          />
          <MobileStatsCard
            title="Dispensed"
            value={stats?.dispensedToday || 0}
            icon={<Pill className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Low Stock"
            value={stats?.lowStockItems || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            onClick={() => navigate("/app/pharmacy/inventory?filter=lowStock")}
          />
          <MobileStatsCard
            title="Expiring"
            value={stats?.expiringItems || 0}
            icon={<Clock className="h-5 w-5" />}
            onClick={() => navigate("/app/pharmacy/inventory?filter=expiring")}
          />
        </div>

        {/* Quick Actions - 3 columns */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<ClipboardList className="h-6 w-6" />}
              label="Dispense"
              onClick={() => handleQuickAction("queue")}
              variant="primary"
            />
            <QuickActionCard
              icon={<Package className="h-6 w-6" />}
              label="Inventory"
              onClick={() => handleQuickAction("inventory")}
            />
            <QuickActionCard
              icon={<Plus className="h-6 w-6" />}
              label="Add Stock"
              onClick={() => handleQuickAction("addStock")}
            />
          </div>
        </div>

        {/* Prescription Queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Prescription Queue ({queue.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              haptics.light();
              navigate("/app/pharmacy/queue");
            }}>
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pending prescriptions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.slice(0, 5).map((prescription) => (
                <div
                  key={prescription.id}
                  onClick={() => {
                    haptics.light();
                    navigate(`/app/pharmacy/dispense/${prescription.id}`);
                  }}
                  className="bg-card border rounded-xl p-4 touch-manipulation active:scale-[0.98] cursor-pointer transition-transform"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium truncate">
                      {prescription.patient?.first_name} {prescription.patient?.last_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {prescription.items_count || 0} items
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Rx #{prescription.prescription_number}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(prescription.created_at), "HH:mm")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
