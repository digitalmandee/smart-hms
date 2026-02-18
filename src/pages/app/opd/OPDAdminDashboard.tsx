import { useNavigate } from "react-router-dom";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserCheck, Clock, IndianRupee, ArrowRight, 
  Stethoscope, ClipboardList, History, UserPlus
} from "lucide-react";
import { useOPDDashboardStats } from "@/hooks/useOPDDashboardStats";
import { useOPDDepartmentStats } from "@/hooks/useOPDDepartmentStats";
import { useAuth } from "@/contexts/AuthContext";
import { canViewFinancials } from "@/lib/permissions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

export default function OPDAdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { data: stats, isLoading } = useOPDDashboardStats();
  const { data: deptStats, isLoading: deptLoading } = useOPDDepartmentStats("today");
  
  const roles = (profile as any)?.roles || [];
  const showFinancials = canViewFinancials(roles);
  const firstName = profile?.full_name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("opd.dashboard")}
        subtitle={t("opd.subtitle")}
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/opd/history")}>
              <History className="h-4 w-4 mr-2" />
              {t("opd.history")}
            </Button>
            <Button onClick={() => navigate("/app/opd/walk-in")}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("opd.walkIn")}
            </Button>
          </div>
        }
        quickStats={[
          { label: t("opd.patients"), value: stats?.totalPatients || 0 },
          { label: t("opd.completed"), value: stats?.completedConsultations || 0, variant: "success" },
          { label: t("opd.inQueue"), value: stats?.inQueue || 0, variant: "warning" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title={t("opd.totalPatients")}
          value={stats?.totalPatients || 0}
          icon={Users}
          description={t("opd.today")}
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title={t("opd.completed")}
          value={stats?.completedConsultations || 0}
          icon={UserCheck}
          description={t("opd.consultationsDone")}
          variant="success"
          delay={100}
        />
        <ModernStatsCard
          title={t("opd.inQueue")}
          value={stats?.inQueue || 0}
          icon={Clock}
          description={t("opd.waitingInProgress")}
          variant="warning"
          delay={200}
        />
        {showFinancials && (
          <ModernStatsCard
            title={t("opd.revenueToday")}
            value={`₨ ${(stats?.revenueToday || 0).toLocaleString()}`}
            icon={IndianRupee}
            description={t("opd.collections")}
            variant="info"
            delay={300}
          />
        )}
      </div>

      {/* Department Breakdown & Hourly Flow */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Department-wise Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {t("opd.departmentBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deptLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : deptStats?.departments && deptStats.departments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("opd.department")}</TableHead>
                    <TableHead className="text-center">{t("opd.patients")}</TableHead>
                    <TableHead className="text-center">{t("opd.completed")}</TableHead>
                    {showFinancials && <TableHead className="text-right">{t("opd.revenue")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptStats.departments.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color || "hsl(var(--primary))" }} />
                          {dept.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{dept.patientCount}</TableCell>
                      <TableCell className="text-center">{dept.completedCount}</TableCell>
                      {showFinancials && <TableCell className="text-right">₨ {Math.round(dept.revenue).toLocaleString()}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("opd.noDeptData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Hourly Patient Flow Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {t("opd.hourlyFlow")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : stats?.hourlyFlow && stats.hourlyFlow.some(h => h.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.hourlyFlow}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip labelFormatter={(h) => `${h}:00 - ${Number(h)+1}:00`} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t("opd.patients")} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("opd.noFlowData")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Doctor Performance & Revenue */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Doctor Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {t("opd.doctorPerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : stats?.doctorPerformance && stats.doctorPerformance.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("opd.doctor")}</TableHead>
                    <TableHead className="text-center">{t("opd.patients")}</TableHead>
                    {showFinancials && <TableHead className="text-right">{t("opd.revenue")}</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.doctorPerformance.slice(0, 8).map((doc, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{doc.doctorName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{doc.patientsSeen}</Badge>
                      </TableCell>
                      {showFinancials && <TableCell className="text-right">₨ {Math.round(doc.revenue).toLocaleString()}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("opd.noDoctorData")}</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown (finance roles only) */}
        {showFinancials && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                {t("opd.revenueBreakdown")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[150px] w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <span className="text-sm font-medium">{t("opd.paid")}</span>
                    <span className="text-lg font-bold text-success">₨ {(stats?.revenueBreakdown?.paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <span className="text-sm font-medium">{t("opd.pending")}</span>
                    <span className="text-lg font-bold text-warning">₨ {(stats?.revenueBreakdown?.pending || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="text-sm font-medium">{t("opd.cancelled")}</span>
                    <span className="text-lg font-bold text-destructive">₨ {(stats?.revenueBreakdown?.waived || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t("opd.walkIn"), icon: UserPlus, path: "/app/opd/walk-in", color: "from-primary to-primary/80" },
          { label: t("opd.pendingCheckout"), icon: ClipboardList, path: "/app/opd/pending-checkout", color: "from-warning to-warning/80" },
          { label: t("opd.opdReports"), icon: ClipboardList, path: "/app/opd/reports", color: "from-info to-info/80" },
          { label: t("opd.history"), icon: History, path: "/app/opd/history", color: "from-success to-success/80" },
        ].map(item => (
          <Card 
            key={item.path}
            className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} text-primary-foreground shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="font-medium">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            {t("opd.recentConsultations")}
          </CardTitle>
          <Button variant="link" onClick={() => navigate("/app/opd/history")}>
            {t("common.viewAll")} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : stats?.recentConsultations && stats.recentConsultations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("opd.patient")}</TableHead>
                  <TableHead>{t("opd.doctor")}</TableHead>
                  <TableHead>{t("opd.status")}</TableHead>
                  <TableHead>{t("opd.time")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentConsultations.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.appointments?.patients?.first_name} {c.appointments?.patients?.last_name}
                    </TableCell>
                    <TableCell>{c.doctor?.profiles?.full_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "completed" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(c.created_at), "hh:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">{t("opd.noConsultations")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
