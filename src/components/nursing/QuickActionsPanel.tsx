import { useNavigate } from 'react-router-dom';
import { 
  UserCheck, 
  AlertTriangle, 
  Search, 
  Calendar,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const actions = [
  {
    label: 'Check In Patient',
    description: 'Start check-in from queue',
    icon: UserCheck,
    route: '/app/appointments/queue',
    color: 'bg-green-100 dark:bg-green-900 text-green-600',
  },
  {
    label: 'Emergency Triage',
    description: 'Create emergency appointment',
    icon: AlertTriangle,
    route: '/app/appointments/new?type=emergency',
    color: 'bg-red-100 dark:bg-red-900 text-red-600',
  },
  {
    label: 'Patient Lookup',
    description: 'Search patient records',
    icon: Search,
    route: '/app/patients',
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600',
  },
  {
    label: "Today's Schedule",
    description: 'View appointment calendar',
    icon: Calendar,
    route: '/app/appointments/calendar',
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-600',
  },
  {
    label: 'Active Consultations',
    description: 'View ongoing consults',
    icon: Stethoscope,
    route: '/app/opd',
    color: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600',
  },
  {
    label: 'Queue Display',
    description: 'Open waiting room display',
    icon: ClipboardList,
    route: '/app/appointments/display',
    color: 'bg-amber-100 dark:bg-amber-900 text-amber-600',
  },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.label}
            className="p-4 cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
            onClick={() => navigate(action.route)}
          >
            <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-medium text-sm">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
