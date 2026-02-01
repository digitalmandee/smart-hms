import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { VitalsForm } from "@/components/consultation/VitalsForm";
import { Vitals } from "@/hooks/useConsultations";
import { 
  Activity, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  Stethoscope,
  User,
  ChevronRight,
  RefreshCw,
  Check,
  SkipForward
} from "lucide-react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";
import { AppointmentWithRelations } from "@/hooks/useAppointments";

const priorityLabels: Record<number, { label: string; color: string }> = {
  2: { label: "Emergency", color: "bg-destructive text-destructive-foreground" },
  1: { label: "Urgent", color: "bg-amber-500 text-white" },
  0: { label: "Normal", color: "bg-secondary text-secondary-foreground" },
};

interface MobileVitalsViewProps {
  awaitingVitals: AppointmentWithRelations[];
  vitalsComplete: AppointmentWithRelations[];
  inProgress: AppointmentWithRelations[];
  isLoading: boolean;
  onSelectPatient: (apt: AppointmentWithRelations) => void;
  onSaveVitals: (data: {
    appointmentId: string;
    vitals: Vitals;
    priority: number;
    chiefComplaint: string;
  }) => Promise<void>;
  onSkipVitals: (appointmentId: string, priority: number, chiefComplaint: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function MobileVitalsView({
  awaitingVitals,
  vitalsComplete,
  inProgress,
  isLoading,
  onSaveVitals,
  onSkipVitals,
  onRefresh,
}: MobileVitalsViewProps) {
  const [activeTab, setActiveTab] = useState("awaiting");
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [vitals, setVitals] = useState<Vitals>({});
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [priority, setPriority] = useState<string>("0");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const triggerHaptic = async (type: 'light' | 'success' = 'light') => {
    if (Capacitor.isNativePlatform()) {
      if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    }
  };

  const openVitalsSheet = async (apt: AppointmentWithRelations) => {
    await triggerHaptic();
    setSelectedAppointment(apt);
    setVitals((apt.check_in_vitals as Vitals) || {});
    setChiefComplaint(apt.chief_complaint || "");
    setPriority(String(apt.priority || 0));
  };

  const closeSheet = () => {
    setSelectedAppointment(null);
    setVitals({});
    setChiefComplaint("");
    setPriority("0");
  };

  const handleSave = async () => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    try {
      await onSaveVitals({
        appointmentId: selectedAppointment.id,
        vitals,
        priority: parseInt(priority),
        chiefComplaint,
      });
      await triggerHaptic('success');
      closeSheet();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!selectedAppointment) return;
    setIsSaving(true);
    try {
      await onSkipVitals(selectedAppointment.id, parseInt(priority), chiefComplaint);
      await triggerHaptic('success');
      closeSheet();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filterBySearch = (list: AppointmentWithRelations[]) => {
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((apt) => {
      const name = `${apt.patient?.first_name} ${apt.patient?.last_name}`.toLowerCase();
      const mr = apt.patient?.patient_number?.toLowerCase() || "";
      const token = String(apt.token_number);
      return name.includes(q) || mr.includes(q) || token.includes(q);
    });
  };

  const filteredAwaiting = filterBySearch(awaitingVitals);
  const filteredComplete = filterBySearch(vitalsComplete);

  const totalToday = awaitingVitals.length + vitalsComplete.length + inProgress.length;

  return (
    <>
      <PullToRefresh onRefresh={onRefresh}>
        <div className="px-4 py-4 space-y-4 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">OPD Vitals</h1>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d")}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => onRefresh()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Activity className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{awaitingVitals.length}</p>
                  <p className="text-xs text-muted-foreground">Awaiting</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vitalsComplete.length}</p>
                  <p className="text-xs text-muted-foreground">Ready</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgress.length}</p>
                  <p className="text-xs text-muted-foreground">In Consult</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalToday}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search token, name, or MR#..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-4"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 h-12">
              <TabsTrigger value="awaiting" className="h-10 gap-2">
                <AlertTriangle className="h-4 w-4" />
                Awaiting ({filteredAwaiting.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="h-10 gap-2">
                <UserCheck className="h-4 w-4" />
                Ready ({filteredComplete.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="awaiting" className="mt-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : filteredAwaiting.length === 0 ? (
                <Card className="py-8">
                  <CardContent className="flex flex-col items-center text-center">
                    <UserCheck className="h-10 w-10 text-green-500 mb-2" />
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm text-muted-foreground">
                      No patients awaiting vitals
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredAwaiting.map((apt) => (
                  <Card
                    key={apt.id}
                    className="overflow-hidden border-l-4 border-l-amber-500 active:scale-[0.98] transition-transform cursor-pointer"
                    onClick={() => openVitalsSheet(apt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">
                              #{apt.token_number}
                            </span>
                            <Badge
                              className={priorityLabels[apt.priority || 0]?.color}
                            >
                              {priorityLabels[apt.priority || 0]?.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {apt.patient?.first_name} {apt.patient?.last_name}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            MR# {apt.patient?.patient_number}
                          </p>
                          {apt.chief_complaint && (
                            <p className="text-sm text-muted-foreground mt-1 italic line-clamp-1">
                              "{apt.chief_complaint}"
                            </p>
                          )}
                        </div>
                        <Button size="sm" className="shrink-0">
                          <Activity className="h-4 w-4 mr-1" />
                          Record
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ready" className="mt-4 space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : filteredComplete.length === 0 ? (
                <Card className="py-8">
                  <CardContent className="flex flex-col items-center text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">No patients ready</p>
                    <p className="text-sm text-muted-foreground">
                      Record vitals to add patients here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredComplete.map((apt) => {
                  const v = apt.check_in_vitals as Vitals & { skipped?: boolean };
                  return (
                    <Card
                      key={apt.id}
                      className="overflow-hidden border-l-4 border-l-green-500 active:scale-[0.98] transition-transform cursor-pointer"
                      onClick={() => openVitalsSheet(apt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-lg">
                                #{apt.token_number}
                              </span>
                              <Badge
                                className={priorityLabels[apt.priority || 0]?.color}
                              >
                                {priorityLabels[apt.priority || 0]?.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {apt.patient?.first_name} {apt.patient?.last_name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              MR# {apt.patient?.patient_number}
                            </p>
                            {/* Vitals Summary */}
                            {v && !v.skipped && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {v.blood_pressure?.systolic && (
                                  <Badge variant="outline" className="text-xs">
                                    BP: {v.blood_pressure.systolic}/{v.blood_pressure.diastolic}
                                  </Badge>
                                )}
                                {v.pulse && (
                                  <Badge variant="outline" className="text-xs">
                                    Pulse: {v.pulse}
                                  </Badge>
                                )}
                                {v.temperature && (
                                  <Badge variant="outline" className="text-xs">
                                    {v.temperature}°{v.temperature_unit || "F"}
                                  </Badge>
                                )}
                              </div>
                            )}
                            {v?.skipped && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                Vitals Skipped
                              </Badge>
                            )}
                          </div>
                          <Button size="sm" variant="outline" className="shrink-0">
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefresh>

      {/* Vitals Entry Sheet */}
      <Sheet open={!!selectedAppointment} onOpenChange={() => closeSheet()}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Record Vitals - Token #{selectedAppointment?.token_number}
            </SheetTitle>
          </SheetHeader>

          {selectedAppointment && (
            <div className="py-4 space-y-4">
              {/* Patient Info */}
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedAppointment.patient?.first_name}{" "}
                        {selectedAppointment.patient?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        MR# {selectedAppointment.patient?.patient_number}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority / Triage Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-12">
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
                  className="min-h-[80px]"
                />
              </div>

              {/* Vitals Form */}
              <VitalsForm vitals={vitals} onChange={setVitals} />

              {/* Action Buttons - Fixed at bottom */}
              <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t -mx-6 px-6 mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleSkip}
                  disabled={isSaving}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Vitals
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Save Vitals
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
