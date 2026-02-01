import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Activity, 
  Pill, 
  ClipboardList,
  Users,
  AlertCircle,
  Bed,
  Heart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { TaskCard } from "@/components/mobile/TaskCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function NurseMobileDashboard() {
  const navigate = useNavigate();
  const { profile, roles } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");
  
  // Determine nurse type for personalized view
  const isIPDNurse = roles.includes('ipd_nurse');
  const isOPDNurse = roles.includes('opd_nurse');
  const isOTNurse = roles.includes('ot_nurse');

  // Fetch ward patients for IPD nurse
  const { data: wardStats, refetch: refetchWard } = useQuery({
    queryKey: ['nurse-mobile-ward', profile?.branch_id, refreshKey],
    queryFn: async () => {
      // Mock data for now - connect to real admissions data
      return {
        totalPatients: 24,
        criticalPatients: 2,
        pendingMeds: 8,
        pendingVitals: 5
      };
    },
    enabled: isIPDNurse && !!profile?.branch_id
  });

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useQuery({
    queryKey: ['nurse-mobile-tasks', profile?.id, refreshKey],
    queryFn: async () => {
      // Mock nursing tasks - connect to real data
      return [
        {
          id: '1',
          title: 'Record vitals - Room 201',
          patientName: 'Ahmed Khan',
          dueTime: '10:30 AM',
          status: 'pending' as const,
          priority: 'high' as const,
          category: 'Vitals'
        },
        {
          id: '2',
          title: 'Administer medication',
          patientName: 'Sara Ali',
          dueTime: '11:00 AM',
          status: 'pending' as const,
          priority: 'urgent' as const,
          category: 'Medication'
        },
        {
          id: '3',
          title: 'Wound dressing change',
          patientName: 'Hassan Malik',
          dueTime: '11:30 AM',
          status: 'pending' as const,
          priority: 'normal' as const,
          category: 'Care'
        }
      ];
    },
    enabled: !!profile?.id
  });

  const handleRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await Promise.all([refetchWard(), refetchTasks()]);
  }, [refetchWard, refetchTasks]);

  const handleCompleteTask = (taskId: string) => {
    // TODO: Implement task completion
    console.log('Complete task:', taskId);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'Nurse'}
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {/* Ward Stats (IPD Nurse) */}
        {isIPDNurse && wardStats && (
          <div className="grid grid-cols-2 gap-3">
            <MobileStatsCard
              title="Ward Patients"
              value={wardStats.totalPatients}
              icon={<Bed className="h-5 w-5" />}
            />
            <MobileStatsCard
              title="Critical"
              value={wardStats.criticalPatients}
              icon={<AlertCircle className="h-5 w-5 text-destructive" />}
              className={wardStats.criticalPatients > 0 ? "border-destructive/50" : ""}
            />
            <MobileStatsCard
              title="Pending Vitals"
              value={wardStats.pendingVitals}
              icon={<Heart className="h-5 w-5" />}
            />
            <MobileStatsCard
              title="Pending Meds"
              value={wardStats.pendingMeds}
              icon={<Pill className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Activity className="h-6 w-6" />}
              label="Record Vitals"
              variant="primary"
              onClick={() => navigate('/mobile/vitals/new')}
            />
            <QuickActionCard
              icon={<Pill className="h-6 w-6" />}
              label="Medications"
              onClick={() => navigate('/mobile/medications')}
            />
            <QuickActionCard
              icon={<ClipboardList className="h-6 w-6" />}
              label="Nursing Notes"
              onClick={() => navigate('/mobile/nursing-notes')}
            />
          </div>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Tasks</h2>
            <button 
              onClick={() => navigate('/mobile/tasks')}
              className="text-sm text-primary"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {tasksLoading ? (
              <>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  patientName={task.patientName}
                  dueTime={task.dueTime}
                  status={task.status}
                  priority={task.priority}
                  category={task.category}
                  onComplete={() => handleCompleteTask(task.id)}
                  onClick={() => navigate(`/mobile/task/${task.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending tasks</p>
              </div>
            )}
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
