import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Users, 
  Calendar, 
  ClipboardList,
  Settings,
  BarChart3,
  Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { ROLE_LABELS } from "@/constants/roles";

export default function StaffMobileDashboard() {
  const navigate = useNavigate();
  const { profile, roles } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");
  
  // Get primary role label
  const primaryRole = roles[0];
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : 'Staff';

  const handleRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
  }, []);

  // Role-based quick actions
  const getQuickActions = () => {
    if (roles.includes('receptionist')) {
      return [
        { icon: <Users className="h-6 w-6" />, label: 'Patients', path: '/mobile/patients', variant: 'primary' as const },
        { icon: <Calendar className="h-6 w-6" />, label: 'Appointments', path: '/mobile/appointments' },
        { icon: <ClipboardList className="h-6 w-6" />, label: 'Check-in', path: '/mobile/checkin' }
      ];
    }
    
    if (roles.includes('lab_technician')) {
      return [
        { icon: <ClipboardList className="h-6 w-6" />, label: 'Lab Queue', path: '/mobile/lab-queue', variant: 'primary' as const },
        { icon: <BarChart3 className="h-6 w-6" />, label: 'Results', path: '/mobile/lab-results' },
        { icon: <Users className="h-6 w-6" />, label: 'Samples', path: '/mobile/samples' }
      ];
    }
    
    if (roles.includes('pharmacist') || roles.includes('ot_pharmacist')) {
      return [
        { icon: <ClipboardList className="h-6 w-6" />, label: 'Dispensing', path: '/mobile/dispensing', variant: 'primary' as const },
        { icon: <BarChart3 className="h-6 w-6" />, label: 'Inventory', path: '/mobile/inventory' },
        { icon: <Users className="h-6 w-6" />, label: 'POS', path: '/mobile/pos' }
      ];
    }
    
    // Default actions
    return [
      { icon: <ClipboardList className="h-6 w-6" />, label: 'Tasks', path: '/mobile/tasks', variant: 'primary' as const },
      { icon: <Calendar className="h-6 w-6" />, label: 'Schedule', path: '/mobile/schedule' },
      { icon: <Settings className="h-6 w-6" />, label: 'Settings', path: '/mobile/settings' }
    ];
  };

  const quickActions = getQuickActions();

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">{today}</p>
          <span className="inline-flex items-center mt-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {roleLabel}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Pending Tasks"
            value={5}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Notifications"
            value={3}
            icon={<Bell className="h-5 w-5" />}
            onClick={() => navigate('/mobile/notifications')}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                label={action.label}
                variant={action.variant || 'default'}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="bg-card border rounded-xl p-4">
          <h3 className="font-semibold mb-3">Today's Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasks Completed</span>
              <span className="font-medium">12 / 17</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shift Ends</span>
              <span className="font-medium">6:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
