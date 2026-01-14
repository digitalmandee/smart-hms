import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
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
  UserX,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Gift,
  FileText,
  Loader2,
  Stethoscope,
  Heart,
} from "lucide-react";
import { format } from "date-fns";

export default function HRDashboard() {
  const navigate = useNavigate();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Dashboard"
        description={`Overview for ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Employees"
          value={loadingEmployeeStats ? "-" : employeeStats?.total || 0}
          icon={Users}
          description="Active workforce"
        />
        <StatsCard
          title="Present Today"
          value={loadingAttendanceStats ? "-" : attendanceStats?.present || 0}
          icon={UserCheck}
          description={`${attendanceStats?.late || 0} late arrivals`}
          trend={attendanceStats?.present ? { value: Math.round((attendanceStats.present / (employeeStats?.active || 1)) * 100), isPositive: true } : undefined}
        />
        <StatsCard
          title="On Leave Today"
          value={loadingLeaveStats ? "-" : leaveStats?.onLeaveToday || 0}
          icon={Calendar}
          description={`${leaveStats?.pendingRequests || 0} pending requests`}
        />
        <StatsCard
          title="Payroll Status"
          value={loadingPayrollStats ? "-" : payrollStats?.currentPayrollStatus === "completed" ? "Done" : "Pending"}
          icon={DollarSign}
          description="This month"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/app/hr/doctors")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Doctors</p>
              <p className="text-sm text-muted-foreground">Manage physicians</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/app/hr/nurses")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium">Nurses</p>
              <p className="text-sm text-muted-foreground">Nursing staff</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/app/hr/attendance")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Attendance</p>
              <p className="text-sm text-muted-foreground">Track time</p>
            </div>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/app/hr/payroll")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Payroll</p>
              <p className="text-sm text-muted-foreground">Salary processing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Leave Requests */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Leave Requests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/hr/leaves/approvals")}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingPendingLeaves ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : pendingLeaves?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No pending leave requests</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today's Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAttendanceStats ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{attendanceStats?.present || 0}</p>
                    <p className="text-xs text-green-600">Present</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{attendanceStats?.absent || 0}</p>
                    <p className="text-xs text-red-600">Absent</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-700">{attendanceStats?.late || 0}</p>
                    <p className="text-xs text-yellow-600">Late</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{attendanceStats?.onLeave || 0}</p>
                    <p className="text-xs text-blue-600">On Leave</p>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate("/app/hr/attendance")}>
                View Attendance
              </Button>
            </CardContent>
          </Card>

          {/* Birthdays This Month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Birthdays This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmployeeStats ? (
                <Skeleton className="h-12 w-full" />
              ) : employeeStats?.birthdaysThisMonth === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No birthdays this month
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{employeeStats?.birthdaysThisMonth}</span>
                  <Badge variant="secondary">This month</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaveStats?.pendingRequests ? (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <span className="text-sm">{leaveStats.pendingRequests} pending leave requests</span>
                  <Badge variant="outline" className="bg-yellow-100">Action</Badge>
                </div>
              ) : null}
              {payrollStats?.pendingLoanApprovals ? (
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <span className="text-sm">{payrollStats.pendingLoanApprovals} loan approvals pending</span>
                  <Badge variant="outline" className="bg-orange-100">Action</Badge>
                </div>
              ) : null}
              {expiringLicenses && expiringLicenses.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm">{expiringLicenses.length} licenses expiring soon</span>
                  <Badge variant="outline" className="bg-red-100">Urgent</Badge>
                </div>
              )}
              {!leaveStats?.pendingRequests && !payrollStats?.pendingLoanApprovals && (!expiringLicenses || expiringLicenses.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending alerts
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* License Expiry Alerts Widget */}
      <LicenseExpiryAlerts daysAhead={90} limit={5} />

      {/* Recent Employees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Employees</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/hr/employees")}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {loadingRecentEmployees ? (
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : recentEmployees?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No employees found</p>
              <Button className="mt-4" onClick={() => navigate("/app/hr/employees/new")}>
                Add First Employee
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentEmployees?.slice(0, 6).map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  compact
                  onClick={() => navigate(`/app/hr/employees/${employee.id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
