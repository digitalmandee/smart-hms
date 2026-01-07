import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, UserCheck } from "lucide-react";
import { AppointmentWithRelations } from "@/hooks/useAppointments";

interface UpcomingAppointmentCardProps {
  appointment: AppointmentWithRelations;
}

export function UpcomingAppointmentCard({ appointment }: UpcomingAppointmentCardProps) {
  const navigate = useNavigate();

  const patientName = appointment.patient 
    ? `${appointment.patient.first_name} ${appointment.patient.last_name || ""}`.trim()
    : "Unknown Patient";
  const doctorName = appointment.doctor?.profile?.full_name || "No Doctor Assigned";
  const timeStr = appointment.appointment_time 
    ? format(parseISO(`2000-01-01T${appointment.appointment_time}`), "h:mm a")
    : "No time set";

  const priorityConfig = {
    2: { label: "Emergency", className: "bg-red-500 text-white" },
    1: { label: "Urgent", className: "bg-amber-500 text-white" },
    0: { label: "Normal", className: "bg-green-500 text-white" },
  };

  const priority = priorityConfig[appointment.priority as keyof typeof priorityConfig] || priorityConfig[0];

  const handleCheckIn = () => {
    navigate(`/app/appointments/${appointment.id}/check-in`);
  };

  return (
    <div className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">{timeStr}</span>
            {appointment.priority !== null && appointment.priority > 0 && (
              <Badge className={`text-xs ${priority.className}`}>
                {priority.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium truncate">{patientName}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {doctorName}
          </div>
          {appointment.patient?.phone && (
            <div className="text-xs text-muted-foreground">
              📞 {appointment.patient.phone}
            </div>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={handleCheckIn}
          className="shrink-0"
        >
          <UserCheck className="h-4 w-4 mr-1" />
          Check In
        </Button>
      </div>
    </div>
  );
}
