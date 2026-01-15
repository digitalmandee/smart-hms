import { useState } from "react";
import { format } from "date-fns";
import { Activity, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useIPDVitals } from "@/hooks/useDailyRounds";
import { IPDVitalsForm } from "@/components/ipd/IPDVitalsForm";

const IPDVitalsPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");
  
  const { data: vitals = [], isLoading } = useIPDVitals(selectedAdmission || undefined);

  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  return (
    <div className="space-y-6">
      <PageHeader
        title="IPD Vitals Chart"
        description="Monitor and record patient vital signs"
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
          <IPDVitalsForm admissionId={selectedAdmission} />
          
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Vitals History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedAdmissionData?.patient?.first_name}{" "}
                  {selectedAdmissionData?.patient?.last_name} - Bed{" "}
                  {selectedAdmissionData?.bed?.bed_number}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading vitals...
                </div>
              ) : vitals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No vitals recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Temp (°F)</TableHead>
                      <TableHead>BP</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>RR</TableHead>
                      <TableHead>SpO2</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vitals.map((vital: any) => (
                      <TableRow key={vital.id}>
                        <TableCell>
                          {format(new Date(vital.recorded_at), "dd MMM HH:mm")}
                        </TableCell>
                        <TableCell>{vital.temperature || "-"}</TableCell>
                        <TableCell>
                          {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                            ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                            : "-"}
                        </TableCell>
                        <TableCell>{vital.pulse || "-"}</TableCell>
                        <TableCell>{vital.respiratory_rate || "-"}</TableCell>
                        <TableCell>{vital.oxygen_saturation || "-"}%</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {vital.notes || "-"}
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

export default IPDVitalsPage;
