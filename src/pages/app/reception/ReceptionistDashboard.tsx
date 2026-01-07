import { format } from "date-fns";
import { Calendar, UserPlus, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReceptionDashboard } from "@/hooks/useAppointments";
import { usePatientStats, useRecentPatients } from "@/hooks/usePatients";
import { TodayScheduleList } from "@/components/reception/TodayScheduleList";
import { UpcomingAppointmentCard } from "@/components/reception/UpcomingAppointmentCard";
import { ReceptionQuickActions } from "@/components/reception/ReceptionQuickActions";
import { RecentRegistrationCard } from "@/components/reception/RecentRegistrationCard";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading: dashboardLoading } = useReceptionDashboard();
  const { data: patientStats, isLoading: statsLoading } = usePatientStats();
  const { data: recentPatients, isLoading: recentLoading } = useRecentPatients(5);

  const isLoading = dashboardLoading || statsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reception Desk"
        description={`Today is ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/appointments/calendar")}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button onClick={() => navigate("/app/patients/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={isLoading ? "..." : dashboardData?.todaysAppointments.length || 0}
          icon={Calendar}
          description="Total scheduled for today"
        />
        <StatsCard
          title="Registered Today"
          value={statsLoading ? "..." : patientStats?.today || 0}
          icon={UserPlus}
          description="New patients today"
          variant="success"
        />
        <StatsCard
          title="Registered This Month"
          value={statsLoading ? "..." : patientStats?.thisMonth || 0}
          icon={Users}
          description="New patients this month"
          variant="info"
        />
        <StatsCard
          title="Waiting (Scheduled)"
          value={isLoading ? "..." : dashboardData?.statusCounts.scheduled || 0}
          icon={Clock}
          description="Yet to check in"
          variant="warning"
        />
      </div>

      {/* Main Content: 3-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1: Today's Schedule */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <TodayScheduleList 
                appointments={dashboardData?.todaysAppointments || []} 
                isLoading={dashboardLoading}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 2: Upcoming Appointments */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Upcoming (Next)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 p-4 pt-0">
                {dashboardLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
                ) : dashboardData?.upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No upcoming appointments
                  </p>
                ) : (
                  dashboardData?.upcomingAppointments.map((appointment) => (
                    <UpcomingAppointmentCard 
                      key={appointment.id} 
                      appointment={appointment} 
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 3: Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceptionQuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations Strip */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-500" />
            Recently Registered
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
          ) : recentPatients?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No patients registered today
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentPatients?.map((patient) => (
                <RecentRegistrationCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
