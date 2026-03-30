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
  BedDouble,
  Bot,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface QuickAction {
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  variant?: "default" | "outline" | "secondary";
  descKey: string;
}

const quickActions: QuickAction[] = [
  { labelKey: "reception.registerPatient", icon: UserPlus, path: "/app/patients/new", variant: "default", descKey: "reception.addNewPatient" },
  { labelKey: "reception.scheduleAppointment", icon: CalendarPlus, path: "/app/appointments/new", variant: "outline", descKey: "reception.bookAppointment" },
  { labelKey: "reception.walkInPatient", icon: Footprints, path: "/app/opd/walk-in", variant: "default", descKey: "reception.collectFee" },
  { labelKey: "reception.viewBeds", icon: BedDouble, path: "/app/ipd/beds", variant: "outline", descKey: "reception.checkBedAvail" },
  { labelKey: "reception.createLabTest", icon: TestTube, path: "/app/lab/create-order", variant: "outline", descKey: "reception.orderLabTests" },
  { labelKey: "reception.viewPatients", icon: Users, path: "/app/patients", variant: "secondary", descKey: "reception.patientDirectory" },
  { labelKey: "reception.queueDisplay", icon: Monitor, path: "/app/appointments/queue-display", variant: "secondary", descKey: "reception.tvDisplay" },
  { labelKey: "reception.todaysReport", icon: FileText, path: "/app/appointments", variant: "secondary", descKey: "reception.appointmentsList" },
  { labelKey: "reception.aiIntake", icon: Bot, path: "/app/ai-chat", variant: "outline", descKey: "reception.aiGuided" },
  { labelKey: "reception.dialysisSchedule", icon: Droplets, path: "/app/dialysis/schedule/new", variant: "outline", descKey: "reception.scheduleDialysis" },
];

export function ReceptionQuickActions() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => (
        <Button
          key={action.labelKey}
          variant={action.variant}
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate(action.path)}
        >
          <action.icon className="h-6 w-6" />
          <div className="text-center">
            <div className="font-medium text-sm">{t(action.labelKey as any)}</div>
            <div className="text-xs opacity-70">{t(action.descKey as any)}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
