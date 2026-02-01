import { useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  RefreshCw,
  Search,
  UserCheck,
  Clock,
  AlertTriangle,
  Stethoscope,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNursingQueue, useCheckInWithVitals } from "@/hooks/useAppointments";
import { VitalsForm } from "@/components/consultation/VitalsForm";
import { Vitals } from "@/hooks/useConsultations";
import { toast } from "sonner";
import { AppointmentWithRelations } from "@/hooks/useAppointments";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from "@capacitor/core";
import { MobileVitalsView } from "@/components/mobile/MobileVitalsView";

const priorityLabels: Record<
  number,
  { label: string; variant: "destructive" | "default" | "secondary" }
> = {
  2: { label: "Emergency", variant: "destructive" },
  1: { label: "Urgent", variant: "default" },
  0: { label: "Normal", variant: "secondary" },
};

export default function OPDVitalsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [vitals, setVitals] = useState<Vitals>({});
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [priority, setPriority] = useState<string>("0");
  const [isSaving, setIsSaving] = useState(false);

  const isMobileScreen = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const showMobileUI = isMobileScreen || isNative;

  const { data: queue, isLoading, refetch } = useNursingQueue();
  const checkInWithVitals = useCheckInWithVitals();

  const awaitingVitals = queue?.awaitingVitals || [];
  const vitalsComplete = queue?.vitalsComplete || [];
  const inProgress = queue?.inProgress || [];

  // Filter by search query
  const filteredAwaiting = awaitingVitals.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName =
      `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
    const mrNumber = apt.patient?.patient_number?.toLowerCase() || "";
    const token = String(apt.token_number);
    return (
      patientName.includes(query) ||
      mrNumber.includes(query) ||
      token.includes(query)
    );
  });

  const filteredComplete = vitalsComplete.filter((apt) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const patientName =
      `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
    const mrNumber = apt.patient?.patient_number?.toLowerCase() || "";
    const token = String(apt.token_number);
    return (
      patientName.includes(query) ||
      mrNumber.includes(query) ||
      token.includes(query)
    );
  });

  const openVitalsDialog = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment);
    setVitals(appointment.check_in_vitals as Vitals || {});
    setChiefComplaint(appointment.chief_complaint || "");
    setPriority(String(appointment.priority || 0));
  };

  const closeDialog = () => {
    setSelectedAppointment(null);
    setVitals({});
    setChiefComplaint("");
    setPriority("0");
  };

  const handleSaveVitals = async () => {
    if (!selectedAppointment) return;

    setIsSaving(true);
    try {
      await checkInWithVitals.mutateAsync({
        id: selectedAppointment.id,
        vitals,
        priority: parseInt(priority),
        chiefComplaint,
      });
      toast.success("Vitals recorded successfully");
      closeDialog();
      refetch();
    } catch (error) {
      toast.error("Failed to save vitals");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipVitals = async () => {
    if (!selectedAppointment) return;

    setIsSaving(true);
    try {
      await checkInWithVitals.mutateAsync({
        id: selectedAppointment.id,
        vitals: { skipped: true, skipped_reason: "Not applicable" } as any,
        priority: parseInt(priority),
        chiefComplaint,
      });
      toast.success("Patient marked as ready (vitals skipped)");
      closeDialog();
      refetch();
    } catch (error) {
      toast.error("Failed to update patient");
      console.error(error);
    } finally {
    setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Mobile-optimized handlers for the mobile view
  const handleMobileSaveVitals = async (data: {
    appointmentId: string;
    vitals: Vitals;
    priority: number;
    chiefComplaint: string;
  }) => {
    await checkInWithVitals.mutateAsync({
      id: data.appointmentId,
      vitals: data.vitals,
      priority: data.priority,
      chiefComplaint: data.chiefComplaint,
    });
    toast.success("Vitals recorded successfully");
    refetch();
  };

  const handleMobileSkipVitals = async (appointmentId: string, priority: number, chiefComplaint: string) => {
    await checkInWithVitals.mutateAsync({
      id: appointmentId,
      vitals: { skipped: true, skipped_reason: "Not applicable" } as any,
      priority,
      chiefComplaint,
    });
    toast.success("Patient marked as ready (vitals skipped)");
    refetch();
  };

  // Mobile view
  if (showMobileUI) {
    return (
      <MobileVitalsView
        awaitingVitals={filteredAwaiting}
        vitalsComplete={filteredComplete}
        inProgress={inProgress}
        isLoading={isLoading}
        onSelectPatient={openVitalsDialog}
        onSaveVitals={handleMobileSaveVitals}
        onSkipVitals={handleMobileSkipVitals}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="OPD Vitals Entry"
        description={`Record patient vitals - ${format(new Date(), "EEEE, MMMM d, yyyy")}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Awaiting Vitals"
          value={awaitingVitals.length}
          icon={Activity}
          variant="warning"
        />
        <StatsCard
          title="Vitals Complete"
          value={vitalsComplete.length}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title="In Consultation"
          value={inProgress.length}
          icon={Stethoscope}
          variant="info"
        />
        <StatsCard
          title="Total Today"
          value={awaitingVitals.length + vitalsComplete.length + inProgress.length}
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by token #, name, or MR#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Awaiting Vitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Awaiting Vitals
              {filteredAwaiting.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {filteredAwaiting.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredAwaiting.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <UserCheck className="h-8 w-8 mb-2" />
                  <p className="text-sm">
                    {searchQuery
                      ? "No matching patients"
                      : "All patients have vitals recorded"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAwaiting.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer border-l-4 border-l-amber-500"
                      onClick={() => openVitalsDialog(appointment)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              #{appointment.token_number}
                            </span>
                            <Badge
                              variant={
                                priorityLabels[appointment.priority || 0]
                                  ?.variant || "secondary"
                              }
                            >
                              {priorityLabels[appointment.priority || 0]
                                ?.label || "Normal"}
                            </Badge>
                          </div>
                          <p className="font-medium">
                            {appointment.patient?.first_name}{" "}
                            {appointment.patient?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            MR# {appointment.patient?.patient_number}
                          </p>
                        </div>
                        <Button size="sm" onClick={(e) => {
                          e.stopPropagation();
                          openVitalsDialog(appointment);
                        }}>
                          <Activity className="h-4 w-4 mr-1" />
                          Record
                        </Button>
                      </div>
                      {appointment.chief_complaint && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{appointment.chief_complaint}"
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Vitals Complete */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              Ready for Doctor
              {filteredComplete.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {filteredComplete.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredComplete.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className="text-sm">
                    {searchQuery
                      ? "No matching patients"
                      : "No patients ready yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredComplete.map((appointment) => {
                    const v = appointment.check_in_vitals as (Vitals & { skipped?: boolean });
                    return (
                      <Card
                        key={appointment.id}
                        className="p-4 border-l-4 border-l-green-500"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">
                                #{appointment.token_number}
                              </span>
                              <Badge
                                variant={
                                  priorityLabels[appointment.priority || 0]
                                    ?.variant || "secondary"
                                }
                              >
                                {priorityLabels[appointment.priority || 0]
                                  ?.label || "Normal"}
                              </Badge>
                            </div>
                            <p className="font-medium">
                              {appointment.patient?.first_name}{" "}
                              {appointment.patient?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              MR# {appointment.patient?.patient_number}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openVitalsDialog(appointment)}
                          >
                            Edit
                          </Button>
                        </div>
                        {/* Vitals Summary */}
                        {v && !v.skipped && (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {v.blood_pressure?.systolic && (
                              <Badge variant="outline">
                                BP: {v.blood_pressure.systolic}/{v.blood_pressure.diastolic}
                              </Badge>
                            )}
                            {v.pulse && (
                              <Badge variant="outline">Pulse: {v.pulse}</Badge>
                            )}
                            {v.temperature && (
                              <Badge variant="outline">
                                Temp: {v.temperature}°{v.temperature_unit || "F"}
                              </Badge>
                            )}
                            {v.spo2 && (
                              <Badge variant="outline">SpO2: {v.spo2}%</Badge>
                            )}
                          </div>
                        )}
                        {v?.skipped && (
                          <Badge variant="outline" className="mt-2">
                            Vitals Skipped
                          </Badge>
                        )}
                        {appointment.chief_complaint && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{appointment.chief_complaint}"
                          </p>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Entry Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Record Vitals - Token #{selectedAppointment?.token_number}
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              {/* Patient Info */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p className="font-medium">
                        {selectedAppointment.patient?.first_name}{" "}
                        {selectedAppointment.patient?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MR#</p>
                      <p className="font-medium">
                        {selectedAppointment.patient?.patient_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority / Triage Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">Urgent</SelectItem>
                    <SelectItem value="2">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chief Complaint */}
              <div className="space-y-2">
                <Label>Chief Complaint</Label>
                <Textarea
                  placeholder="Patient's main complaint..."
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Vitals Form */}
              <VitalsForm vitals={vitals} onChange={setVitals} />

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleSkipVitals} disabled={isSaving}>
                  Skip Vitals
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveVitals} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Vitals"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
