import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OTRoomBoard } from "@/components/ot/OTRoomBoard";
import { SurgeryQueueList } from "@/components/ot/SurgeryQueueList";
import { PendingConfirmationsCard } from "@/components/ot/PendingConfirmationsCard";
import { MobileOTDashboard } from "@/components/mobile/MobileOTDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { 
  Scissors, 
  Building2, 
  Clock, 
  HeartPulse, 
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  User
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useOTStats, useOTRooms, useTodaySurgeries, useSurgeries, useStartSurgery, useCompleteSurgery } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OTDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  
  const { data: stats, isLoading: statsLoading, refetch } = useOTStats();
  const { data: rooms, isLoading: roomsLoading } = useOTRooms(profile?.branch_id || undefined);
  const { data: surgeries, isLoading: surgeriesLoading } = useTodaySurgeries(profile?.branch_id || undefined);
  
  // Fetch upcoming surgeries (next 30 days)
  const today = format(new Date(), 'yyyy-MM-dd');
  const futureDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
  const { data: upcomingSurgeries } = useSurgeries({
    dateFrom: today,
    dateTo: futureDate,
    branchId: profile?.branch_id || undefined,
    status: ['scheduled', 'pre_op'],
  });

  const startSurgery = useStartSurgery();
  const completeSurgery = useCompleteSurgery();
  const firstName = profile?.full_name?.split(" ")[0] || "Doctor";

  const handleStartSurgery = async (surgeryId: string) => {
    try {
      await startSurgery.mutateAsync(surgeryId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCompleteSurgery = async (surgeryId: string) => {
    try {
      await completeSurgery.mutateAsync(surgeryId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };
  // Show mobile UI on mobile devices
  if (showMobileUI) {
    return <MobileOTDashboard />;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Operation Theatre"
        subtitle="Manage surgical scheduling, OT rooms, and post-op recovery"
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/app/ot/surgeries/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Surgery
            </Button>
          </div>
        }
        quickStats={[
          { label: "In Progress", value: stats?.inProgress || 0, variant: "warning" },
          { label: "Completed", value: stats?.completed || 0, variant: "success" },
          { label: "Emergency", value: stats?.emergencyCases || 0, variant: "destructive" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <ModernStatsCard
              title="Today's Surgeries"
              value={stats?.todaySurgeries || 0}
              icon={Scissors}
              description={`${stats?.inProgress || 0} in progress`}
              variant="primary"
              delay={0}
            />
            <ModernStatsCard
              title="Available Rooms"
              value={`${stats?.availableRooms || 0}/${stats?.totalRooms || 0}`}
              icon={Building2}
              description="OT rooms ready"
              variant="info"
              delay={100}
            />
            <ModernStatsCard
              title="In PACU"
              value={stats?.pacuPatients || 0}
              icon={HeartPulse}
              description="Recovering patients"
              variant="success"
              delay={200}
            />
            <ModernStatsCard
              title="Emergency Cases"
              value={stats?.emergencyCases || 0}
              icon={AlertTriangle}
              description="Today"
              variant={stats?.emergencyCases ? "destructive" : "default"}
              delay={300}
            />
          </>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/ot/schedule")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.scheduledThisWeek || 0}</p>
              <p className="text-sm text-muted-foreground">Scheduled this week</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/ot/surgeries")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning to-warning/80 text-warning-foreground shadow-lg shadow-warning/30 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
              <p className="text-sm text-muted-foreground">Currently in progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group" 
          onClick={() => navigate("/app/ot/pacu")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.completed || 0}</p>
              <p className="text-sm text-muted-foreground">Completed today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Surgery Confirmations for Surgeons */}
      <PendingConfirmationsCard userRole="surgeon" />

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* OT Room Status */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  OT Room Status
                </CardTitle>
                <CardDescription>Current status of all operating rooms</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/app/ot/rooms")}>
                Manage Rooms
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OTRoomBoard
              rooms={rooms || []}
              surgeries={surgeries || []}
              isLoading={roomsLoading}
              onManageRoom={(room) => navigate(`/app/ot/rooms/${room.id}`)}
            />
          </CardContent>
        </Card>

        {/* Today's Surgery Queue */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Scissors className="h-4 w-4 text-warning" />
                  </div>
                  Today's Surgeries
                </CardTitle>
                <CardDescription>Surgery queue for today</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/app/ot/schedule")}>
                Full Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SurgeryQueueList
              surgeries={surgeries || []}
              isLoading={surgeriesLoading}
              onStartSurgery={handleStartSurgery}
              onCompleteSurgery={handleCompleteSurgery}
              compact
              emptyMessage="No surgeries scheduled for today"
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Surgeries (Next 7 Days) */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-info/10">
                  <Calendar className="h-4 w-4 text-info" />
                </div>
                Upcoming Surgeries
                {upcomingSurgeries && upcomingSurgeries.length > 0 && (
                  <Badge variant="secondary">{upcomingSurgeries.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Scheduled for the next 30 days</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/app/ot/schedule")}>
              View Schedule
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!upcomingSurgeries || upcomingSurgeries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3" />
              <p>No upcoming surgeries scheduled</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => navigate("/app/ot/surgeries/new")}
              >
                Schedule Surgery
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSurgeries.slice(0, 6).map((surgery) => {
                  const isToday = surgery.scheduled_date === today;
                  return (
                    <div
                      key={surgery.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={isToday ? "default" : "outline"} className="text-xs">
                          {isToday ? "Today" : format(new Date(surgery.scheduled_date), "MMM d")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate">{surgery.procedure_name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        {surgery.patient?.first_name} {surgery.patient?.last_name}
                      </div>
                      {surgery.ot_room?.name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Room: {surgery.ot_room.name}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {upcomingSurgeries.length > 6 && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  +{upcomingSurgeries.length - 6} more surgeries
                </p>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
