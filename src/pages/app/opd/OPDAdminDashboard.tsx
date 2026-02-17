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

export default function OPDAdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading } = useOPDDashboardStats();
  const { data: deptStats, isLoading: deptLoading } = useOPDDepartmentStats("today");
  
  const roles = (profile as any)?.roles || [];
  const showFinancials = canViewFinancials(roles);
  const firstName = profile?.full_name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="OPD Dashboard"
        subtitle="Today's outpatient department overview"
        userName={firstName}
        showGreeting
        variant="gradient"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/opd/history")}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button onClick={() => navigate("/app/opd/walk-in")}>
              <UserPlus className="h-4 w-4 mr-2" />
              Walk-in
            </Button>
          </div>
        }
        quickStats={[
          { label: "Patients", value: stats?.totalPatients || 0 },
          { label: "Completed", value: stats?.completedConsultations || 0, variant: "success" },
          { label: "In Queue", value: stats?.inQueue || 0, variant: "warning" },
        ]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatsCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={Users}
          description="Today"
          variant="primary"
          delay={0}
        />
        <ModernStatsCard
          title="Completed"
          value={stats?.completedConsultations || 0}
          icon={UserCheck}
          description="Consultations done"
          variant="success"
          delay={100}
        />
        <ModernStatsCard
          title="In Queue"
          value={stats?.inQueue || 0}
          icon={Clock}
          description="Waiting / In progress"
          variant="warning"
          delay={200}
        />
        {showFinancials && (
          <ModernStatsCard
            title="Revenue Today"
            value={`₨ ${(stats?.revenueToday || 0).toLocaleString()}`}
            icon={IndianRupee}
            description="Collections"
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
              Department-wise Breakdown
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
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Patients</TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    {showFinancials && <TableHead className="text-right">Revenue</TableHead>}
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
              <p className="text-sm text-muted-foreground text-center py-4">No department data for today</p>
            )}
          </CardContent>
        </Card>

        {/* Hourly Patient Flow Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Hourly Patient Flow
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No patient flow data yet</p>
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
              Doctor Performance
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
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-center">Patients</TableHead>
                    {showFinancials && <TableHead className="text-right">Revenue</TableHead>}
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
              <p className="text-sm text-muted-foreground text-center py-4">No doctor data for today</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown (finance roles only) */}
        {showFinancials && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-primary" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[150px] w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <span className="text-sm font-medium">Paid</span>
                    <span className="text-lg font-bold text-success">₨ {(stats?.revenueBreakdown?.paid || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-lg font-bold text-warning">₨ {(stats?.revenueBreakdown?.pending || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span className="text-sm font-medium">Cancelled/Waived</span>
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
          { label: "Walk-in", icon: UserPlus, path: "/app/opd/walk-in", color: "from-primary to-primary/80" },
          { label: "Pending Checkout", icon: ClipboardList, path: "/app/opd/pending-checkout", color: "from-warning to-warning/80" },
          { label: "OPD Reports", icon: ClipboardList, path: "/app/opd/reports", color: "from-info to-info/80" },
          { label: "History", icon: History, path: "/app/opd/history", color: "from-success to-success/80" },
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
            Recent Consultations
          </CardTitle>
          <Button variant="link" onClick={() => navigate("/app/opd/history")}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
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
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
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
            <p className="text-sm text-muted-foreground text-center py-4">No consultations today</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
