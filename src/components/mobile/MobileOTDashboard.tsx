import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Scissors, 
  Building2, 
  HeartPulse, 
  AlertTriangle,
  Plus,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useOTStats, useOTRooms, useTodaySurgeries, useSurgeries, useStartSurgery, useCompleteSurgery } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { useHaptics } from "@/hooks/useHaptics";
import { cn } from "@/lib/utils";

export function MobileOTDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const haptics = useHaptics();
  
  const { data: stats, isLoading: statsLoading, refetch } = useOTStats();
  const { data: rooms, isLoading: roomsLoading } = useOTRooms(profile?.branch_id || undefined);
  const { data: surgeries, isLoading: surgeriesLoading } = useTodaySurgeries(profile?.branch_id || undefined);
  
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

  const handleRefresh = async () => {
    haptics.light();
    await refetch();
    toast.success("Refreshed");
  };

  const handleStartSurgery = async (surgeryId: string) => {
    haptics.medium();
    try {
      await startSurgery.mutateAsync(surgeryId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCompleteSurgery = async (surgeryId: string) => {
    haptics.medium();
    try {
      await completeSurgery.mutateAsync(surgeryId);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Filter available rooms
  const availableRooms = rooms?.filter(r => r.status === 'available') || [];
  const occupiedRooms = rooms?.filter(r => r.status === 'occupied') || [];

  // Surgery status helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'scheduled': return 'bg-info text-info-foreground';
      case 'pre_op': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Operation Theatre</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </div>
          <Button size="icon" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : (
            <>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Scissors className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.todaySurgeries || 0}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-info/10 to-info/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-info/20">
                      <Building2 className="h-4 w-4 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.availableRooms || 0}/{stats?.totalRooms || 0}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-success/10 to-success/5">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-success/20">
                      <HeartPulse className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.pacuPatients || 0}</p>
                      <p className="text-xs text-muted-foreground">In PACU</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={cn(
                "bg-gradient-to-br",
                stats?.emergencyCases ? "from-destructive/10 to-destructive/5" : "from-muted/10 to-muted/5"
              )}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      stats?.emergencyCases ? "bg-destructive/20" : "bg-muted/20"
                    )}>
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        stats?.emergencyCases ? "text-destructive" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.emergencyCases || 0}</p>
                      <p className="text-xs text-muted-foreground">Emergency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          <Button 
            onClick={() => { haptics.light(); navigate("/app/ot/surgeries/new"); }} 
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { haptics.light(); navigate("/app/ot/schedule"); }}
            className="shrink-0"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { haptics.light(); navigate("/app/ot/pacu"); }}
            className="shrink-0"
          >
            <HeartPulse className="h-4 w-4 mr-2" />
            PACU
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { haptics.light(); navigate("/app/ot/rooms"); }}
            className="shrink-0"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Rooms
          </Button>
        </div>

        {/* OT Room Status - Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Room Status</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/app/ot/rooms")}
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {roomsLoading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-32 shrink-0 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {rooms?.slice(0, 6).map((room) => {
                const isAvailable = room.status === 'available';
                const isOccupied = room.status === 'occupied';
                return (
                  <Card 
                    key={room.id}
                    className={cn(
                      "shrink-0 w-32 cursor-pointer transition-all active:scale-95",
                      isAvailable && "border-success/50 bg-success/5",
                      isOccupied && "border-warning/50 bg-warning/5"
                    )}
                    onClick={() => { haptics.light(); navigate(`/app/ot/rooms/${room.id}`); }}
                  >
                    <CardContent className="p-3">
                      <p className="font-medium truncate">{room.name}</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "mt-1 text-xs",
                          isAvailable && "bg-success/10 text-success border-success/20",
                          isOccupied && "bg-warning/10 text-warning border-warning/20"
                        )}
                      >
                        {room.status === 'occupied' ? 'Occupied' : room.status}
                      </Badge>
                      {room.room_type && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {room.room_type}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Surgery Queue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Today's Surgeries</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/app/ot/surgeries")}
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          {surgeriesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : surgeries && surgeries.length > 0 ? (
            <div className="space-y-3">
              {surgeries.slice(0, 5).map((surgery) => (
                <Card 
                  key={surgery.id}
                  className="cursor-pointer transition-all active:scale-[0.99] hover:shadow-md"
                  onClick={() => { haptics.light(); navigate(`/app/ot/surgeries/${surgery.id}`); }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn("text-xs", getStatusColor(surgery.status))}>
                            {surgery.status.replace('_', ' ')}
                          </Badge>
                          {surgery.priority === 'emergency' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium truncate">{surgery.procedure_name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {surgery.patient?.first_name} {surgery.patient?.last_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                          {surgery.ot_room?.name && (
                            <>
                              <span>•</span>
                              <Building2 className="h-3 w-3" />
                              {surgery.ot_room.name}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        {surgery.status === 'scheduled' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleStartSurgery(surgery.id); }}
                          >
                            Start
                          </Button>
                        )}
                        {surgery.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={(e) => { e.stopPropagation(); handleCompleteSurgery(surgery.id); }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Scissors className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No surgeries scheduled for today</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => { haptics.light(); navigate("/app/ot/surgeries/new"); }}
                >
                  Schedule Surgery
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upcoming Surgeries */}
        {upcomingSurgeries && upcomingSurgeries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Upcoming</h2>
              <Badge variant="secondary">{upcomingSurgeries.length}</Badge>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {upcomingSurgeries.slice(0, 6).map((surgery) => {
                const isToday = surgery.scheduled_date === today;
                return (
                  <Card
                    key={surgery.id}
                    className="shrink-0 w-40 cursor-pointer transition-all active:scale-95"
                    onClick={() => { haptics.light(); navigate(`/app/ot/surgeries/${surgery.id}`); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
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
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* FAB for new surgery */}
        <Button
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
          onClick={() => { haptics.medium(); navigate("/app/ot/surgeries/new"); }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PullToRefresh>
  );
}