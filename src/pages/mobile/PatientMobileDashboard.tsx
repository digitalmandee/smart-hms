import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  Calendar, 
  FileText, 
  Receipt,
  Pill,
  Clock,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { QuickActionCard } from "@/components/mobile/QuickActionCard";
import { MobileStatsCard } from "@/components/mobile/MobileStatsCard";
import { AppointmentCard } from "@/components/mobile/AppointmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PatientMobileDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const greeting = getGreeting();
  const today = format(new Date(), "EEEE, MMMM d");

  // Mock data - connect to real patient portal data
  const upcomingAppointments = [
    {
      id: '1',
      doctorName: 'Dr. Ahmed Hassan',
      time: '10:30 AM',
      date: 'Tomorrow',
      type: 'Follow-up',
      status: 'scheduled' as const
    }
  ];

  const pendingBills = {
    count: 2,
    total: 15000
  };

  const handleRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    // Refetch data
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4 py-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-muted-foreground">{today}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <MobileStatsCard
            title="Upcoming Visits"
            value={upcomingAppointments.length}
            icon={<Calendar className="h-5 w-5" />}
          />
          <MobileStatsCard
            title="Pending Bills"
            value={`₹${pendingBills.total.toLocaleString()}`}
            icon={<Receipt className="h-5 w-5" />}
            onClick={() => navigate('/mobile/bills')}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickActionCard
              icon={<Calendar className="h-6 w-6" />}
              label="Book Appointment"
              variant="primary"
              onClick={() => navigate('/mobile/book-appointment')}
            />
            <QuickActionCard
              icon={<FileText className="h-6 w-6" />}
              label="My Reports"
              onClick={() => navigate('/mobile/reports')}
            />
            <QuickActionCard
              icon={<Pill className="h-6 w-6" />}
              label="Prescriptions"
              onClick={() => navigate('/mobile/prescriptions')}
            />
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
            <button 
              onClick={() => navigate('/mobile/appointments')}
              className="text-sm text-primary"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-card border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{apt.doctorName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{apt.type}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-primary">
                          <Calendar className="h-4 w-4" />
                          {apt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {apt.time}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/mobile/book-appointment')}
                >
                  Book Now
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Lab Reports */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Reports</h2>
            <button 
              onClick={() => navigate('/mobile/reports')}
              className="text-sm text-primary"
            >
              View All
            </button>
          </div>
          
          <div className="bg-card border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Blood Test Report</h4>
                  <p className="text-sm text-muted-foreground">Jan 28, 2026</p>
                </div>
              </div>
              <Button size="icon" variant="ghost">
                <Download className="h-5 w-5" />
              </Button>
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
