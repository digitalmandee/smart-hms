import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  TestTube, 
  AlertTriangle, 
  Droplet, 
  CheckCircle2, 
  ClipboardList,
  Clock,
  ChevronRight
} from "lucide-react";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

interface MobileLabViewProps {
  profile: any;
  stats: {
    pendingOrders?: number;
    statOrders?: number;
    collectedToday?: number;
    completedToday?: number;
  } | undefined;
  recentOrders: any[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function MobileLabView({
  profile,
  stats,
  recentOrders,
  isLoading,
  onRefresh
}: MobileLabViewProps) {
  const navigate = useNavigate();
  const haptics = useHaptics();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Badge variant="destructive" className="animate-pulse text-xs">STAT</Badge>;
      case "urgent":
        return <Badge className="bg-warning text-warning-foreground text-xs">Urgent</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Routine</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ordered":
        return <Badge className="bg-info/10 text-info text-xs">Ordered</Badge>;
      case "collected":
        return <Badge className="bg-warning/10 text-warning text-xs">Collected</Badge>;
      case "processing":
        return <Badge className="bg-primary/10 text-primary text-xs">Processing</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success text-xs">Completed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleQuickAction = (action: string) => {
    haptics.light();
    switch (action) {
      case "queue":
        navigate("/app/lab/queue");
        break;
      case "results":
        navigate("/app/lab/orders");
        break;
      case "stat":
        navigate("/app/lab/queue?priority=stat");
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
            {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Lab Tech"}
          </h1>
        </div>

        {/* STAT Alert */}
        {stats && stats.statOrders && stats.statOrders > 0 && (
          <div 
            onClick={() => handleQuickAction("stat")}
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3 animate-pulse touch-manipulation active:scale-[0.98] cursor-pointer"
          >
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">
                {stats.statOrders} STAT Order{stats.statOrders > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground">
                Require immediate attention
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive" />
          </div>
        )}

        {/* Stats Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Pending"
            value={stats?.pendingOrders || 0}
            icon={<TestTube className="h-5 w-5" />}
            onClick={() => navigate("/app/lab/queue")}
          />
          <MobileStatsCard
            title="STAT Orders"
            value={stats?.statOrders || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            onClick={() => navigate("/app/lab/queue?priority=stat")}
          />
          <MobileStatsCard
            title="Collected"
            value={stats?.collectedToday || 0}
            icon={<Droplet className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Completed"
            value={stats?.completedToday || 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions - 3 columns */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<ClipboardList className="h-6 w-6" />}
              label="View Queue"
              onClick={() => handleQuickAction("queue")}
              variant="primary"
            />
            <QuickActionCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              label="Enter Results"
              onClick={() => handleQuickAction("results")}
            />
            <QuickActionCard
              icon={<AlertTriangle className="h-6 w-6" />}
              label="STAT Orders"
              onClick={() => handleQuickAction("stat")}
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Recent Orders ({recentOrders.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => {
              haptics.light();
              navigate("/app/lab/queue");
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
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No pending lab orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    haptics.light();
                    navigate(`/app/lab/orders/${order.id}`);
                  }}
                  className="bg-card border rounded-xl p-4 touch-manipulation active:scale-[0.98] cursor-pointer transition-transform"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium truncate">
                      {order.patient?.first_name} {order.patient?.last_name}
                    </span>
                    {getPriorityBadge(order.priority)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{order.order_number}</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.status)}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(order.created_at), "HH:mm")}
                      </span>
                    </div>
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
