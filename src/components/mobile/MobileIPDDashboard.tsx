import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Bed, 
  Users, 
  UserPlus, 
  LogOut,
  ClipboardList,
  Plus,
  ArrowRight,
  Wallet,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

interface IPDStats {
  totalWards: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  activeAdmissions: number;
  todayAdmissions: number;
  todayDischarges: number;
}

interface Admission {
  id: string;
  patient?: {
    first_name: string;
    last_name?: string;
  };
  bed?: { bed_number: string };
  expected_discharge_date?: string;
}

interface MobileIPDDashboardProps {
  stats?: IPDStats;
  pendingRounds: Admission[];
  pendingDischarges: Admission[];
  recentAdmissions: Admission[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function MobileIPDDashboard({
  stats,
  pendingRounds,
  pendingDischarges,
  recentAdmissions,
  isLoading,
  onRefresh,
}: MobileIPDDashboardProps) {
  const navigate = useNavigate();

  const handleCardTap = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  const quickNavItems = [
    { icon: Building2, label: "Wards", path: "/app/ipd/wards", color: "primary" },
    { icon: Bed, label: "Beds", path: "/app/ipd/beds", color: "info" },
    { icon: Users, label: "Admissions", path: "/app/ipd/admissions", color: "success" },
    { icon: ClipboardList, label: "Nursing", path: "/app/ipd/nursing", color: "warning" },
  ];

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="border-0 shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => { handleCardTap(); navigate("/app/ipd/wards"); }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Wards</span>
              </div>
              <p className="text-2xl font-bold">{stats?.totalWards || 0}</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => { handleCardTap(); navigate("/app/ipd/beds"); }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bed className="h-4 w-4 text-info" />
                <span className="text-xs text-muted-foreground">Beds</span>
              </div>
              <p className="text-2xl font-bold">
                {stats?.occupiedBeds || 0}/{stats?.totalBeds || 0}
              </p>
              <p className="text-xs text-muted-foreground">{stats?.availableBeds || 0} available</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 shadow-sm active:scale-[0.98] transition-transform"
            onClick={() => { handleCardTap(); navigate("/app/ipd/admissions"); }}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Admitted</span>
              </div>
              <p className="text-2xl font-bold">{stats?.activeAdmissions || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <p className="text-lg font-bold">
                +{stats?.todayAdmissions || 0} / -{stats?.todayDischarges || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation - 2x2 Grid */}
        <div className="grid grid-cols-4 gap-2">
          {quickNavItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-3 px-2"
              onClick={() => { handleCardTap(); navigate(item.path); }}
            >
              <div className={cn(
                "p-2 rounded-lg",
                item.color === "primary" && "bg-primary/10",
                item.color === "info" && "bg-info/10",
                item.color === "success" && "bg-success/10",
                item.color === "warning" && "bg-warning/10",
              )}>
                <item.icon className={cn(
                  "h-5 w-5",
                  item.color === "primary" && "text-primary",
                  item.color === "info" && "text-info",
                  item.color === "success" && "text-success",
                  item.color === "warning" && "text-warning",
                )} />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Pending Rounds */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">Pending Rounds</h3>
              </div>
              <Badge variant="outline">{pendingRounds.length}</Badge>
            </div>

            {pendingRounds.length > 0 ? (
              <div className="space-y-2">
                {pendingRounds.slice(0, 4).map((adm) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg active:bg-muted transition-colors"
                    onClick={() => { handleCardTap(); navigate(`/app/ipd/rounds/${adm.id}`); }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {adm.patient?.first_name} {adm.patient?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bed {adm.bed?.bed_number}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {pendingRounds.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary"
                    onClick={() => navigate("/app/ipd/rounds")}
                  >
                    View all {pendingRounds.length}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                All rounds completed ✓
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Discharges */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-warning/10">
                  <LogOut className="h-4 w-4 text-warning" />
                </div>
                <h3 className="font-medium">Pending Discharges</h3>
              </div>
              <Badge variant="outline" className="bg-warning/10 text-warning">
                {pendingDischarges.length}
              </Badge>
            </div>

            {pendingDischarges.length > 0 ? (
              <div className="space-y-2">
                {pendingDischarges.slice(0, 4).map((adm) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-2 bg-warning/5 rounded-lg active:bg-warning/10 transition-colors"
                    onClick={() => { handleCardTap(); navigate(`/app/ipd/discharge/${adm.id}`); }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {adm.patient?.first_name} {adm.patient?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expected: {adm.expected_discharge_date 
                          ? format(new Date(adm.expected_discharge_date), "dd MMM") 
                          : "N/A"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No pending discharges
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        {recentAdmissions.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-success/10">
                    <UserPlus className="h-4 w-4 text-success" />
                  </div>
                  <h3 className="font-medium">Recent Admissions</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-8 px-2"
                  onClick={() => navigate("/app/ipd/admissions")}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-2">
                {recentAdmissions.slice(0, 3).map((adm) => (
                  <div
                    key={adm.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg active:bg-muted transition-colors"
                    onClick={() => { handleCardTap(); navigate(`/app/ipd/admissions/${adm.id}`); }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {adm.patient?.first_name} {adm.patient?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bed {adm.bed?.bed_number}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAB for New Admission */}
        <Button
          className="fab bg-primary hover:bg-primary/90"
          onClick={() => navigate("/app/ipd/admissions/new")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PullToRefresh>
  );
}
