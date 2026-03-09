import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Receipt,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Pill,
  TestTubes,
  Hash,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { generateVisitId } from "@/lib/visit-id";
import { StatsCard } from "@/components/StatsCard";

export default function PendingCheckoutPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch completed appointments for today that might need checkout
  const { data: completedAppointments, isLoading, refetch } = useQuery({
    queryKey: ["pending-checkout", profile?.branch_id, today],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          token_number,
          appointment_date,
          appointment_time,
          chief_complaint,
          status,
          payment_status,
          patient:patients!appointments_patient_id_fkey (
            id,
            first_name,
            last_name,
            patient_number,
            phone
          ),
          doctor:doctors!appointments_doctor_id_fkey (
            id,
            profile:profiles!doctors_profile_id_fkey (
              full_name
            )
          )
        `)
        .eq("branch_id", profile.branch_id)
        .eq("appointment_date", today)
        .eq("status", "completed")
        .neq("payment_status", "paid")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });

  // Fetch pending lab orders and prescriptions for these appointments
  const { data: pendingOrders } = useQuery({
    queryKey: ["pending-orders", completedAppointments?.map(a => a.id)],
    queryFn: async () => {
      if (!completedAppointments || completedAppointments.length === 0) return {};
      
      const patientIds = completedAppointments.map(a => (a.patient as any)?.id).filter(Boolean);
      
      // Get pending lab orders
      const { data: labOrders } = await supabase
        .from("lab_orders")
        .select("id, patient_id, order_number, payment_status")
        .in("patient_id", patientIds)
        .eq("payment_status", "pending");
      
      // Get pending prescriptions
      const { data: prescriptions } = await supabase
        .from("prescriptions")
        .select("id, patient_id, prescription_number")
        .in("patient_id", patientIds);
      
      // Group by patient
      const ordersByPatient: Record<string, { labOrders: number; prescriptions: number }> = {};
      
      labOrders?.forEach(lo => {
        if (!ordersByPatient[lo.patient_id]) {
          ordersByPatient[lo.patient_id] = { labOrders: 0, prescriptions: 0 };
        }
        ordersByPatient[lo.patient_id].labOrders++;
      });
      
      prescriptions?.forEach(rx => {
        if (!ordersByPatient[rx.patient_id]) {
          ordersByPatient[rx.patient_id] = { labOrders: 0, prescriptions: 0 };
        }
        ordersByPatient[rx.patient_id].prescriptions++;
      });
      
      return ordersByPatient;
    },
    enabled: completedAppointments && completedAppointments.length > 0,
  });

  const handleCheckout = (appointmentId: string) => {
    navigate(`/app/opd/checkout?appointmentId=${appointmentId}`);
  };

  const totalCompleted = completedAppointments?.length || 0;
  const withPendingOrders = completedAppointments?.filter(a => {
    const patientId = (a.patient as any)?.id;
    const orders = pendingOrders?.[patientId];
    return orders && (orders.labOrders > 0 || orders.prescriptions > 0);
  }).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Checkout"
        description="Patients who have completed consultation and need checkout"
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: "Pending Checkout" },
        ]}
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Completed Today"
          value={totalCompleted}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="With Pending Orders"
          value={withPendingOrders}
          icon={Receipt}
          variant="warning"
        />
        <StatsCard
          title="Ready for Checkout"
          value={totalCompleted}
          icon={Users}
          variant="info"
        />
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Completed Consultations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : completedAppointments && completedAppointments.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {completedAppointments.map((apt) => {
                  const patient = apt.patient as any;
                  const doctor = apt.doctor as any;
                  const patientId = patient?.id;
                  const orders = pendingOrders?.[patientId];
                  const hasOrders = orders && (orders.labOrders > 0 || orders.prescriptions > 0);
                  
                  const visitId = generateVisitId({
                    appointment_date: apt.appointment_date,
                    token_number: apt.token_number,
                  });

                  return (
                    <div
                      key={apt.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        hasOrders 
                          ? "border-warning/50 bg-warning/5" 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10">
                            <span className="text-xs text-muted-foreground">Token</span>
                            <span className="text-xl font-bold text-primary">
                              #{apt.token_number}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">
                                {patient?.first_name} {patient?.last_name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {patient?.patient_number}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              <span className="font-mono">{visitId}</span>
                            </div>
                            {doctor && (
                              <p className="text-sm text-muted-foreground">
                                Dr. {doctor.profile?.full_name}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {/* Pending Orders Badges */}
                          <div className="flex gap-2">
                            {orders?.labOrders ? (
                              <Badge variant="secondary" className="gap-1">
                                <TestTubes className="h-3 w-3" />
                                {orders.labOrders} Lab
                              </Badge>
                            ) : null}
                            {orders?.prescriptions ? (
                              <Badge variant="secondary" className="gap-1">
                                <Pill className="h-3 w-3" />
                                {orders.prescriptions} Rx
                              </Badge>
                            ) : null}
                          </div>
                          
                          <Badge 
                            variant={apt.payment_status === "paid" ? "default" : "outline"}
                            className={apt.payment_status === "paid" ? "bg-success" : ""}
                          >
                            {apt.payment_status === "paid" ? "Paid" : "Pending Payment"}
                          </Badge>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleCheckout(apt.id)}
                          >
                            Checkout
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No pending checkouts</p>
              <p className="text-sm">All completed consultations have been processed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
