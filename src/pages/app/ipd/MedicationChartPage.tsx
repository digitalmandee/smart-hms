import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useIPDMedications, useMedicationAdministration } from "@/hooks/useNursingCare";
import { Pill, Clock, CheckCircle2, User, Info } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

// Helper to parse frequency into time slots
const getTimeSlots = (frequency: string): string[] => {
  const frequencyMap: Record<string, string[]> = {
    "OD": ["08:00"],
    "BD": ["08:00", "20:00"],
    "TDS": ["08:00", "14:00", "20:00"],
    "QID": ["06:00", "12:00", "18:00", "22:00"],
    "Q4H": ["06:00", "10:00", "14:00", "18:00", "22:00", "02:00"],
    "Q6H": ["06:00", "12:00", "18:00", "00:00"],
    "Q8H": ["06:00", "14:00", "22:00"],
    "Q12H": ["08:00", "20:00"],
    "HS": ["22:00"],
    "PRN": ["As needed"],
    "STAT": ["Immediately"],
    "Continuous": ["Running"],
  };
  return frequencyMap[frequency] || ["08:00"];
};

const MedicationChartPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");
  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  // Fetch real medications from ipd_medications table
  const { data: rawMedications = [], isLoading: medsLoading } = useIPDMedications(selectedAdmission || undefined);
  
  // Fetch administration records for today
  const { data: administrationRecords = [] } = useMedicationAdministration(
    selectedAdmission || undefined, 
    today
  );

  // Transform medications with administration status
  const medications = rawMedications.map((med: any) => {
    const times = getTimeSlots(med.frequency || "OD");
    const isPRN = med.is_prn;
    
    // Check administration records for each time slot
    const administered = times.map((time) => {
      if (isPRN || time === "As needed" || time === "Immediately" || time === "Running") {
        return administrationRecords.some(
          (rec: any) => rec.ipd_medication_id === med.id && rec.status === "given"
        );
      }
      // For scheduled times, check if there's an administration record for that time
      const scheduledTime = `${today}T${time}:00`;
      return administrationRecords.some(
        (rec: any) => 
          rec.ipd_medication_id === med.id && 
          rec.status === "given" &&
          rec.scheduled_time?.startsWith(scheduledTime.slice(0, 16))
      );
    });

    return {
      id: med.id,
      name: med.medicine?.name || med.medicine_name || "Unknown Medication",
      dosage: med.dosage || "",
      route: med.route?.toUpperCase() || "Oral",
      frequency: med.frequency || "OD",
      times,
      administered,
      notes: med.special_instructions || "",
      isPRN: med.is_prn,
      prnIndication: med.prn_indication,
      prescribedBy: med.prescribed_by_profile?.full_name || "Doctor",
      startDate: med.start_date,
      endDate: med.end_date,
    };
  });

  const getStatusBadge = (administered: boolean[], times: string[]) => {
    const total = times.length;
    const given = administered.filter(Boolean).length;
    if (given === total) return <Badge className="bg-success text-success-foreground">Complete</Badge>;
    if (given > 0) return <Badge className="bg-warning text-warning-foreground">Partial ({given}/{total})</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medication Chart"
        description="View and manage patient medication schedules - medications are prescribed by doctors"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select admitted patient" />
            </SelectTrigger>
            <SelectContent>
              {activeAdmissions.map((admission) => (
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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Pill className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Medications</p>
                    <p className="text-2xl font-bold">{medications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fully Administered</p>
                    <p className="text-2xl font-bold">
                      {medications.filter((m: any) => m.administered.every(Boolean)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {medications.filter((m: any) => !m.administered.every(Boolean)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {selectedAdmissionData?.patient?.first_name} {selectedAdmissionData?.patient?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bed: {selectedAdmissionData?.bed?.bed_number}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Today's Medication Schedule - {format(new Date(), "dd MMM yyyy")}
                </CardTitle>
                <Link to={`/app/ipd/admissions/${selectedAdmission}`}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    View Admission
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {medsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : medications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No medications prescribed</p>
                  <p className="text-sm mt-1">
                    Doctors can prescribe medications from the{" "}
                    <Link to={`/app/ipd/admissions/${selectedAdmission}`} className="text-primary hover:underline">
                      patient's admission page
                    </Link>
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med: any) => (
                      <TableRow key={med.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{med.name}</p>
                            {med.dosage && <p className="text-sm text-muted-foreground">{med.dosage}</p>}
                            {med.isPRN && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                PRN {med.prnIndication && `- ${med.prnIndication}`}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={med.route === "IV" ? "default" : "outline"}>
                            {med.route}
                          </Badge>
                        </TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {med.times.map((time: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Checkbox checked={med.administered[idx]} disabled />
                                <span className={med.administered[idx] ? "line-through text-muted-foreground" : ""}>
                                  {time}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(med.administered, med.times)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {med.prescribedBy}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {med.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Info note for nurses */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p><strong>For Nurses:</strong> To administer medications, go to the{" "}
                    <Link to="/app/ipd/nursing-station" className="text-primary hover:underline">
                      Nursing Station
                    </Link>{" "}
                    and use the eMAR (Electronic Medication Administration Record).
                  </p>
                  <p className="mt-1">
                    <strong>For Doctors:</strong> To prescribe new medications, visit the{" "}
                    <Link to={`/app/ipd/admissions/${selectedAdmission}`} className="text-primary hover:underline">
                      admission detail page
                    </Link>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MedicationChartPage;
