import { Calendar, UserPlus, Clock, Users, Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useReceptionDashboard } from "@/hooks/useAppointments";
import { usePatientStats, useRecentPatients } from "@/hooks/usePatients";
import { TodayScheduleList } from "@/components/reception/TodayScheduleList";
import { UpcomingAppointmentCard } from "@/components/reception/UpcomingAppointmentCard";
import { ReceptionQuickActions } from "@/components/reception/ReceptionQuickActions";
import { RecentRegistrationCard } from "@/components/reception/RecentRegistrationCard";
import { PendingSurgeryRequestsCard } from "@/components/reception/PendingSurgeryRequestsCard";
import { UpcomingSurgeriesCard } from "@/components/reception/UpcomingSurgeriesCard";
import { useAuth } from "@/contexts/AuthContext";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: dashboardData, isLoading: dashboardLoading } = useReceptionDashboard();
  const { data: patientStats, isLoading: statsLoading } = usePatientStats();
  const { data: recentPatients, isLoading: recentLoading } = useRecentPatients(5);

  const isLoading = dashboardLoading || statsLoading;
  const firstName = profile?.full_name?.split(" ")[0] || "Receptionist";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Reception Desk"
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/appointments/calendar")}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/ot/surgeries")}>
              <Scissors className="h-4 w-4 mr-2" />
              All Surgeries
            </Button>
            <Button onClick={() => navigate("/app/patients/new")}>
              <UserPlus className="h-4 w-4 mr-2" />
              New Patient
            </Button>
          </div>
        }
        quickStats={[
          { label: "Scheduled", value: dashboardData?.statusCounts.scheduled || 0, variant: "warning" },
          { label: "Checked In", value: dashboardData?.statusCounts.checked_in || 0, variant: "success" },
          { label: "Completed", value: dashboardData?.statusCounts.completed || 0 },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Today's Appointments"
          value={isLoading ? "..." : dashboardData?.todaysAppointments.length || 0}
          icon={Calendar}
          description="Total scheduled for today"
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title="Registered Today"
          value={statsLoading ? "..." : patientStats?.today || 0}
          icon={UserPlus}
          description="New patients today"
          variant="success"
          delay={100}
        />
        <ModernStatsCard
          title="Registered This Month"
          value={statsLoading ? "..." : patientStats?.thisMonth || 0}
          icon={Users}
          description="New patients this month"
          variant="info"
          delay={200}
        />
        <ModernStatsCard
          title="Waiting (Scheduled)"
          value={isLoading ? "..." : dashboardData?.statusCounts.scheduled || 0}
          icon={Clock}
          description="Yet to check in"
          variant="warning"
          delay={300}
        />
      </div>

      {/* Main Content: 2x2 Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <TodayScheduleList 
                appointments={dashboardData?.todaysAppointments || []} 
                isLoading={dashboardLoading}
              />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Surgery Requests */}
        <PendingSurgeryRequestsCard maxItems={4} />

        {/* Upcoming Scheduled Surgeries */}
        <UpcomingSurgeriesCard maxItems={4} />

        {/* Upcoming Appointments */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              Upcoming (Next)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
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

        {/* Quick Actions */}
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceptionQuickActions />
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations Strip */}
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <UserPlus className="h-4 w-4 text-success" />
            </div>
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
