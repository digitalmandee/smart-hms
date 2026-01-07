import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

interface Patient {
  id: string;
  first_name: string;
  last_name: string | null;
  patient_number: string;
  phone: string | null;
  created_at: string;
}

interface RecentRegistrationCardProps {
  patient: Patient;
}

export function RecentRegistrationCard({ patient }: RecentRegistrationCardProps) {
  const navigate = useNavigate();

  const fullName = `${patient.first_name} ${patient.last_name || ""}`.trim();
  const registrationTime = format(parseISO(patient.created_at), "h:mm a");

  return (
    <Card
      className="p-3 min-w-[140px] cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/app/patients/${patient.id}`)}
    >
      <div className="flex flex-col items-center text-center gap-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="font-medium text-sm truncate max-w-full">{fullName}</div>
        <div className="text-xs text-muted-foreground">{patient.patient_number}</div>
        <div className="text-xs text-green-600">{registrationTime}</div>
      </div>
    </Card>
  );
}
