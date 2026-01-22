import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PatientSearch } from "@/components/appointments/PatientSearch";
import { OTRoomPicker } from "@/components/ot/OTRoomPicker";
import { OTServicesBuilder } from "@/components/ot/OTServicesBuilder";
import { ArrowLeft, CalendarIcon, Clock, Save, Loader2, BedDouble, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCreateSurgery, useOTRooms, type SurgeryPriority } from "@/hooks/useOT";
import { useDoctors } from "@/hooks/useDoctors";
import { useAuth } from "@/contexts/AuthContext";
import { useBranches } from "@/hooks/useBranches";
import { usePatientActiveAdmission } from "@/hooks/useIPDBilling";
import { OTServiceItem, calculateOTServicesTotal } from "@/hooks/useOTServices";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SurgeryFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  
  // Get prefill values from URL params
  const prefillDate = searchParams.get('date');
  const prefillTime = searchParams.get('time');
  const prefillRoom = searchParams.get('room');
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    prefillDate ? parseISO(prefillDate) : undefined
  );
  const [otServices, setOTServices] = useState<OTServiceItem[]>([]);
  const [formData, setFormData] = useState({
    branchId: profile?.branch_id || "",
    procedureName: "",
    diagnosis: "",
    priority: "elective" as SurgeryPriority,
    leadSurgeonId: "",
    otRoomId: prefillRoom || "",
    scheduledStartTime: prefillTime || "09:00",
    estimatedDuration: "60",
    specialRequirements: "",
  });

  // Check if patient is admitted
  const { data: activeAdmission, isLoading: admissionLoading } = usePatientActiveAdmission(selectedPatient?.id);

  // Update room when rooms load (if prefillRoom is set)
  const { data: branches } = useBranches();
  const { data: doctors } = useDoctors();
  const { data: rooms } = useOTRooms(formData.branchId || undefined);
  
  useEffect(() => {
    if (prefillRoom && rooms?.length) {
      const room = rooms.find(r => r.id === prefillRoom);
      if (room) {
        setFormData(prev => ({ ...prev, otRoomId: prefillRoom }));
      }
    }
  }, [prefillRoom, rooms]);
  
  const createSurgery = useCreateSurgery();

  const surgeons = doctors?.filter(d => 
    d.specialization?.toLowerCase().includes('surg') || 
    d.specialization?.toLowerCase().includes('ortho') ||
    d.specialization?.toLowerCase().includes('neuro') ||
    d.specialization?.toLowerCase().includes('cardio') ||
    d.specialization?.toLowerCase().includes('gynae') ||
    d.specialization?.toLowerCase().includes('ent') ||
    d.specialization?.toLowerCase().includes('uro') ||
    d.specialization?.toLowerCase().includes('plastic')
  ) || doctors;

  const totalOTCharges = calculateOTServicesTotal(otServices);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (!scheduledDate) {
      toast.error("Please select a date");
      return;
    }
    if (!formData.procedureName) {
      toast.error("Please enter procedure name");
      return;
    }
    if (!formData.branchId) {
      toast.error("Please select a branch");
      return;
    }

    try {
      // Create the surgery
      const surgery = await createSurgery.mutateAsync({
        patient_id: selectedPatient.id,
        branch_id: formData.branchId,
        procedure_name: formData.procedureName,
        diagnosis: formData.diagnosis || undefined,
        priority: formData.priority,
        lead_surgeon_id: formData.leadSurgeonId || undefined,
        ot_room_id: formData.otRoomId || undefined,
        scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
        scheduled_start_time: formData.scheduledStartTime,
        estimated_duration_minutes: parseInt(formData.estimatedDuration) || 60,
        special_requirements: formData.specialRequirements || undefined,
        admission_id: activeAdmission?.id, // Auto-link to admission if exists
        is_billable: !!activeAdmission, // Billable if IPD patient
        estimated_cost: totalOTCharges, // Total from services
      });

      // If patient is admitted and has OT services, post charges to IPD
      if (activeAdmission && otServices.length > 0 && surgery) {
        const chargeDate = format(scheduledDate, 'yyyy-MM-dd');
        
        // Post each OT service as a separate IPD charge
        for (const service of otServices) {
          const { error: chargeError } = await supabase
            .from('ipd_charges')
            .insert({
              admission_id: activeAdmission.id,
              charge_date: chargeDate,
              charge_type: 'procedure',
              service_type_id: service.service_type_id,
              description: service.name,
              quantity: service.quantity,
              unit_price: service.unit_price,
              total_amount: service.total,
              is_billed: false,
              added_by: profile?.id,
              surgery_id: surgery.id,
              notes: `Surgery: ${formData.procedureName}`,
            });

          if (chargeError) {
            console.error('Failed to create IPD charge:', chargeError);
          }
        }

        toast.success(`Surgery scheduled with Rs. ${totalOTCharges.toLocaleString()} added to admission bill`);
      }

      navigate("/app/ot/schedule");
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Schedule Surgery"
          description="Book a new surgical procedure"
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
                <CardDescription>Select the patient for surgery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PatientSearch
                  selectedPatient={selectedPatient}
                  onSelect={setSelectedPatient}
                />

                {/* Admission Status Banner */}
                {selectedPatient && !admissionLoading && activeAdmission && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <BedDouble className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-primary">IPD Patient</p>
                        <p className="text-sm text-muted-foreground">
                          Admission: {activeAdmission.admission_number} •{" "}
                          {(activeAdmission.ward as any)?.name} - Bed{" "}
                          {(activeAdmission.bed as any)?.bed_number}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          OT charges will be added to the patient's admission bill
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPD Patient Notice */}
                {selectedPatient && !admissionLoading && !activeAdmission && (
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">OPD Patient</p>
                        <p className="text-sm text-muted-foreground">
                          Patient is not currently admitted. Surgery billing will be handled separately.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Procedure Details */}
            <Card>
              <CardHeader>
                <CardTitle>Procedure Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="procedure">Procedure Name *</Label>
                  <Input
                    id="procedure"
                    placeholder="e.g., Laparoscopic Cholecystectomy"
                    value={formData.procedureName}
                    onChange={(e) => setFormData(prev => ({ ...prev, procedureName: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    placeholder="e.g., Cholelithiasis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Priority *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: SurgeryPriority) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lead Surgeon</Label>
                    <Select
                      value={formData.leadSurgeonId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, leadSurgeonId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select surgeon" />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeons?.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.profile?.full_name} - {doc.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any special equipment, blood products, or preparations needed..."
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* OT Services & Charges - Only show for IPD patients */}
            {activeAdmission && (
              <Card>
                <CardHeader>
                  <CardTitle>OT Services & Charges</CardTitle>
                  <CardDescription>
                    Add services to calculate surgery cost. These will be added to the admission bill.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OTServicesBuilder
                    items={otServices}
                    onChange={setOTServices}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scheduling Sidebar */}
          <div className="space-y-6">
            {/* Branch & OT Room */}
            <Card>
              <CardHeader>
                <CardTitle>OT Room</CardTitle>
                <CardDescription>Select branch and OT room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select
                    value={formData.branchId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value, otRoomId: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches?.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.branchId && (
                  <OTRoomPicker
                    value={formData.otRoomId}
                    onChange={(roomId) => setFormData(prev => ({ ...prev, otRoomId: roomId }))}
                    branchId={formData.branchId}
                    showOnlyAvailable={true}
                  />
                )}
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-9"
                      value={formData.scheduledStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cost Summary - Only show for IPD patients with services */}
            {activeAdmission && otServices.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total OT Charges</p>
                    <p className="text-2xl font-bold text-primary">
                      Rs. {totalOTCharges.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Will be added to admission bill
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={createSurgery.isPending}
            >
              {createSurgery.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Schedule Surgery
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
