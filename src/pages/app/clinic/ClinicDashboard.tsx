import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useNavigate } from "react-router-dom";
import { 
  Ticket, Users, Clock, CreditCard, 
  Plus, ArrowRight, Stethoscope
} from "lucide-react";
import { format } from "date-fns";

export default function ClinicDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Get today's data
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments({
    date: today,
  });

  // Calculate stats
  const todayAppointments = appointments || [];
  const tokensIssued = todayAppointments.length;
  const patientsSeen = todayAppointments.filter(a => a.status === "completed").length;
  const waiting = todayAppointments.filter(a => 
    a.status === "checked_in" || a.status === "scheduled"
  ).length;
  
  // Placeholder for revenue (would need separate query)
  const todayRevenue = tokensIssued * 500; // Estimate based on average fee

  // Queue - patients waiting
  const queue = todayAppointments
    .filter(a => a.status === "checked_in" || a.status === "scheduled")
    .sort((a, b) => (a.token_number || 0) - (b.token_number || 0))
    .slice(0, 5);

  // Recent completed
  const recentCompleted = todayAppointments
    .filter(a => a.status === "completed")
    .slice(-3)
    .reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
        description={format(new Date(), "EEEE, MMMM d, yyyy")}
        actions={
          <Button onClick={() => navigate("/app/clinic/token")}>
            <Plus className="h-4 w-4 mr-2" />
            New Token
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Issued</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{tokensIssued}</div>
            )}
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{patientsSeen}</div>
            )}
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{waiting}</div>
            )}
            <p className="text-xs text-muted-foreground">In queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                Rs. {todayRevenue.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Today's revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Queue</CardTitle>
                <CardDescription>Patients waiting to be seen</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/app/appointments/queue")}
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : queue.length > 0 ? (
              <div className="space-y-3">
                {queue.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        #{appointment.token_number}
                      </div>
                      <div>
                        <p className="font-medium">
                          {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          Dr. {appointment.doctor?.profile?.full_name || "Unassigned"}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Button size="sm">Call Next</Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No patients in queue</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for clinic operations</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/app/clinic/token")}
            >
              <Ticket className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Issue New Token</p>
                <p className="text-xs text-muted-foreground">Register and issue token to patient</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/app/patients/new")}
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Register Patient</p>
                <p className="text-xs text-muted-foreground">Add a new patient to the system</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/app/billing/invoices/new")}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Create Invoice</p>
                <p className="text-xs text-muted-foreground">Bill a patient for services</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => navigate("/app/appointments")}
            >
              <Clock className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">View Appointments</p>
                <p className="text-xs text-muted-foreground">Manage today's schedule</p>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completed */}
      {recentCompleted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {recentCompleted.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Badge variant="outline" className="text-success border-success">
                      #{appointment.token_number}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">
                      {appointment.patient?.first_name} {appointment.patient?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Dr. {appointment.doctor?.profile?.full_name || "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
