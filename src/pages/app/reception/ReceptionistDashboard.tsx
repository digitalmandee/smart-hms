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
import { SessionStatusBanner } from "@/components/billing/SessionStatusBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { data: dashboardData, isLoading: dashboardLoading } = useReceptionDashboard();
  const { data: patientStats, isLoading: statsLoading } = usePatientStats();
  const { data: recentPatients, isLoading: recentLoading } = useRecentPatients(5);

  const isLoading = dashboardLoading || statsLoading;
  const firstName = profile?.full_name?.split(" ")[0] || "Receptionist";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("reception.desk")}
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/appointments/calendar")}>
              <Calendar className="h-4 w-4 me-2" />
              {t("reception.schedule")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/ot/surgeries")}>
              <Scissors className="h-4 w-4 me-2" />
              {t("reception.allSurgeries")}
            </Button>
            <Button onClick={() => navigate("/app/patients/new")}>
              <UserPlus className="h-4 w-4 me-2" />
              {t("reception.newPatient")}
            </Button>
          </div>
        }
        quickStats={[
          { label: t("appointments.scheduled"), value: dashboardData?.statusCounts.scheduled || 0, variant: "warning" },
          { label: t("appointments.checkedIn"), value: dashboardData?.statusCounts.checked_in || 0, variant: "success" },
          { label: t("appointments.completed"), value: dashboardData?.statusCounts.completed || 0 },
        ]}
      />

      {/* Billing Session Status */}
      <SessionStatusBanner counterType="reception" />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title={t("reception.todaysAppointments")}
          value={isLoading ? "..." : dashboardData?.todaysAppointments.length || 0}
          icon={Calendar}
          description={t("common.today")}
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title={t("reception.registeredToday")}
          value={statsLoading ? "..." : patientStats?.today || 0}
          icon={UserPlus}
          description={t("common.newToday")}
          variant="success"
          delay={100}
        />
        <ModernStatsCard
          title={t("reception.registeredThisMonth")}
          value={statsLoading ? "..." : patientStats?.thisMonth || 0}
          icon={Users}
          description={t("common.today")}
          variant="info"
          delay={200}
        />
        <ModernStatsCard
          title={t("reception.waitingScheduled")}
          value={isLoading ? "..." : dashboardData?.statusCounts.scheduled || 0}
          icon={Clock}
          description={t("common.pending")}
          variant="warning"
          delay={300}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              {t("reception.todaysSchedule")}
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

        <PendingSurgeryRequestsCard maxItems={4} />
        <UpcomingSurgeriesCard maxItems={4} />

        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              {t("reception.upcomingNext")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <div className="space-y-2 p-4 pt-0">
                {dashboardLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-8">{t("common.loading")}</p>
                ) : dashboardData?.upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t("reception.noUpcomingAppts")}
                  </p>
                ) : (
                  dashboardData?.upcomingAppointments.map((appointment) => (
                    <UpcomingAppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{t("reception.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ReceptionQuickActions />
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/10">
              <UserPlus className="h-4 w-4 text-success" />
            </div>
            {t("reception.recentlyRegistered")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t("common.loading")}</p>
          ) : recentPatients?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("reception.noRegisteredToday")}
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
