import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TestTube, 
  AlertTriangle, 
  Droplet, 
  CheckCircle2, 
  ClipboardList,
  ArrowRight,
  Clock,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabDashboardStats, useRecentLabOrders, useLabTATTracker } from "@/hooks/useLabDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { MobileLabView } from "@/components/mobile/MobileLabView";
import { useTranslation } from "@/lib/i18n";

export default function LabDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useLabDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading, refetch: refetchOrders } = useRecentLabOrders(5);
  const { data: tatOrders } = useLabTATTracker(24);
  
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const firstName = profile?.full_name?.split(" ")[0] || "Lab Tech";
  
  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchStats(), refetchOrders()]);
  }, [refetchStats, refetchOrders]);

  // Mobile View
  if (showMobileUI) {
    return (
      <MobileLabView
        profile={profile}
        stats={stats}
        recentOrders={recentOrders || []}
        isLoading={ordersLoading}
        onRefresh={handleRefresh}
      />
    );
  }
  
  // Desktop View

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "stat":
        return <Badge variant="destructive" className="animate-pulse-soft">STAT</Badge>;
      case "urgent":
        return <Badge className="bg-warning text-warning-foreground">{t("lab.urgent")}</Badge>;
      default:
        return <Badge variant="secondary">{t("lab.routine")}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ordered":
        return <Badge className="bg-info/10 text-info border-info/20">{t("lab.ordered")}</Badge>;
      case "collected":
        return <Badge className="bg-warning/10 text-warning border-warning/20">{t("lab.collected")}</Badge>;
      case "processing":
        return <Badge className="bg-primary/10 text-primary border-primary/20">{t("lab.processing")}</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success border-success/20">{t("lab.completed")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTATColor = (hours: number, target: number) => {
    if (hours >= target) return "text-destructive";
    if (hours >= target * 0.75) return "text-warning";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("lab.dashboard")}
        subtitle={t("lab.subtitle")}
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/lab/orders")}>
              <ClipboardList className="mr-2 h-4 w-4" />
              {t("lab.enterResults")}
            </Button>
            <Button onClick={() => navigate("/app/lab/queue")}>
              <TestTube className="mr-2 h-4 w-4" />
              {t("lab.viewQueue")}
            </Button>
          </div>
        }
        quickStats={[
          { label: t("common.pending"), value: stats?.pendingOrders || 0, variant: "warning" },
          { label: "STAT", value: stats?.statOrders || 0, variant: "destructive" },
          { label: t("lab.completed"), value: stats?.completedToday || 0, variant: "success" },
        ]}
      />

      {/* STAT Alert */}
      {stats && stats.statOrders > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3 animate-pulse-soft">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">
              {stats.statOrders} {t("lab.statAlert")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("lab.processStatFirst")}
            </p>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => navigate("/app/lab/queue?priority=stat")}
          >
            {t("lab.viewStatOrders")}
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <ModernStatsCard
              title={t("lab.pendingOrders")}
              value={stats?.pendingOrders || 0}
              icon={TestTube}
              variant="warning"
              onClick={() => navigate("/app/lab/queue")}
              delay={0}
            />
            <ModernStatsCard
              title={t("lab.statOrders")}
              value={stats?.statOrders || 0}
              icon={AlertTriangle}
              variant="destructive"
              onClick={() => navigate("/app/lab/queue?priority=stat")}
              delay={100}
            />
            <ModernStatsCard
              title={t("lab.collectedToday")}
              value={stats?.collectedToday || 0}
              icon={Droplet}
              variant="info"
              delay={200}
            />
            <ModernStatsCard
              title={t("lab.completedToday")}
              value={stats?.completedToday || 0}
              icon={CheckCircle2}
              variant="success"
              delay={300}
            />
          </>
        )}
      </div>

      {/* TAT Tracker Widget */}
      {tatOrders && tatOrders.length > 0 && (
        <Card className="border-warning/50 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Timer className="h-4 w-4 text-warning" />
              </div>
              {t("lab.tatTracker" as any)} ({tatOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tatOrders.slice(0, 5).map((order, idx) => (
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
                    <span className="text-sm text-muted-foreground">
                      {order.order_number} • {order.tests_count} {t("lab.tests")}
                    </span>
                  </div>
                  <div className={`text-sm font-bold ${getTATColor(order.elapsed_hours, 24)}`}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {order.elapsed_hours}h
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/lab/queue")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t("lab.labQueue")}</h3>
              <p className="text-sm text-muted-foreground">{t("lab.viewAllPending")}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/lab/orders")}
        >
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{t("lab.enterResults")}</h3>
              <p className="text-sm text-muted-foreground">{t("lab.recordTestResults")}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <TestTube className="h-4 w-4 text-primary" />
            </div>
            {t("lab.recentOrders")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/lab/queue")}>
            {t("common.viewAll")}
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("lab.noPendingOrders")}</p>
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
                      <span>{order.lab_order_items?.length || 0} {t("lab.tests")}</span>
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
