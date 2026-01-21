import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OTRoomBoard } from "@/components/ot/OTRoomBoard";
import { SurgeryQueueList } from "@/components/ot/SurgeryQueueList";
import { 
  Scissors, 
  Building2, 
  Clock, 
  HeartPulse, 
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { useOTStats, useOTRooms, useTodaySurgeries, useStartSurgery, useCompleteSurgery } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function OTDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: stats, isLoading: statsLoading, refetch } = useOTStats();
  const { data: rooms, isLoading: roomsLoading } = useOTRooms(profile?.branch_id || undefined);
  const { data: surgeries, isLoading: surgeriesLoading } = useTodaySurgeries(profile?.branch_id || undefined);

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
    </div>
  );
}
