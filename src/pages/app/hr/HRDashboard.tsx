import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeCard } from "@/components/hr/EmployeeCard";
import { LeaveRequestCard } from "@/components/hr/LeaveRequestCard";
import { LicenseExpiryAlerts } from "@/components/hr/LicenseExpiryAlerts";
import { useEmployees, useEmployeeStats } from "@/hooks/useHR";
import { useAttendanceStats } from "@/hooks/useAttendance";
import { usePendingLeaveRequests, useLeaveStats, useApproveLeaveRequest } from "@/hooks/useLeaves";
import { usePayrollStats } from "@/hooks/usePayroll";
import { useExpiringLicenses } from "@/hooks/useEmployeeDocuments";
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Gift,
  FileText,
  Stethoscope,
  Heart,
  Building2,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

export default function HRDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: employeeStats, isLoading: loadingEmployeeStats } = useEmployeeStats();
  const { data: attendanceStats, isLoading: loadingAttendanceStats } = useAttendanceStats(today);
  const { data: leaveStats, isLoading: loadingLeaveStats } = useLeaveStats();
  const { data: payrollStats, isLoading: loadingPayrollStats } = usePayrollStats();
  const { data: pendingLeaves, isLoading: loadingPendingLeaves } = usePendingLeaveRequests();
  const { data: recentEmployees, isLoading: loadingRecentEmployees } = useEmployees();
  const { data: expiringLicenses } = useExpiringLicenses(90);
  const approveLeave = useApproveLeaveRequest();

  const handleApproveLeave = async (id: string) => {
    await approveLeave.mutateAsync({ id, approved: true });
  };

  const handleRejectLeave = async (id: string) => {
    await approveLeave.mutateAsync({ id, approved: false });
  };

  const quickAccessItems = [
    { title: t("hr.doctors"), subtitle: t("hr.managePhysicians"), icon: Stethoscope, color: "bg-blue-100 text-blue-600", path: "/app/hr/doctors" },
    { title: t("hr.nurses"), subtitle: t("hr.nursingStaff"), icon: Heart, color: "bg-pink-100 text-pink-600", path: "/app/hr/nurses" },
    { title: t("nav.attendance"), subtitle: t("hr.attendanceSubtitle"), icon: Clock, color: "bg-green-100 text-green-600", path: "/app/hr/attendance" },
    { title: t("nav.payroll"), subtitle: t("hr.payrollSubtitle"), icon: DollarSign, color: "bg-purple-100 text-purple-600", path: "/app/hr/payroll" },
  ];

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("hr.dashboard")}
        subtitle={`Overview for ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
        icon={Building2}
        iconColor="text-primary"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ModernStatsCard
          title={t("hr.totalEmployees")}
          value={employeeStats?.total || 0}
          change={t("hr.activeWorkforce")}
          icon={Users}
          variant="primary"
          loading={loadingEmployeeStats}
          onClick={() => navigate("/app/hr/employees")}
        />
        <ModernStatsCard
          title={t("hr.presentToday")}
          value={attendanceStats?.present || 0}
          change={`${attendanceStats?.late || 0} ${t("hr.lateArrivals")}`}
          icon={UserCheck}
          variant="success"
          loading={loadingAttendanceStats}
          onClick={() => navigate("/app/hr/attendance")}
        />
        <ModernStatsCard
          title={t("hr.onLeaveToday")}
          value={leaveStats?.onLeaveToday || 0}
          change={`${leaveStats?.pendingRequests || 0} ${t("hr.pendingRequests")}`}
          icon={Calendar}
          variant="warning"
          loading={loadingLeaveStats}
          onClick={() => navigate("/app/hr/leaves")}
        />
        <ModernStatsCard
          title={t("hr.payrollStatus")}
          value={payrollStats?.currentPayrollStatus === "completed" ? t("hr.done") : t("common.pending")}
          change={t("hr.thisMonth")}
          icon={DollarSign}
          variant={payrollStats?.currentPayrollStatus === "completed" ? "success" : "info"}
          loading={loadingPayrollStats}
          onClick={() => navigate("/app/hr/payroll")}
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessItems.map((item, idx) => (
          <Card 
            key={item.title}
            className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => navigate(item.path)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <Card className="lg:col-span-2 shadow-soft overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-warning/5 to-transparent">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <FileText className="h-4 w-4 text-warning" />
              </div>
              {t("hr.pendingLeaveRequests")}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/hr/leaves/requests")}>
              {t("common.viewAll")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {loadingPendingLeaves ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : pendingLeaves?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <FileText className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">{t("hr.noPendingRequests")}</p>
                <p className="text-sm">{t("hr.allRequestsProcessed")}</p>
              </div>
            ) : (
              pendingLeaves?.slice(0, 3).map((request) => (
                <LeaveRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => handleApproveLeave(request.id)}
                  onReject={() => handleRejectLeave(request.id)}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Stats & Alerts */}
        <div className="space-y-6">
          {/* Today's Attendance Summary */}
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-success/5 to-transparent">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/10">
                  <Clock className="h-4 w-4 text-success" />
                </div>
                {t("hr.todaysAttendance")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {loadingAttendanceStats ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-success/10 rounded-xl text-center border border-success/20">
                    <p className="text-2xl font-bold text-success">{attendanceStats?.present || 0}</p>
                    <p className="text-xs text-success/80 font-medium">{t("hr.present")}</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-xl text-center border border-destructive/20">
                    <p className="text-2xl font-bold text-destructive">{attendanceStats?.absent || 0}</p>
                    <p className="text-xs text-destructive/80 font-medium">{t("hr.absent")}</p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-xl text-center border border-warning/20">
                    <p className="text-2xl font-bold text-warning">{attendanceStats?.late || 0}</p>
                    <p className="text-xs text-warning/80 font-medium">{t("hr.late")}</p>
                  </div>
                  <div className="p-3 bg-info/10 rounded-xl text-center border border-info/20">
                    <p className="text-2xl font-bold text-info">{attendanceStats?.onLeave || 0}</p>
                    <p className="text-xs text-info/80 font-medium">{t("hr.onLeave")}</p>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate("/app/hr/attendance")}>
                {t("hr.viewAttendance")}
              </Button>
            </CardContent>
          </Card>

          {/* Birthdays This Month */}
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Gift className="h-4 w-4 text-accent" />
                </div>
                {t("hr.birthdaysThisMonth")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingEmployeeStats ? (
                <Skeleton className="h-12 w-full" />
              ) : employeeStats?.birthdaysThisMonth === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("hr.noBirthdays")}
                </p>
              ) : (
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <span className="text-3xl font-bold text-accent">{employeeStats?.birthdaysThisMonth}</span>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">{t("hr.thisMonth")}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-destructive/5 to-transparent">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
                {t("hr.alerts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              {leaveStats?.pendingRequests ? (
                <div className="flex items-center justify-between p-3 bg-warning/5 rounded-xl border border-warning/20">
                  <span className="text-sm font-medium">{leaveStats.pendingRequests} {t("hr.pendingLeaveAlerts")}</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("hr.action")}</Badge>
                </div>
              ) : null}
              {payrollStats?.pendingLoanApprovals ? (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <span className="text-sm font-medium">{payrollStats.pendingLoanApprovals} {t("hr.loanApprovalsPending")}</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">{t("hr.action")}</Badge>
                </div>
              ) : null}
              {expiringLicenses && expiringLicenses.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-xl border border-destructive/20">
                  <span className="text-sm font-medium">{expiringLicenses.length} {t("hr.licensesExpiringSoon")}</span>
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">{t("hr.urgent")}</Badge>
                </div>
              )}
              {!leaveStats?.pendingRequests && !payrollStats?.pendingLoanApprovals && (!expiringLicenses || expiringLicenses.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">{t("hr.noPendingAlerts")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* License Expiry Alerts Widget */}
      <LicenseExpiryAlerts daysAhead={90} limit={5} />

      {/* Recent Employees */}
      <Card className="shadow-soft overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            {t("hr.recentEmployees")}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/hr/employees")}>
            {t("common.viewAll")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingRecentEmployees ? (
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : recentEmployees?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                <Users className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">{t("hr.noEmployeesFound")}</p>
              <Button className="mt-4" onClick={() => navigate("/app/hr/employees/new")}>
                {t("hr.addFirstEmployee")}
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentEmployees?.slice(0, 6).map((employee, idx) => (
                <div key={employee.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <EmployeeCard
                    employee={employee}
                    compact
                    onClick={() => navigate(`/app/hr/employees/${employee.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
