import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  CalendarPlus,
  Users,
  Monitor,
  FileText,
  Footprints,
  TestTube,
} from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  variant?: "default" | "outline" | "secondary";
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Register Patient",
    icon: UserPlus,
    path: "/app/patients/new",
    variant: "default",
    description: "Add new patient",
  },
  {
    label: "Schedule Appointment",
    icon: CalendarPlus,
    path: "/app/appointments/new",
    variant: "outline",
    description: "Book appointment",
  },
  {
    label: "Walk-in Patient",
    icon: Footprints,
    path: "/app/opd/walk-in",
    variant: "default",
    description: "Register & collect fee",
  },
  {
    label: "Create Lab Test",
    icon: TestTube,
    path: "/app/lab/create-order",
    variant: "outline",
    description: "Order lab tests",
  },
  {
    label: "View Patients",
    icon: Users,
    path: "/app/patients",
    variant: "secondary",
    description: "Patient directory",
  },
  {
    label: "Queue Display",
    icon: Monitor,
    path: "/app/appointments/queue-display",
    variant: "secondary",
    description: "TV display",
  },
  {
    label: "Today's Report",
    icon: FileText,
    path: "/app/appointments",
    variant: "secondary",
    description: "Appointments list",
  },
];

export function ReceptionQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate(action.path)}
        >
          <action.icon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">{action.label}</div>
            <div className="text-xs opacity-70">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
