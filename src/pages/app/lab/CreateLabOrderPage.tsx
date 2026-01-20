import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LabOrderBuilder } from "@/components/consultation/LabOrderBuilder";
import { usePatients } from "@/hooks/usePatients";
import { useCreateLabOrder, type LabOrderItemInput } from "@/hooks/useLabOrders";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, User, ArrowLeft, Loader2 } from "lucide-react";

export default function CreateLabOrderPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    patient_number: string;
    phone?: string | null;
    date_of_birth?: string | null;
    gender?: string | null;
  } | null>(null);
  const [openPatientSearch, setOpenPatientSearch] = useState(false);
  
  const [labItems, setLabItems] = useState<LabOrderItemInput[]>([]);
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("routine");
  const [clinicalNotes, setClinicalNotes] = useState("");

  const { data: patients = [], isLoading: patientsLoading } = usePatients(patientSearch);
  const createLabOrder = useCreateLabOrder();

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (labItems.length === 0) {
      toast.error("Please add at least one lab test");
      return;
    }

    if (!profile?.branch_id) {
      toast.error("Branch not configured");
      return;
    }

    try {
      await createLabOrder.mutateAsync({
        labOrder: {
          patient_id: selectedPatient.id,
          branch_id: profile.branch_id,
          priority,
          clinical_notes: clinicalNotes || undefined,
        },
        items: labItems,
      });

      toast.success("Lab order created successfully");
      navigate("/app/lab/queue");
    } catch (error) {
      console.error("Error creating lab order:", error);
      toast.error("Failed to create lab order");
    }
  };

  const calculateAge = (dob: string | null | undefined) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age}y`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Lab Order"
        description="Order lab tests directly without consultation"
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient Selection & Notes */}
        <div className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Select Patient
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPatient ? (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {selectedPatient.first_name} {selectedPatient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.patient_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(selectedPatient.date_of_birth)} • {selectedPatient.gender || "N/A"}
                      </p>
                      {selectedPatient.phone && (
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.phone}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <Popover open={openPatientSearch} onOpenChange={setOpenPatientSearch}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-start"
                    >
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      Search patient...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search by name, phone, patient number..."
                        value={patientSearch}
                        onValueChange={setPatientSearch}
                      />
                      <CommandList>
                        {patientsLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No patient found</CommandEmpty>
                            <CommandGroup>
                              {patients.slice(0, 10).map((patient) => (
                                <CommandItem
                                  key={patient.id}
                                  value={`${patient.first_name} ${patient.last_name} ${patient.patient_number}`}
                                  onSelect={() => {
                                    setSelectedPatient(patient);
                                    setOpenPatientSearch(false);
                                    setPatientSearch("");
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {patient.first_name} {patient.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {patient.patient_number} • {patient.phone}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              <Button
                variant="link"
                className="px-0"
                onClick={() => navigate("/app/patients/new")}
              >
                + Register New Patient
              </Button>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Clinical Notes (Optional)</Label>
                <Textarea
                  placeholder="Any relevant clinical information for the lab..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Lab Order Builder */}
        <div className="lg:col-span-2 space-y-6">
          <LabOrderBuilder
            items={labItems}
            onChange={setLabItems}
            priority={priority}
            onPriorityChange={setPriority}
            notes={clinicalNotes}
            onNotesChange={setClinicalNotes}
          />

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedPatient || labItems.length === 0 || createLabOrder.isPending}
            >
              {createLabOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lab Order"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
