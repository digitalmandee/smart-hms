import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  User,
  Activity,
  Stethoscope,
  type LucideIcon
} from "lucide-react";
import { format } from "date-fns";
import { useTodaySurgeries, type Surgery } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";

export default function AnesthesiaDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: todaySurgeries, isLoading } = useTodaySurgeries(profile?.branch_id);

  // Filter surgeries where current user is the anesthetist (via team_members)
  const mySurgeries = todaySurgeries?.filter(s => 
    s.team_members?.some(m => 
      m.role === 'anesthetist' && m.doctor_id === profile?.id
    )
  ) || [];

  // Surgeries pending pre-op assessment (no pre_op_assessment exists)
  const pendingAssessments = todaySurgeries?.filter(s => 
    s.status === 'scheduled' && !s.pre_op_assessment
  ) || [];

  // Currently in surgery (for PACU handover tracking)
  const inProgress = todaySurgeries?.filter(s => s.status === 'in_progress') || [];

  // Completed today
  const completedToday = todaySurgeries?.filter(s => s.status === 'completed') || [];

  const stats: Array<{
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
    onClick?: () => void;
  }> = [
    {
      title: "Today's Cases",
      value: mySurgeries.length,
      icon: Calendar,
      description: "Assigned surgeries",
    },
    {
      title: "Pending Assessments",
      value: pendingAssessments.length,
      icon: Stethoscope,
      description: "Pre-anesthesia review needed",
      onClick: () => navigate("/app/ot/schedule"),
    },
    {
      title: "In Progress",
      value: inProgress.length,
      icon: Activity,
      description: "Currently in OT",
    },
    {
      title: "Completed",
      value: completedToday.length,
      icon: CheckCircle2,
      description: "Finished today",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Anesthesia Dashboard"
        subtitle="Today's surgical cases and pre-anesthesia workflow"
        actions={
          <Button onClick={() => navigate("/app/ot/schedule")}>
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <ModernStatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            onClick={stat.onClick}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Pre-Anesthesia Assessments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending Pre-Anesthesia Assessments
            </CardTitle>
            <CardDescription>
              Cases needing pre-anesthesia evaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAssessments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p>All assessments complete!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAssessments.slice(0, 5).map(surgery => (
                  <div 
                    key={surgery.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/app/ot/surgeries/${surgery.id}/pre-anesthesia`)}
                  >
                    <div>
                      <p className="font-medium">{surgery.procedure_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {surgery.patient?.first_name} {surgery.patient?.last_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {surgery.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Surgery Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Surgery Queue
            </CardTitle>
            <CardDescription>
              All scheduled surgeries for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySurgeries?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3" />
                <p>No surgeries scheduled today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySurgeries?.slice(0, 5).map(surgery => (
                  <div 
                    key={surgery.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/app/ot/surgeries/${surgery.id}`)}
                  >
                    <div>
                      <p className="font-medium">{surgery.procedure_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {surgery.patient?.first_name} {surgery.patient?.last_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        surgery.status === 'completed' ? 'default' :
                        surgery.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {surgery.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(`2000-01-01T${surgery.scheduled_start_time}`), 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
