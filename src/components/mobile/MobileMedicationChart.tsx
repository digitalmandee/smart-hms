import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Clock, CheckCircle2, User, ChevronRight, Info } from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  route: string;
  frequency: string;
  times: string[];
  administered: boolean[];
  notes: string;
  isPRN: boolean;
  prnIndication?: string;
  prescribedBy: string;
}

interface Admission {
  id: string;
  admission_number: string;
  patient?: {
    first_name: string;
    last_name?: string;
    patient_number?: string;
  };
  bed?: { bed_number: string };
}

interface MobileMedicationChartProps {
  admissions: Admission[];
  selectedAdmission: string;
  onSelectAdmission: (id: string) => void;
  medications: Medication[];
  isLoading: boolean;
  selectedAdmissionData?: Admission;
  onRefresh: () => Promise<void>;
}

export function MobileMedicationChart({
  admissions,
  selectedAdmission,
  onSelectAdmission,
  medications,
  isLoading,
  selectedAdmissionData,
  onRefresh,
}: MobileMedicationChartProps) {
  const navigate = useNavigate();

  const handleCardTap = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (e) {}
    }
  };

  const stats = {
    total: medications.length,
    complete: medications.filter(m => m.administered.every(Boolean)).length,
    pending: medications.filter(m => !m.administered.every(Boolean)).length,
  };

  const getStatusBadge = (administered: boolean[], times: string[]) => {
    const total = times.length;
    const given = administered.filter(Boolean).length;
    if (given === total) return <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>;
    if (given > 0) return <Badge className="bg-warning text-warning-foreground text-xs">{given}/{total}</Badge>;
    return <Badge variant="outline" className="text-xs">Pending</Badge>;
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Patient Selector */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Patient</label>
            <Select value={selectedAdmission} onValueChange={onSelectAdmission}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select admitted patient" />
              </SelectTrigger>
              <SelectContent>
                {admissions.map((admission) => (
                  <SelectItem key={admission.id} value={admission.id}>
                    {admission.admission_number} - {admission.patient?.first_name}{" "}
                    {admission.patient?.last_name} ({admission.bed?.bed_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedAdmission && (
          <>
            {/* Stats Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{stats.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Complete</p>
                    <p className="text-xl font-bold">{stats.complete}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold">{stats.pending}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Patient</p>
                    <p className="text-sm font-medium truncate max-w-[80px]">
                      {selectedAdmissionData?.patient?.first_name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Date Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-muted-foreground">
                {format(new Date(), "dd MMM yyyy")}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/ipd/admissions/${selectedAdmission}`)}
              >
                View Admission
              </Button>
            </div>

            {/* Medication Cards */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-sm animate-pulse">
                    <CardContent className="p-4 h-24" />
                  </Card>
                ))}
              </div>
            ) : medications.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-8 text-center">
                  <Pill className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium text-muted-foreground">No medications prescribed</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Medications can be prescribed from the admission page
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {medications.map((med) => (
                  <Card
                    key={med.id}
                    className="border-0 shadow-sm active:scale-[0.98] transition-transform"
                    onClick={handleCardTap}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{med.name}</p>
                            {med.isPRN && (
                              <Badge variant="outline" className="text-xs">PRN</Badge>
                            )}
                          </div>
                          {med.dosage && (
                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          )}
                        </div>
                        {getStatusBadge(med.administered, med.times)}
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <Badge variant={med.route === "IV" ? "default" : "secondary"} className="text-xs">
                          {med.route}
                        </Badge>
                        <span className="text-muted-foreground">{med.frequency}</span>
                      </div>

                      {/* Time Checkboxes */}
                      <div className="flex flex-wrap gap-3">
                        {med.times.map((time, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg border",
                              med.administered[idx]
                                ? "bg-success/10 border-success/30"
                                : "bg-muted/50 border-border"
                            )}
                          >
                            <Checkbox
                              checked={med.administered[idx]}
                              disabled
                              className="h-4 w-4"
                            />
                            <span
                              className={cn(
                                "text-sm",
                                med.administered[idx] && "line-through text-muted-foreground"
                              )}
                            >
                              {time}
                            </span>
                          </div>
                        ))}
                      </div>

                      {med.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">{med.notes}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Info Note */}
            <Card className="border-0 shadow-sm bg-muted/30">
              <CardContent className="p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Nurses:</strong> Use the{" "}
                    <Link to="/app/ipd/nursing-station" className="text-primary underline">
                      Nursing Station
                    </Link>{" "}
                    to administer medications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
