import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
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
      <div className="flex items-center justify-between">
        <PageHeader
          title="Operation Theatre"
          description="Manage surgical scheduling, OT rooms, and post-op recovery"
        />
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
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map(i => (
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
              title="Today's Surgeries"
              value={stats?.todaySurgeries || 0}
              icon={Scissors}
              description={`${stats?.inProgress || 0} in progress`}
            />
            <StatsCard
              title="Available Rooms"
              value={`${stats?.availableRooms || 0}/${stats?.totalRooms || 0}`}
              icon={Building2}
              description="OT rooms ready"
            />
            <StatsCard
              title="In PACU"
              value={stats?.pacuPatients || 0}
              icon={HeartPulse}
              description="Recovering patients"
            />
            <StatsCard
              title="Emergency Cases"
              value={stats?.emergencyCases || 0}
              icon={AlertTriangle}
              description="Today"
              className={stats?.emergencyCases ? "border-red-200 bg-red-50" : ""}
            />
          </>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/app/ot/schedule")}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.scheduledThisWeek || 0}</p>
              <p className="text-sm text-muted-foreground">Scheduled this week</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/app/ot/surgeries")}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.inProgress || 0}</p>
              <p className="text-sm text-muted-foreground">Currently in progress</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/app/ot/pacu")}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>OT Room Status</CardTitle>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Surgeries</CardTitle>
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
