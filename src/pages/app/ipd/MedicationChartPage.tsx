import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdmissions } from "@/hooks/useAdmissions";
import { Pill, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const MedicationChartPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");
  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  // Mock medication schedule - would come from prescriptions in production
  const medications = selectedAdmission ? [
    { 
      id: "1", 
      name: "Paracetamol 500mg", 
      route: "Oral", 
      frequency: "TDS",
      times: ["08:00", "14:00", "20:00"],
      administered: [true, true, false],
      notes: "After meals"
    },
    { 
      id: "2", 
      name: "Amoxicillin 500mg", 
      route: "Oral", 
      frequency: "BD",
      times: ["08:00", "20:00"],
      administered: [true, false],
      notes: ""
    },
    { 
      id: "3", 
      name: "Omeprazole 20mg", 
      route: "Oral", 
      frequency: "OD",
      times: ["08:00"],
      administered: [true],
      notes: "Before breakfast"
    },
    { 
      id: "4", 
      name: "Normal Saline 500ml", 
      route: "IV", 
      frequency: "Continuous",
      times: ["Running"],
      administered: [true],
      notes: "100ml/hr"
    },
  ] : [];

  const getStatusBadge = (administered: boolean[], times: string[]) => {
    const total = times.length;
    const given = administered.filter(Boolean).length;
    if (given === total) return <Badge className="bg-green-500">Complete</Badge>;
    if (given > 0) return <Badge className="bg-yellow-500">Partial ({given}/{total})</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medication Chart"
        description="View and manage patient medication schedules"
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
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Administered</p>
                    <p className="text-2xl font-bold">
                      {medications.filter(m => m.administered.every(Boolean)).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {medications.filter(m => !m.administered.every(Boolean)).length}
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
              </div>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No medications prescribed</p>
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
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>
                          <Badge variant={med.route === "IV" ? "default" : "outline"}>
                            {med.route}
                          </Badge>
                        </TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {med.times.map((time, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <Checkbox checked={med.administered[idx]} />
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
                        <TableCell className="text-muted-foreground">
                          {med.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MedicationChartPage;
