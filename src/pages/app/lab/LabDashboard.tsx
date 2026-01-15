import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabDashboardStats, useRecentLabOrders } from "@/hooks/useLabDashboardStats";
import { 
  TestTube, 
  AlertTriangle, 
  Droplet, 
  CheckCircle2, 
  ClipboardList,
  ArrowRight,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default function LabDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useLabDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentLabOrders(5);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Badge variant="destructive">STAT</Badge>;
      case "urgent":
        return <Badge className="bg-orange-500 hover:bg-orange-600">Urgent</Badge>;
      default:
        return <Badge variant="secondary">Routine</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ordered":
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Ordered</Badge>;
      case "collected":
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Collected</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-purple-600 border-purple-300">Processing</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        description="Manage lab orders and results"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/lab/orders")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Enter Results
            </Button>
            <Button onClick={() => navigate("/app/lab/queue")}>
              <TestTube className="mr-2 h-4 w-4" />
              View Queue
            </Button>
          </div>
        }
      />

      {/* STAT Alert */}
      {stats && stats.statOrders > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">
              {stats.statOrders} STAT order{stats.statOrders > 1 ? "s" : ""} require immediate attention
            </p>
            <p className="text-sm text-muted-foreground">
              Process these high-priority orders first
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => navigate("/app/lab/queue?priority=stat")}
          >
            View STAT Orders
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Pending Orders"
              value={stats?.pendingOrders || 0}
              icon={TestTube}
              onClick={() => navigate("/app/lab/queue")}
            />
            <StatsCard
              title="STAT Orders"
              value={stats?.statOrders || 0}
              icon={AlertTriangle}
              className={stats?.statOrders ? "border-destructive/50 bg-destructive/5" : ""}
              onClick={() => navigate("/app/lab/queue?priority=stat")}
            />
            <StatsCard
              title="Collected Today"
              value={stats?.collectedToday || 0}
              icon={Droplet}
            />
            <StatsCard
              title="Completed Today"
              value={stats?.completedToday || 0}
              icon={CheckCircle2}
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => navigate("/app/lab/queue")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Lab Queue</h3>
              <p className="text-sm text-muted-foreground">View all pending orders</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => navigate("/app/lab/orders")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Enter Results</h3>
              <p className="text-sm text-muted-foreground">Record test results</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/lab/queue")}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending lab orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/lab/orders/${order.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {order.patient?.first_name} {order.patient?.last_name}
                      </span>
                      {getPriorityBadge(order.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{order.order_number}</span>
                      <span>•</span>
                      <span>{order.lab_order_items?.length || 0} test(s)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <div className="text-right text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {format(new Date(order.created_at), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
