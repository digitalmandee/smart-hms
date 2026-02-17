import { Link, useNavigate } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { Capacitor } from "@capacitor/core";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppointments, useUpdateAppointment } from "@/hooks/useAppointments";
import { useDoctors } from "@/hooks/useDoctors";
import { useTodayConsultationStats } from "@/hooks/useConsultations";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Users, CheckCircle, Clock, Play, Stethoscope, History, AlertTriangle, Search, Activity, DollarSign } from "lucide-react";
import { PatientGlobalSearch } from "@/components/patients/PatientGlobalSearch";
import { generateVisitId } from "@/lib/visit-id";
import { formatTokenDisplay } from "@/lib/opd-token";
import { PaymentStatusBadge } from "@/components/radiology/PaymentStatusBadge";
import { MobileDoctorView } from "@/components/mobile/MobileDoctorView";

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: doctors = [] } = useDoctors();
  const currentDoctor = doctors.find(d => d.profile?.id === profile?.id);

  const { data: todayAppointments = [], isLoading } = useAppointments({
    doctorId: currentDoctor?.id,
    date: today,
  });

  const { data: stats } = useTodayConsultationStats(currentDoctor?.id);
  const updateAppointment = useUpdateAppointment();

  const queuedPatients = todayAppointments.filter(
    a => a.status === "checked_in" || a.status === "in_progress"
  ).sort((a, b) => (a.token_number || 0) - (b.token_number || 0));

  const currentPatient = todayAppointments.find(a => a.status === "in_progress");
  const nextPatient = queuedPatients.find(a => a.status === "checked_in");

  const getAge = (dob: string | null) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  const getPriorityBadge = (priority: number | null) => {
    if (!priority || priority <= 1) return null;
    if (priority >= 3) return <Badge variant="destructive" className="text-xs">Emergency</Badge>;
    if (priority === 2) return <Badge variant="default" className="text-xs bg-warning text-warning-foreground">Urgent</Badge>;
    return null;
  };

  // Parse vitals from check_in_vitals
  const getVitalsSummary = (checkInVitals: any) => {
    if (!checkInVitals) return null;
    const vitals = typeof checkInVitals === 'string' ? JSON.parse(checkInVitals) : checkInVitals;
    const parts: string[] = [];
    if (vitals.blood_pressure?.systolic && vitals.blood_pressure?.diastolic) {
      parts.push(`BP: ${vitals.blood_pressure.systolic}/${vitals.blood_pressure.diastolic}`);
    }
    if (vitals.pulse) parts.push(`P: ${vitals.pulse}`);
    if (vitals.temperature) parts.push(`T: ${vitals.temperature}°F`);
    if (vitals.spo2) parts.push(`SpO2: ${vitals.spo2}%`);
    return parts.length > 0 ? parts : null;
  };

  const handleQueueItemClick = async (appointmentId: string, status: string) => {
    // Update status to in_progress if checked_in
    if (status === 'checked_in') {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        status: 'in_progress',
      });
    }
    navigate(`/app/opd/consultation/${appointmentId}`);
  };

  // Handle refresh for pull-to-refresh
  const handleRefresh = async () => {
    // Refetch is handled by react-query's refetch
    await Promise.resolve();
  };

  // Mobile Layout
  if (showMobileUI) {
    return (
      <MobileDoctorView
        profile={profile}
        stats={stats}
        todayAppointments={todayAppointments}
        queuedPatients={queuedPatients}
        currentPatient={currentPatient}
        isLoading={isLoading}
        onStartConsult={handleQueueItemClick}
        onRefresh={handleRefresh}
      />
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Dashboard"
        description={`Welcome, Dr. ${profile?.full_name || "Doctor"}`}
        actions={
          <Button asChild variant="outline">
            <Link to="/app/opd/history">
              <History className="h-4 w-4 mr-2" />
              View History
            </Link>
          </Button>
        }
      />

      {/* Patient Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PatientGlobalSearch 
            placeholder="Search any patient by MR#, name, or phone..."
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Today's Patients"
          value={todayAppointments.length}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="In Queue"
          value={queuedPatients.length}
          icon={Stethoscope}
          variant="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Patient */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Current Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : currentPatient ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      {(currentPatient.patient as any)?.first_name}{" "}
                      {(currentPatient.patient as any)?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MR# {(currentPatient.patient as any)?.patient_number}
                    </p>
                  </div>
                  <Badge>Token {formatTokenDisplay(currentPatient.token_number, (currentPatient as any).opd_department?.code)}</Badge>
                </div>
                {currentPatient.chief_complaint && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Chief Complaint:</span>{" "}
                    {currentPatient.chief_complaint}
                  </p>
                )}
                <Button asChild className="w-full">
                  <Link to={`/app/opd/consultation/${currentPatient.id}`}>
                    Continue Consultation
                  </Link>
                </Button>
              </div>
            ) : nextPatient ? (
              <div className="space-y-3">
                <p className="text-muted-foreground">No patient in progress</p>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Next: {(nextPatient.patient as any)?.first_name}</p>
                  <p className="text-sm text-muted-foreground">Token {formatTokenDisplay(nextPatient.token_number, (nextPatient as any).opd_department?.code)}</p>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/app/opd/consultation/${nextPatient.id}`}>
                    Start Consultation
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No patients in queue
              </p>
            )}
          </CardContent>
        </Card>

        {/* Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Patient Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : queuedPatients.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No patients waiting
              </p>
            ) : (
              <div className="space-y-2">
                {queuedPatients.map((apt) => {
                  const patient = apt.patient as any;
                  const age = getAge(patient?.date_of_birth);
                  const priorityBadge = getPriorityBadge(apt.priority);
                  const vitalsSummary = getVitalsSummary(apt.check_in_vitals);
                  const visitId = generateVisitId({
                    appointment_date: apt.appointment_date,
                    token_number: apt.token_number,
                  });
                  
                  return (
                    <div
                      key={apt.id}
                      onClick={() => handleQueueItemClick(apt.id, apt.status || '')}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent/50 hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={apt.status === "in_progress" ? "default" : "outline"} className="min-w-[50px] justify-center">
                          {formatTokenDisplay(apt.token_number, (apt as any).opd_department?.code)}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {patient?.first_name} {patient?.last_name}
                            </p>
                            {priorityBadge}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>MR# {patient?.patient_number}</span>
                            {age !== null && (
                              <>
                                <span>•</span>
                                <span>{age}y {patient?.gender ? `/ ${patient.gender.charAt(0).toUpperCase()}` : ""}</span>
                              </>
                            )}
                            {apt.appointment_time && (
                              <>
                                <span>•</span>
                                <span>{apt.appointment_time}</span>
                              </>
                            )}
                          </div>
                          {apt.chief_complaint && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {apt.chief_complaint}
                            </p>
                          )}
                          {/* Vitals Preview */}
                          {vitalsSummary && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <Activity className="h-3 w-3 text-success" />
                                    <span className="text-xs text-success font-medium">
                                      {vitalsSummary.slice(0, 2).join(' • ')}
                                      {vitalsSummary.length > 2 && ' ...'}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{vitalsSummary.join(' • ')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Payment Status */}
                          {apt.payment_status && apt.payment_status !== 'paid' && (
                            <PaymentStatusBadge status={apt.payment_status} compact showIcon={false} />
                          )}
                          <Badge variant={apt.status === "in_progress" ? "default" : "secondary"}>
                            {apt.status === "in_progress" ? "In Progress" : "Waiting"}
                          </Badge>
                          <Play className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
