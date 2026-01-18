import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Stethoscope, Loader2, Save, CreditCard } from "lucide-react";
import { useAllDoctors } from "@/hooks/useDoctors";
import { useDoctorFeeSchedule, useUpdateDoctorFees } from "@/hooks/useConfiguration";

const APPOINTMENT_TYPES = [
  { value: "new_consultation", label: "New Consultation" },
  { value: "follow_up", label: "Follow-up" },
  { value: "urgent", label: "Urgent/Priority" },
  { value: "emergency", label: "Emergency" },
  { value: "home_visit", label: "Home Visit" },
  { value: "telemedicine", label: "Telemedicine" },
];

export default function DoctorFeesPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [fees, setFees] = useState<Record<string, number>>({});

  const { data: doctors, isLoading: doctorsLoading } = useAllDoctors();
  const { data: feeSchedule, isLoading: feesLoading } = useDoctorFeeSchedule(selectedDoctorId);
  const updateFees = useUpdateDoctorFees();

  // When fee schedule loads, populate the fees state
  const currentFees = feeSchedule?.reduce((acc, f) => {
    acc[f.appointment_type] = f.fee;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleFeeChange = (appointmentType: string, value: string) => {
    setFees(prev => ({
      ...currentFees,
      ...prev,
      [appointmentType]: parseFloat(value) || 0,
    }));
  };

  const handleSave = async () => {
    if (!selectedDoctorId) return;
    
    const mergedFees = { ...currentFees, ...fees };
    const feeArray = Object.entries(mergedFees)
      .filter(([_, fee]) => fee > 0)
      .map(([appointment_type, fee]) => ({ appointment_type, fee }));
    
    await updateFees.mutateAsync({ doctorId: selectedDoctorId, fees: feeArray });
    setFees({});
  };

  const selectedDoctor = doctors?.find(d => d.id === selectedDoctorId);

  return (
    <div>
      <PageHeader
        title="Doctor Fee Configuration"
        description="Configure consultation fees for each doctor by appointment type"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Doctor Fees" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Fee Schedule
            </CardTitle>
            <CardDescription>
              Set fees for different appointment types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label>Select Doctor</Label>
              <Select value={selectedDoctorId} onValueChange={(v) => { setSelectedDoctorId(v); setFees({}); }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choose a doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.profile?.full_name} - {doc.specialization || "General"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDoctorId ? (
              feesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Appointment Type</TableHead>
                        <TableHead className="w-[200px]">Fee (Rs.)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {APPOINTMENT_TYPES.map((type) => (
                        <TableRow key={type.value}>
                          <TableCell className="font-medium">{type.label}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={fees[type.value] ?? currentFees[type.value] ?? ""}
                              onChange={(e) => handleFeeChange(type.value, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={updateFees.isPending}>
                      {updateFees.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Save Fees
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select a doctor to configure fees
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Doctor Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDoctor ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedDoctor.profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{selectedDoctor.specialization || "General"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Qualification</p>
                  <p className="font-medium">{selectedDoctor.qualification || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Default Consultation Fee</p>
                  <p className="font-medium">
                    Rs. {selectedDoctor.consultation_fee?.toLocaleString() || "Not set"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Select a doctor to view details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
