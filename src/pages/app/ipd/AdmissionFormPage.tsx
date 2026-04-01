import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdmission } from "@/hooks/useAdmissions";
import { useWards, useBeds } from "@/hooks/useIPD";
import { usePatients } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateIPDDeposit } from "@/hooks/useIPDDeposit";
import { useIPDBedTypeRates } from "@/hooks/useIPDBedTypeRates";
import { useSurgeryRequest, useUpdateSurgeryRequest } from "@/hooks/useSurgeryRequests";
import { AdmissionPaymentDialog } from "@/components/ipd/AdmissionPaymentDialog";
import { BedRateDisplay } from "@/components/ipd/BedRateDisplay";
import { PaymentModeSelector, PaymentMode } from "@/components/ipd/PaymentModeSelector";
import { IPDBedPickerDialog, IPDBedSelection } from "@/components/ipd/IPDBedPickerDialog";
import { AppointmentInsuranceCheck } from "@/components/appointments/AppointmentInsuranceCheck";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, CalendarIcon, Search, Bed, Scissors, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const admissionFormSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  admission_date: z.date(),
  admission_time: z.string().min(1, "Admission time is required"),
  admission_type: z.enum(["emergency", "elective", "transfer", "referral"]),
  payment_mode: z.enum(["cash", "insurance", "corporate", "government"]).default("cash"),
  ward_id: z.string().min(1, "Ward is required"),
  bed_id: z.string().optional(),
  attending_doctor_id: z.string().optional(),
  admitting_doctor_id: z.string().optional(),
  chief_complaint: z.string().optional(),
  diagnosis_on_admission: z.string().optional(),
  history_of_present_illness: z.string().optional(),
  clinical_notes: z.string().optional(),
  deposit_amount: z.coerce.number().min(0).optional(),
  expected_discharge_date: z.date().optional(),
  // Insurance fields
  insurance_policy_number: z.string().optional(),
  authorization_number: z.string().optional(),
  // Corporate fields
  credit_limit: z.coerce.number().optional(),
});

type AdmissionFormValues = z.infer<typeof admissionFormSchema>;

