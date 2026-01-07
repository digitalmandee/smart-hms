import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { AppointmentWithRelations } from "@/hooks/useAppointments";

interface TodayScheduleListProps {
  appointments: AppointmentWithRelations[];
  isLoading: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  checked_in: { label: "Checked In", variant: "default" },
  in_progress: { label: "In Progress", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  no_show: { label: "No Show", variant: "destructive" },
};

export function TodayScheduleList({ appointments, isLoading }: TodayScheduleListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading schedule...
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No appointments scheduled for today
      </div>
    );
  }

  // Group appointments by hour
  const groupedByHour: Record<string, AppointmentWithRelations[]> = {};
  appointments.forEach((apt) => {
    const hour = apt.appointment_time 
      ? apt.appointment_time.slice(0, 2) + ":00"
      : "Unscheduled";
    if (!groupedByHour[hour]) {
      groupedByHour[hour] = [];
    }
    groupedByHour[hour].push(apt);
  });

  const sortedHours = Object.keys(groupedByHour).sort();

  return (
    <div className="divide-y">
      {sortedHours.map((hour) => (
        <div key={hour} className="p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            {hour === "Unscheduled" ? hour : format(parseISO(`2000-01-01T${hour}`), "h:mm a")}
          </div>
          <div className="space-y-2">
            {groupedByHour[hour].map((apt) => {
              const status = statusConfig[apt.status || "scheduled"];
              const patientName = apt.patient 
                ? `${apt.patient.first_name} ${apt.patient.last_name || ""}`.trim()
                : "Unknown Patient";
              const doctorName = apt.doctor?.profile?.full_name || "No Doctor";

              return (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {apt.token_number && (
                        <span className="text-xs font-bold text-primary">
                          #{apt.token_number}
                        </span>
                      )}
                      <span className="font-medium truncate">{patientName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {doctorName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={status.variant}
                      className={`text-xs ${
                        apt.status === "checked_in" ? "bg-blue-500 hover:bg-blue-600" :
                        apt.status === "in_progress" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                        apt.status === "completed" ? "bg-green-500 hover:bg-green-600" : ""
                      }`}
                    >
                      {status.label}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => navigate(`/app/appointments/${apt.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
