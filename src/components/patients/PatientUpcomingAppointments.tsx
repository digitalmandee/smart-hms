import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Clock, User, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { AppointmentPaymentDialog } from "@/components/appointments/AppointmentPaymentDialog";
import { useCheckInAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";

interface PatientUpcomingAppointmentsProps {
  patientId: string;
}

interface AppointmentWithRelations {
  id: string;
  patient_id: string;
  branch_id: string;
  appointment_date: string;
  appointment_time: string | null;
  appointment_type: string | null;
  status: string | null;
  payment_status: string | null;
  invoice_id: string | null;
  chief_complaint: string | null;
  doctor: {
    id: string;
    specialization: string | null;
    consultation_fee: number | null;
    profile: {
      full_name: string;
    };
  } | null;
  branch: {
    name: string;
  } | null;
}

export function PatientUpcomingAppointments({ patientId }: PatientUpcomingAppointmentsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkIn = useCheckInAppointment();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["patient-upcoming-appointments", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          patient_id,
          branch_id,
          appointment_date,
          appointment_time,
          appointment_type,
          status,
          payment_status,
          invoice_id,
          chief_complaint,
          doctor:doctors(id, specialization, consultation_fee, profile:profiles(full_name)),
          branch:branches(name)
        `)
        .eq("patient_id", patientId)
        .gte("appointment_date", today)
        .in("status", ["scheduled", "checked_in", "in_progress"])
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      return data as unknown as AppointmentWithRelations[];
    },
    enabled: !!patientId,
  });

  const handlePayNow = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setPaymentDialogOpen(true);
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await checkIn.mutateAsync(appointmentId);
      toast.success("Patient checked in successfully");
      queryClient.invalidateQueries({ queryKey: ["patient-upcoming-appointments"] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePaymentComplete = () => {
    setPaymentDialogOpen(false);
    setSelectedAppointment(null);
    queryClient.invalidateQueries({ queryKey: ["patient-upcoming-appointments"] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getStatusBadge = (status: string | null, paymentStatus: string | null) => {
    if (status === "checked_in") {
      return <Badge className="bg-info text-info-foreground">Checked In</Badge>;
    }
    if (status === "in_progress") {
      return <Badge className="bg-accent text-accent-foreground">In Progress</Badge>;
    }
    // Scheduled
    if (paymentStatus === "paid") {
      return (
        <Badge className="bg-primary text-primary-foreground gap-1">
          <CheckCircle className="h-3 w-3" />
          Confirmed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 gap-1">
        <AlertCircle className="h-3 w-3" />
        Tentative
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return null; // Don't show section if no upcoming appointments
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>{appointments.length} upcoming appointment(s)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.map((appointment) => {
            const consultationFee = appointment.doctor?.consultation_fee || 500;
            const isPaid = appointment.payment_status === "paid";
            const isCheckedIn = appointment.status === "checked_in";
            const isInProgress = appointment.status === "in_progress";

            return (
              <div
                key={appointment.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">
                        {format(new Date(appointment.appointment_date), "EEE, MMM dd, yyyy")}
                      </p>
                      {appointment.appointment_time && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.appointment_time)}
                        </span>
                      )}
                      {getStatusBadge(appointment.status, appointment.payment_status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      Dr. {appointment.doctor?.profile?.full_name || "TBD"}
                      {appointment.doctor?.specialization && (
                        <Badge variant="outline" className="text-xs">
                          {appointment.doctor.specialization}
                        </Badge>
                      )}
                    </div>
                    {appointment.chief_complaint && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Complaint:</span> {appointment.chief_complaint}
                      </p>
                    )}
                    {/* Show fee info */}
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      <span className={isPaid ? "text-primary" : "text-warning"}>
                        Rs. {consultationFee.toLocaleString()}
                        {isPaid ? " (Paid)" : " (Pending)"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {/* Pay Now button for unpaid appointments */}
                  {!isPaid && !isInProgress && (
                    <Button size="sm" onClick={() => handlePayNow(appointment)}>
                      <CreditCard className="h-4 w-4 mr-1" />
                      Pay Now
                    </Button>
                  )}
                  {/* Check-in button for scheduled + paid appointments */}
                  {appointment.status === "scheduled" && isPaid && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheckIn(appointment.id)}
                      disabled={checkIn.isPending}
                    >
                      Check In
                    </Button>
                  )}
                  {/* View button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {selectedAppointment && (
        <AppointmentPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          appointmentId={selectedAppointment.id}
          patientName="Patient"
          patientNumber=""
          doctorName={selectedAppointment.doctor?.profile?.full_name || "Doctor"}
          consultationFee={selectedAppointment.doctor?.consultation_fee || 500}
          appointmentDate={selectedAppointment.appointment_date}
          appointmentTime={selectedAppointment.appointment_time}
          onPaymentComplete={handlePaymentComplete}
          onPayLater={() => {
            setPaymentDialogOpen(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </>
  );
}