export default function AdmissionFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdFromUrl = searchParams.get("patientId");
  const surgeryRequestId = searchParams.get("surgeryRequestId");
  const { profile } = useAuth();
  const { mutateAsync: createAdmission, isPending: isCreatingAdmission } = useCreateAdmission();
  const { data: wards } = useWards();
  const { data: beds } = useBeds();
  const { data: patients } = usePatients();
  const { data: doctors } = useDoctors();
  const { data: bedTypeRates } = useIPDBedTypeRates();
  const { data: surgeryRequest } = useSurgeryRequest(surgeryRequestId || undefined);
  const updateSurgeryRequest = useUpdateSurgeryRequest();
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [patientSearch, setPatientSearch] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [pendingAdmissionData, setPendingAdmissionData] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [insuranceFields, setInsuranceFields] = useState<{
    providerId?: string;
    policyNumber?: string;
    authorizationNumber?: string;
  }>({});
  const [corporateFields, setCorporateFields] = useState<{
    corporateId?: string;
    employeeId?: string;
    creditLimit?: number;
  }>({});

  const createIPDDeposit = useCreateIPDDeposit();

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: {
      patient_id: patientIdFromUrl || "",
      admission_date: new Date(),
      admission_time: format(new Date(), "HH:mm"),
      admission_type: "elective",
      payment_mode: "cash",
      ward_id: "",
      bed_id: "",
      attending_doctor_id: "",
      admitting_doctor_id: "",
      chief_complaint: "",
      diagnosis_on_admission: "",
      history_of_present_illness: "",
      clinical_notes: "",
      deposit_amount: 0,
    },
  });

  const watchedWard = form.watch("ward_id");

  useEffect(() => {
    if (watchedWard !== selectedWard) {
      setSelectedWard(watchedWard);
      form.setValue("bed_id", "");
    }
  }, [watchedWard, selectedWard, form]);

  const availableBeds = beds?.filter(
    (bed) => bed.ward_id === selectedWard && bed.status === "available"
  ) || [];

  const filteredPatients = patients?.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.patient_number}`
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  ).slice(0, 10);

  const onSubmit = async (values: AdmissionFormValues) => {
    if (!profile?.branch_id) {
      toast.error("Missing branch context");
      return;
    }

    const depositAmount = values.deposit_amount || 0;
    
    // If deposit amount > 0, show payment dialog
    if (depositAmount > 0) {
      setPendingAdmissionData(values);
      setShowPaymentDialog(true);
      return;
    }

    // No deposit - create admission directly with waived status
    await createAdmissionWithPaymentStatus(values, "waived");
  };

  const createAdmissionWithPaymentStatus = async (
    values: AdmissionFormValues,
    paymentStatus: "pending" | "paid" | "partial" | "pay_later" | "waived",
    invoiceId?: string
  ) => {
    try {
      const admission = await createAdmission({
        patient_id: values.patient_id,
        branch_id: profile!.branch_id!,
        admission_date: format(values.admission_date, "yyyy-MM-dd"),
        admission_time: values.admission_time,
        admission_type: values.admission_type,
        ward_id: values.ward_id || undefined,
        bed_id: values.bed_id || undefined,
        attending_doctor_id: values.attending_doctor_id || undefined,
        admitting_doctor_id: values.admitting_doctor_id || undefined,
        chief_complaint: values.chief_complaint || surgeryRequest?.procedure_name || undefined,
        diagnosis_on_admission: values.diagnosis_on_admission || surgeryRequest?.diagnosis || undefined,
        history_of_present_illness: values.history_of_present_illness || undefined,
        clinical_notes: values.clinical_notes || surgeryRequest?.clinical_notes || undefined,
        deposit_amount: values.deposit_amount || undefined,
        expected_discharge_date: values.expected_discharge_date
          ? format(values.expected_discharge_date, "yyyy-MM-dd")
          : undefined,
        payment_status: paymentStatus,
        admission_invoice_id: invoiceId,
      });

      // If this admission is linked to a surgery request, update it
      if (surgeryRequestId && admission) {
        await updateSurgeryRequest.mutateAsync({
          id: surgeryRequestId,
          request_status: "admitted",
          admission_id: admission.id,
        });
      }

      toast.success("Patient admission created successfully");
      
      // If surgery request exists, navigate to OT booking
      if (surgeryRequestId) {
        navigate(`/app/ot/surgeries/new?surgeryRequestId=${surgeryRequestId}`);
      } else {
        navigate("/app/ipd/admissions");
      }
    } catch (error) {
      toast.error("Failed to create admission");
    }
  };

  const handlePaymentComplete = async (paymentData: {
    amount: number;
    paymentMethodId: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    if (!pendingAdmissionData) return;
    
    setIsProcessingPayment(true);
    try {
      const wardInfo = wards?.find((w) => w.id === pendingAdmissionData.ward_id);
      const bedInfo = beds?.find((b) => b.id === pendingAdmissionData.bed_id);

      // Create patient deposit with GL posting (DR Cash, CR Patient Deposits Liability)
      await createIPDDeposit.mutateAsync({
        patientId: pendingAdmissionData.patient_id,
        amount: paymentData.amount,
        paymentMethodId: paymentData.paymentMethodId,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        wardName: wardInfo?.name,
        bedNumber: bedInfo?.bed_number,
        status: "completed",
      });

      // Create admission with paid status (no invoice link needed)
      const paymentStatus = paymentData.amount >= pendingAdmissionData.deposit_amount ? "paid" : "partial";
      await createAdmissionWithPaymentStatus(pendingAdmissionData, paymentStatus);
      
      setShowPaymentDialog(false);
      setPendingAdmissionData(null);
    } catch (_error) {
      toast.error("Failed to process payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePayLater = async () => {
    if (!pendingAdmissionData) return;
    
    setIsProcessingPayment(true);
    try {
      const wardInfo = wards?.find((w) => w.id === pendingAdmissionData.ward_id);
      const bedInfo = beds?.find((b) => b.id === pendingAdmissionData.bed_id);

      // Create pending deposit record (no GL entry — cash not received yet)
      await createIPDDeposit.mutateAsync({
        patientId: pendingAdmissionData.patient_id,
        amount: pendingAdmissionData.deposit_amount,
        wardName: wardInfo?.name,
        bedNumber: bedInfo?.bed_number,
        notes: "Pay Later - Deposit pending collection",
        status: "pending",
      });

      // Create admission with pay_later status
      await createAdmissionWithPaymentStatus(pendingAdmissionData, "pay_later");
      
      setShowPaymentDialog(false);
      setPendingAdmissionData(null);
    } catch (_error) {
      toast.error("Failed to create admission");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSkipDeposit = async () => {
    if (!pendingAdmissionData) return;
    
    // Create admission without deposit
    const modifiedData = { ...pendingAdmissionData, deposit_amount: 0 };
    await createAdmissionWithPaymentStatus(modifiedData, "waived");
    setShowPaymentDialog(false);
    setPendingAdmissionData(null);
  };

  const selectedPatient = patients?.find((p) => p.id === form.watch("patient_id"));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Admission"
        breadcrumbs={[
          { label: "IPD", href: "/app/ipd" },
          { label: "Admissions", href: "/app/ipd/admissions" },
          { label: "New Admission" },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Surgery Request Banner */}
          {surgeryRequest && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Scissors className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-warning">Surgery Recommended</p>
                  <p className="text-sm">
                    <span className="font-medium">{surgeryRequest.procedure_name}</span>
                    {surgeryRequest.diagnosis && ` • ${surgeryRequest.diagnosis}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    After admission, you'll be redirected to schedule the OT.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patient by name or number..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {patientSearch && filteredPatients && filteredPatients.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-muted border-b last:border-b-0",
                        form.watch("patient_id") === patient.id && "bg-primary/10"
                      )}
                      onClick={() => {
                        form.setValue("patient_id", patient.id);
                        setPatientSearch("");
                      }}
                    >
                      <p className="font-medium">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.patient_number} • {patient.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">
                    {selectedPatient.first_name} {selectedPatient.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.patient_number} • {selectedPatient.phone} •{" "}
                    {selectedPatient.gender}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle>Admission Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="admission_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Admission Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admission_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Time *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admission_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Amount</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={0.01} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Mode */}
              <div className="md:col-span-2">
                <PaymentModeSelector
                  value={form.watch("payment_mode") as PaymentMode}
                  onChange={(mode) => form.setValue("payment_mode", mode)}
                  insuranceFields={insuranceFields}
                  onInsuranceFieldsChange={setInsuranceFields}
                  corporateFields={corporateFields}
                  onCorporateFieldsChange={setCorporateFields}
                />
              </div>

              {/* Insurance Eligibility Check - shown when payment_mode is insurance */}
              {form.watch("payment_mode") === "insurance" && selectedPatient && (
                <div className="md:col-span-2 space-y-3">
                  <AppointmentInsuranceCheck patientId={selectedPatient.id} />
                  <Alert className="border-warning/50 bg-warning/10">
                    <ShieldAlert className="h-4 w-4 text-warning" />
                    <AlertDescription className="text-sm">
                      Please verify NPHIES eligibility before confirming admission. Pre-authorization may be required for elective admissions.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ward & Bed */}
          <Card>
            <CardHeader>
              <CardTitle>Ward & Bed Allocation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ward_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ward *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards?.filter((w) => w.is_active).map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name} ({ward.ward_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bed_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedWard}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={selectedWard ? "Select bed" : "Select ward first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableBeds.map((bed) => (
                            <SelectItem key={bed.id} value={bed.id}>
                              <div className="flex items-center gap-2">
                                <span>Bed {bed.bed_number}</span>
                                <span className="text-muted-foreground">({bed.bed_type || "Standard"})</span>
                              </div>
                            </SelectItem>
                          ))}
                          {availableBeds.length === 0 && selectedWard && (
                            <SelectItem value="none" disabled>
                              No available beds in this ward
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowBedPicker(true)}
                        title="Browse all beds"
                      >
                        <Bed className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attending_doctor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attending Doctor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors?.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            Dr. {doctor.profile?.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expected_discharge_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expected Discharge Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bed Rate Display - show when bed is selected */}
              {form.watch("bed_id") && (
                <div className="md:col-span-2">
                  <BedRateDisplay
                    bedType={beds?.find(b => b.id === form.watch("bed_id"))?.bed_type}
                    bedNumber={beds?.find(b => b.id === form.watch("bed_id"))?.bed_number}
                    wardName={wards?.find(w => w.id === form.watch("ward_id"))?.name}
                    bedTypeRates={bedTypeRates}
                    expectedDischargeDate={form.watch("expected_discharge_date")}
                    admissionDate={form.watch("admission_date")}
                    onSuggestedDepositChange={(amount) => {
                      // Only auto-fill if deposit is 0
                      if (!form.watch("deposit_amount")) {
                        form.setValue("deposit_amount", amount);
                      }
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="chief_complaint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chief Complaint</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Patient's main complaint..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis_on_admission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provisional Diagnosis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Diagnosis at admission..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="history_of_present_illness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>History of Present Illness</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed history..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinical_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional clinical notes..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/app/ipd/admissions")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingAdmission || isProcessingPayment}>
              <Save className="h-4 w-4 mr-2" />
              {form.watch("deposit_amount") > 0 ? "Continue to Payment" : "Admit Patient"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Payment Dialog */}
      <AdmissionPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        patientName={selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ""}
        patientNumber={selectedPatient?.patient_number || ""}
        depositAmount={pendingAdmissionData?.deposit_amount || 0}
        wardName={wards?.find(w => w.id === pendingAdmissionData?.ward_id)?.name}
        bedNumber={beds?.find(b => b.id === pendingAdmissionData?.bed_id)?.bed_number}
        onPaymentComplete={handlePaymentComplete}
        onPayLater={handlePayLater}
        onSkipDeposit={handleSkipDeposit}
        isProcessing={isProcessingPayment}
      />

      {/* Visual Bed Picker Dialog */}
      <IPDBedPickerDialog
        open={showBedPicker}
        onOpenChange={setShowBedPicker}
        initialWardId={selectedWard}
        onConfirm={(selection: IPDBedSelection) => {
          form.setValue("ward_id", selection.wardId);
          form.setValue("bed_id", selection.bedId);
          setSelectedWard(selection.wardId);
        }}
      />
    </div>
  );
}
