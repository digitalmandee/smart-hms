import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEmergencyRegistration, useUpdateEmergencyRegistration } from "@/hooks/useEmergency";
import { useDoctors } from "@/hooks/useDoctors";
import { usePrint } from "@/hooks/usePrint";
import { format } from "date-fns";
import { Loader2, Printer, CheckCircle, FileText, Pill, Calendar } from "lucide-react";
import { toast } from "sonner";

const ERDischargeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: registration, isLoading } = useEmergencyRegistration(id);
  const { data: doctors } = useDoctors();
  const updateMutation = useUpdateEmergencyRegistration();
  const { printRef, handlePrint } = usePrint();

  const [formData, setFormData] = useState({
    discharge_instructions: "",
    medications_prescribed: "",
    follow_up_date: "",
    follow_up_doctor_id: "",
    diet_advice: "",
    activity_restrictions: "",
    warning_signs: "",
    disposition_notes: "",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">ER Registration not found</p>
      </div>
    );
  }

  const patientName = registration.patient
    ? `${registration.patient.first_name} ${registration.patient.last_name}`
    : "Unknown Patient";

  const handleSubmit = async () => {
    try {
      await updateMutation.mutateAsync({
        id: registration.id,
        status: "discharged",
        disposition_time: new Date().toISOString(),
        disposition_notes: `
Discharge Instructions: ${formData.discharge_instructions}
Medications: ${formData.medications_prescribed}
Follow-up: ${formData.follow_up_date ? format(new Date(formData.follow_up_date), "PPP") : "As needed"}
Diet: ${formData.diet_advice}
Activity: ${formData.activity_restrictions}
Warning Signs: ${formData.warning_signs}
Notes: ${formData.disposition_notes}
        `.trim(),
      });

      toast.success("Patient discharged successfully");
      navigate(`/app/emergency/${id}`);
    } catch (error) {
      toast.error("Failed to discharge patient");
    }
  };

  const handlePrintSummary = () => {
    handlePrint({ title: "ER Discharge Summary" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ER Discharge"
        description={`Discharge ${patientName} - ${registration.er_number}`}
        breadcrumbs={[
          { label: "Emergency", href: "/app/emergency" },
          { label: registration.er_number, href: `/app/emergency/${id}` },
          { label: "Discharge" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discharge Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Discharge Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>General Instructions</Label>
                <Textarea
                  placeholder="Enter detailed discharge instructions for the patient..."
                  value={formData.discharge_instructions}
                  onChange={(e) => setFormData({ ...formData, discharge_instructions: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Warning Signs to Watch For</Label>
                <Textarea
                  placeholder="List symptoms that require immediate medical attention..."
                  value={formData.warning_signs}
                  onChange={(e) => setFormData({ ...formData, warning_signs: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medications Prescribed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="List all medications with dosage, frequency, and duration..."
                value={formData.medications_prescribed}
                onChange={(e) => setFormData({ ...formData, medications_prescribed: e.target.value })}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Follow-up Care
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Follow-up Doctor</Label>
                  <Select
                    value={formData.follow_up_doctor_id}
                    onValueChange={(value) => setFormData({ ...formData, follow_up_doctor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors?.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          Dr. {doc.profile?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Diet Advice</Label>
                <Textarea
                  placeholder="Dietary recommendations..."
                  value={formData.diet_advice}
                  onChange={(e) => setFormData({ ...formData, diet_advice: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Activity Restrictions</Label>
                <Textarea
                  placeholder="Any activity limitations..."
                  value={formData.activity_restrictions}
                  onChange={(e) => setFormData({ ...formData, activity_restrictions: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional notes about the discharge..."
                value={formData.disposition_notes}
                onChange={(e) => setFormData({ ...formData, disposition_notes: e.target.value })}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">ER Number</p>
                <p className="font-mono font-bold">{registration.er_number}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{patientName}</p>
              </div>
              {registration.patient?.patient_number && (
                <div>
                  <p className="text-sm text-muted-foreground">MRN</p>
                  <p className="font-mono">{registration.patient.patient_number}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Arrival</p>
                <p>{format(new Date(registration.arrival_time), "PPp")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chief Complaint</p>
                <p>{registration.chief_complaint || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Discharge
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handlePrintSummary}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate(`/app/emergency/${id}`)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Discharge Summary */}
      <div className="hidden">
        <div ref={printRef} className="p-8 bg-white text-black" style={{ width: "210mm" }}>
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold">EMERGENCY DEPARTMENT</h1>
            <h2 className="text-xl">DISCHARGE SUMMARY</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>ER Number:</strong> {registration.er_number}</p>
              <p><strong>Patient:</strong> {patientName}</p>
              {registration.patient?.patient_number && (
                <p><strong>MRN:</strong> {registration.patient.patient_number}</p>
              )}
            </div>
            <div>
              <p><strong>Arrival:</strong> {format(new Date(registration.arrival_time), "PPp")}</p>
              <p><strong>Discharge:</strong> {format(new Date(), "PPp")}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold border-b mb-2">Chief Complaint</h3>
            <p>{registration.chief_complaint || "N/A"}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold border-b mb-2">Discharge Instructions</h3>
            <p className="whitespace-pre-wrap">{formData.discharge_instructions || "N/A"}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold border-b mb-2">Medications</h3>
            <p className="whitespace-pre-wrap">{formData.medications_prescribed || "None"}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold border-b mb-2">Warning Signs</h3>
            <p className="whitespace-pre-wrap">{formData.warning_signs || "N/A"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-bold border-b mb-2">Diet Advice</h3>
              <p>{formData.diet_advice || "Regular diet"}</p>
            </div>
            <div>
              <h3 className="font-bold border-b mb-2">Activity</h3>
              <p>{formData.activity_restrictions || "No restrictions"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold border-b mb-2">Follow-up</h3>
            <p>{formData.follow_up_date ? format(new Date(formData.follow_up_date), "PPP") : "As needed"}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-black pt-2">Patient/Attendant Signature</div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2">Doctor's Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERDischargeFormPage;
