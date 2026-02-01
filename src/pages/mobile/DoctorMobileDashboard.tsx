import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Stethoscope, 
  Calendar, 
  FileText, 
  Users,
  ClipboardCheck,
  Activity,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { AppointmentCard } from "@/components/mobile/AppointmentCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorMobileDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");

  // Fetch today's appointments
  const { data: appointments, isLoading: appointmentsLoading, refetch: refetchAppointments } = useQuery({
    queryKey: ['doctor-mobile-appointments', profile?.id, refreshKey],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          appointment_type,
          status,
          priority,
          token_number,
          chief_complaint,
          patients (
            id,
            full_name,
            phone
          )
        `)
        .eq('appointment_date', todayStr)
        .in('status', ['scheduled', 'checked_in', 'in_progress'])
        .order('priority', { ascending: false })
        .order('token_number', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Fetch stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['doctor-mobile-stats', profile?.id, refreshKey],
    queryFn: async () => {
      if (!profile?.id) return { todayPatients: 0, pendingSurgeries: 0, labResults: 0 };
      
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      
      const [appointmentsRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('appointment_date', todayStr)
      ]);

      return {
        todayPatients: appointmentsRes.count || 0,
        pendingSurgeries: 3, // TODO: Connect to real data
        labResults: 5 // TODO: Connect to real data
      };
    },
    enabled: !!profile?.id
  });

  const handleRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await Promise.all([refetchAppointments(), refetchStats()]);
  }, [refetchAppointments, refetchStats]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Today's Patients"
            value={stats?.todayPatients || 0}
            icon={<Users className="h-5 w-5" />}
            onClick={() => navigate('/app/appointments')}
          />
          <MobileStatsCard
            title="Pending Surgeries"
            value={stats?.pendingSurgeries || 0}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Stethoscope className="h-6 w-6" />}
              label="Start Consult"
              variant="primary"
              onClick={() => navigate('/app/opd')}
            />
            <QuickActionCard
              icon={<Calendar className="h-6 w-6" />}
              label="Schedule"
              onClick={() => navigate('/app/appointments')}
            />
            <QuickActionCard
              icon={<FileText className="h-6 w-6" />}
              label="Lab Results"
              onClick={() => navigate('/app/lab')}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Next Up</h2>
            <button 
              onClick={() => navigate('/app/appointments')}
              className="text-sm text-primary"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {appointmentsLoading ? (
              <>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : appointments && appointments.length > 0 ? (
              appointments.slice(0, 5).map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  patientName={(apt.patients as any)?.full_name || 'Unknown'}
                  patientPhone={(apt.patients as any)?.phone}
                  time={apt.appointment_time || '--:--'}
                  type={apt.appointment_type || 'Consultation'}
                  status={apt.status as any}
                  priority={apt.priority || 0}
                  tokenNumber={apt.token_number || undefined}
                  chiefComplaint={apt.chief_complaint || undefined}
                  onClick={() => navigate(`/app/opd/consultation/${apt.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No appointments scheduled</p>
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
