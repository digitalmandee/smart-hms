import { useState, useRef } from "react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDoctors } from "@/hooks/useDoctors";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useCreateInvoice, useRecordPayment, usePaymentMethods } from "@/hooks/useBilling";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useOrganization } from "@/hooks/useOrganizations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PrintableTokenSlip } from "@/components/clinic/PrintableTokenSlip";
import { PrintablePaymentReceipt } from "@/components/billing/PrintablePaymentReceipt";
import { FeeWaiverDialog } from "@/components/appointments/FeeWaiverDialog";
import { SessionStatusBanner } from "@/components/billing/SessionStatusBanner";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { 
  UserPlus, Search, Stethoscope, CreditCard, Ticket, 
  Printer, Check, Users, Phone, ArrowLeft, ArrowRight, Clock, ShieldOff
} from "lucide-react";
import { format } from "date-fns";


type PaymentMethod = "cash" | "card" | "mobile_wallet" | "upi";

interface SelectedDoctor {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  queueCount: number;
}

export default function OPDWalkInPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  
  // Session requirement for payment collection
  const { hasActiveSession, session } = useRequireSession("reception");
  
  // Step state
  const [step, setStep] = useState<"patient" | "doctor" | "payment" | "complete">("patient");
  
  // Patient state
  const [searchMode, setSearchMode] = useState<"search" | "new">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [selectedPatientMR, setSelectedPatientMR] = useState<string>("");
  
  // New patient form
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "male" as "male" | "female" | "other",
    age: "",
  });
  
  // Doctor state
  const [selectedDoctor, setSelectedDoctor] = useState<SelectedDoctor | null>(null);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  
  // Result state
  const [tokenNumber, setTokenNumber] = useState<number | null>(null);
  const [tokenDisplay, setTokenDisplay] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showWaiverDialog, setShowWaiverDialog] = useState(false);
  const [paymentStatusResult, setPaymentStatusResult] = useState<"paid" | "pending" | "waived">("paid");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Print refs
  const tokenSlipRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Queries
  const { data: doctors, isLoading: doctorsLoading } = useDoctors();
  const { data: patients, isLoading: patientsLoading } = usePatients();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: organization } = useOrganization(profile?.organization_id);
  const createPatient = useCreatePatient();
  const createAppointment = useCreateAppointment();
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();

  // Fetch consultation service type for commission tracking
  const { data: consultationServiceType } = useQuery({
    queryKey: ["consultation-service-type", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("service_types")
        .select("id")
        .eq("category", "consultation")
        .eq("organization_id", profile!.organization_id!)
        .limit(1)
        .single();
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch today's queue counts for all doctors
  const { data: todayAppointments } = useQuery({
    queryKey: ['opd-queue-counts', profile?.branch_id],
    queryFn: async () => {
      if (!profile?.branch_id) return [];
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('appointments')
        .select('doctor_id')
        .eq('branch_id', profile.branch_id)
        .eq('appointment_date', today)
        .in('status', ['scheduled', 'checked_in', 'in_progress']);
      return data || [];
    },
    enabled: !!profile?.branch_id,
  });

  // Filter patients by search
  const filteredPatients = patients?.filter(p => 
    searchQuery.length > 2 && (
      p.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery) ||
      p.patient_number?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 5);

  // Get today's queue count for each doctor
  const getDoctorQueueCount = (doctorId: string) => {
    return todayAppointments?.filter(a => a.doctor_id === doctorId).length || 0;
  };

  // Get payment method ID from payment type
  const getPaymentMethodId = (type: PaymentMethod): string | undefined => {
    const codeMap: Record<PaymentMethod, string> = {
      cash: 'CASH',
      card: 'CARD',
      mobile_wallet: 'JAZZCASH',
      upi: 'EASYPAISA',
    };
    return paymentMethods?.find(m => m.code === codeMap[type])?.id;
  };

  const handlePatientSelect = (patient: { id: string; first_name: string; last_name: string; patient_number?: string }) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(`${patient.first_name} ${patient.last_name}`);
    setSelectedPatientMR(patient.patient_number || '');
    setStep("doctor");
  };

  const handleNewPatientSubmit = async () => {
    if (!newPatient.first_name || !newPatient.phone) {
      toast({
        title: "Missing Information",
        description: "Please enter at least patient name and phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      const patient = await createPatient.mutateAsync({
        first_name: newPatient.first_name,
        last_name: newPatient.last_name || "",
        phone: newPatient.phone,
        gender: newPatient.gender,
        date_of_birth: newPatient.age 
          ? new Date(new Date().getFullYear() - parseInt(newPatient.age), 0, 1).toISOString().split("T")[0]
          : undefined,
      });

      setSelectedPatientId(patient.id);
      setSelectedPatientName(`${newPatient.first_name} ${newPatient.last_name}`);
      setSelectedPatientMR(patient.patient_number || '');
      setStep("doctor");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDoctorSelect = (doctor: NonNullable<typeof doctors>[0]) => {
    const fee = (doctor as any).consultation_fee || 500;
    setSelectedDoctor({
      id: doctor.id,
      name: `Dr. ${doctor.profile?.full_name || "Unknown"}`,
      specialty: doctor.specialization || "General",
      fee,
      queueCount: getDoctorQueueCount(doctor.id),
    });
    setAmountReceived(fee.toString());
    setStep("payment");
  };

  // Generate token without payment (Pay Later)
  const handlePayLater = async () => {
    if (!selectedPatientId || !selectedDoctor || !profile?.branch_id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create Appointment with pending payment status
      const appointment = await createAppointment.mutateAsync({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctor.id,
        branch_id: profile.branch_id,
        appointment_date: format(new Date(), "yyyy-MM-dd"),
        appointment_time: format(new Date(), "HH:mm"),
        appointment_type: "walk_in",
        status: "scheduled",
        chief_complaint: "OPD Consultation",
        payment_status: "pending",
      });

      setTokenNumber(appointment.token_number || 0);
      setTokenDisplay(appointment.token_display || null);
      setInvoiceNumber(null);
      setPaymentStatusResult("pending");
      setStep("complete");
      setShowPrintDialog(true);
      
      toast({
        title: "Token Generated",
        description: `Token #${appointment.token_number} created. Fee will be collected at checkout.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle fee waiver confirmation
  const handleWaiverConfirm = async (reason: string, notes: string) => {
    if (!selectedPatientId || !selectedDoctor || !profile?.branch_id || !profile?.id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create Appointment with waived payment status
      const appointment = await createAppointment.mutateAsync({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctor.id,
        branch_id: profile.branch_id,
        appointment_date: format(new Date(), "yyyy-MM-dd"),
        appointment_time: format(new Date(), "HH:mm"),
        appointment_type: "walk_in",
        status: "scheduled",
        chief_complaint: "OPD Consultation",
        payment_status: "waived",
      });

      // Update appointment with waiver details
      await supabase
        .from('appointments')
        .update({
          waived_by: profile.id,
          waiver_reason: reason,
          waived_at: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      setTokenNumber(appointment.token_number || 0);
      setTokenDisplay(appointment.token_display || null);
      setInvoiceNumber(null);
      setPaymentStatusResult("waived");
      setStep("complete");
      setShowPrintDialog(true);
      setShowWaiverDialog(false);
      
      toast({
        title: "Token Generated",
        description: `Token #${appointment.token_number} created. Fee has been waived.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentComplete = async () => {
    if (!selectedPatientId || !selectedDoctor || !profile?.branch_id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    const receivedAmount = parseFloat(amountReceived) || selectedDoctor.fee;
    if (receivedAmount < selectedDoctor.fee) {
      toast({
        title: "Insufficient Payment",
        description: `Amount received (${formatCurrency(receivedAmount)}) is less than fee (${formatCurrency(selectedDoctor.fee)})`,
        variant: "destructive",
      });
      return;
    }

    const paymentMethodId = getPaymentMethodId(paymentMethod);
    if (!paymentMethodId) {
      toast({
        title: "Error",
        description: "Payment method not configured. Please contact administrator.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Invoice with consultation fee (include doctor_id for wallet earnings)
      const invoice = await createInvoice.mutateAsync({
        patientId: selectedPatientId,
        branchId: profile.branch_id,
        items: [{
          description: `${selectedDoctor.specialty} Consultation - ${selectedDoctor.name}`,
          quantity: 1,
          unit_price: selectedDoctor.fee,
          doctor_id: selectedDoctor.id,
          service_type_id: consultationServiceType?.id, // Link to consultation service type for commission trigger
        }],
        status: "pending",
      });

      // 2. Record Payment with session link (marks invoice as paid)
      await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        amount: selectedDoctor.fee,
        paymentMethodId,
        billingSessionId: session?.id,
        referenceNumber: referenceNumber || undefined,
        notes: `OPD Walk-in payment via ${paymentMethod}`,
      });

      // 3. Create Appointment with scheduled status (so patient goes through nurse triage)
      const appointment = await createAppointment.mutateAsync({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctor.id,
        branch_id: profile.branch_id,
        appointment_date: format(new Date(), "yyyy-MM-dd"),
        appointment_time: format(new Date(), "HH:mm"),
        appointment_type: "walk_in",
        status: "checked_in",
        chief_complaint: "OPD Consultation",
        payment_status: "paid",
      });

      // Link invoice to appointment AND reinforce payment_status
      const { error: linkError } = await supabase
        .from('appointments')
        .update({ invoice_id: invoice.id, payment_status: 'paid' })
        .eq('id', appointment.id);

      if (linkError) {
        console.error('Failed to link invoice to appointment:', linkError);
      }

      setTokenNumber(appointment.token_number || 0);
      setTokenDisplay(appointment.token_display || null);
      setInvoiceNumber(invoice.invoice_number);
      setPaymentStatusResult("paid");
      setStep("complete");
      setShowPrintDialog(true);
      
      toast({
        title: "Token Generated",
        description: `Token #${appointment.token_number} created with Invoice ${invoice.invoice_number}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintToken = useReactToPrint({
    contentRef: tokenSlipRef,
    documentTitle: `Token-${tokenNumber}`,
  });

  const handlePrintReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${invoiceNumber}`,
  });

  const handlePrintBoth = () => {
    handlePrintToken();
    setTimeout(() => handlePrintReceipt(), 500);
  };

  const orgData = organization ? {
    name: organization.name,
    address: organization.address,
    phone: organization.phone,
    logo_url: organization.logo_url,
    slug: organization.slug,
  } : { name: 'Hospital' };

  const handleNewToken = () => {
    setStep("patient");
    setSearchMode("search");
    setSearchQuery("");
    setSelectedPatientId(null);
    setSelectedPatientName("");
    setSelectedPatientMR("");
    setNewPatient({
      first_name: "",
      last_name: "",
      phone: "",
      gender: "male",
      age: "",
    });
    setSelectedDoctor(null);
    setPaymentMethod("cash");
    setAmountReceived("");
    setReferenceNumber("");
    setTokenNumber(null);
    setTokenDisplay(null);
    setInvoiceNumber(null);
    setShowPrintDialog(false);
  };

  const change = selectedDoctor 
    ? Math.max(0, (parseFloat(amountReceived) || 0) - selectedDoctor.fee)
    : 0;

  const stepLabels = [
    t("opd.walkIn.patient"),
    t("apptForm.doctor"),
    t("apptForm.collectPayment"),
    t("apptForm.tokenGenerated"),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("opd.walkIn.title")}
        description={t("opd.walkIn.description")}
        breadcrumbs={[
          { label: "OPD", href: "/app/opd" },
          { label: t("opd.walkIn.title") },
        ]}
      />

      {/* Session Status Banner - Payment requires active session */}
      <SessionStatusBanner counterType="reception" />
      <div className="flex items-center justify-center gap-2 p-4 bg-card rounded-lg border">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step === ["patient", "doctor", "payment", "complete"][i]
                    ? "bg-primary text-primary-foreground"
                    : ["patient", "doctor", "payment", "complete"].indexOf(step) > i
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {["patient", "doctor", "payment", "complete"].indexOf(step) > i ? (
                  <Check className="h-5 w-5" />
                ) : (
                  i + 1
                )}
              </div>
              <span className="text-xs mt-1 text-muted-foreground">{label}</span>
            </div>
            {i < 3 && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  ["patient", "doctor", "payment", "complete"].indexOf(step) > i
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Patient */}
      {step === "patient" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Step 1: Select or Register Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={searchMode}
              onValueChange={(v) => setSearchMode(v as "search" | "new")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="search" id="search" />
                <Label htmlFor="search">Search Existing Patient</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Quick Register New Patient</Label>
              </div>
            </RadioGroup>

            <Separator />

            {searchMode === "search" ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, or MR#..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-lg"
                    autoFocus
                  />
                </div>

                {patientsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredPatients && filteredPatients.length > 0 ? (
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-lg">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <Badge variant="outline" className="mr-2">{patient.patient_number}</Badge>
                              {patient.phone}
                            </p>
                          </div>
                          <Badge>{patient.gender}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 2 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No patients found matching "{searchQuery}"</p>
                    <Button onClick={() => setSearchMode("new")} variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register New Patient
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Enter at least 3 characters to search
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newPatient.first_name}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, first_name: e.target.value })
                      }
                      placeholder="Enter first name"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newPatient.last_name}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, last_name: e.target.value })
                      }
                      placeholder="Enter last name"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, phone: e.target.value })
                      }
                      placeholder="03XX-XXXXXXX"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newPatient.gender}
                      onValueChange={(v) =>
                        setNewPatient({ ...newPatient, gender: v as "male" | "female" | "other" })
                      }
                    >
                      <SelectTrigger id="gender" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age">Age (Years)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, age: e.target.value })
                      }
                      placeholder="e.g. 35"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSearchMode("search")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Search
                  </Button>
                  <Button 
                    onClick={handleNewPatientSubmit}
                    disabled={createPatient.isPending}
                  >
                    {createPatient.isPending ? "Registering..." : "Register & Continue"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Doctor Selection */}
      {step === "doctor" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Step 2: Select Doctor
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Patient: <strong>{selectedPatientName}</strong> {selectedPatientMR && `(${selectedPatientMR})`}
            </p>
          </CardHeader>
          <CardContent>
            {doctorsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors?.filter(d => d.is_available).map((doctor) => {
                  const fee = (doctor as any).consultation_fee || 500;
                  const queueCount = getDoctorQueueCount(doctor.id);
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Dr. {doctor.profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                        <Badge variant={queueCount > 10 ? "destructive" : queueCount > 5 ? "secondary" : "outline"}>
                          {queueCount} in queue
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-2 border-t">
                        <span className="text-muted-foreground text-sm">Consultation Fee</span>
                        <span className="font-bold text-lg text-primary">Rs. {fee.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-start mt-6">
              <Button variant="outline" onClick={() => setStep("patient")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {step === "payment" && selectedDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Step 3: Collect Payment
            </CardTitle>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Patient: <strong>{selectedPatientName}</strong> {selectedPatientMR && `(${selectedPatientMR})`}</p>
              <p>Doctor: <strong>{selectedDoctor.name}</strong> - {selectedDoctor.specialty}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fee Display */}
            <div className="bg-primary/5 p-6 rounded-lg text-center border-2 border-primary/20">
              <p className="text-muted-foreground mb-1">Consultation Fee</p>
              <p className="text-4xl font-bold text-primary">Rs. {selectedDoctor.fee.toLocaleString()}</p>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-base mb-3 block">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {[
                  { value: "cash", label: "Cash", icon: "💵" },
                  { value: "card", label: "Card", icon: "💳" },
                  { value: "mobile_wallet", label: "JazzCash", icon: "📱" },
                  { value: "upi", label: "EasyPaisa", icon: "📲" },
                ].map((method) => (
                  <div key={method.value}>
                    <RadioGroupItem
                      value={method.value}
                      id={method.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.value}
                      className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-2xl mb-2">{method.icon}</span>
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Amount Received */}
            {paymentMethod === "cash" && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="received">Amount Received</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground">Rs.</span>
                    <Input
                      id="received"
                      type="number"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(e.target.value)}
                      className="pl-12 h-14 text-xl font-bold"
                    />
                  </div>
                </div>
                <div>
                  <Label>Change to Return</Label>
                  <div className="h-14 flex items-center justify-center bg-secondary rounded-md text-xl font-bold text-secondary-foreground">
                    Rs. {change.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Reference Number for digital payments */}
            {(paymentMethod === "mobile_wallet" || paymentMethod === "upi" || paymentMethod === "card") && (
              <div>
                <Label htmlFor="reference">Transaction Reference (Optional)</Label>
                <Input
                  id="reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="h-12"
                />
              </div>
            )}

            <Separator />

            {/* Payment Actions */}
            <div className="space-y-4">
              {/* Alternative payment options */}
              <div className="p-4 rounded-lg border border-dashed bg-muted/30 space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Alternative Options</p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handlePayLater}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Pay Later
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWaiverDialog(true)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Waive Fee
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Pay Later: Fee of Rs. {selectedDoctor.fee.toLocaleString()} will be collected at checkout.
                </p>
              </div>

              {/* Main action buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("doctor")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Doctor
                </Button>
                <Button 
                  size="lg" 
                  onClick={handlePaymentComplete}
                  disabled={isProcessing || !hasActiveSession}
                  className="px-8"
                  title={!hasActiveSession ? "Open a billing session first to collect payments" : undefined}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : !hasActiveSession ? (
                    <>
                      <Ticket className="h-5 w-5 mr-2" />
                      Session Required
                    </>
                  ) : (
                    <>
                      <Ticket className="h-5 w-5 mr-2" />
                      Generate Token & Receipt
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Waiver Dialog */}
      {selectedDoctor && (
        <FeeWaiverDialog
          open={showWaiverDialog}
          onOpenChange={setShowWaiverDialog}
          patient={{
            name: selectedPatientName,
            mrNumber: selectedPatientMR,
          }}
          doctor={{
            name: selectedDoctor.name,
          }}
          fee={selectedDoctor.fee}
          onConfirm={handleWaiverConfirm}
          isProcessing={isProcessing}
        />
      )}

      {/* Step 4: Complete */}
      {step === "complete" && tokenNumber !== null && selectedDoctor && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Token Generated Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-primary/5 p-6 rounded-lg text-center border">
                <p className="text-muted-foreground mb-2">Token Number</p>
                <p className="text-5xl font-bold text-primary">{tokenDisplay || tokenNumber}</p>
              </div>
              <div className="bg-muted p-6 rounded-lg text-center border">
                <p className="text-muted-foreground mb-2">{t("opd.walkIn.paymentStatus")}</p>
                {paymentStatusResult === "paid" ? (
                  <div>
                    <p className="text-xl font-bold text-success">{t("opd.walkIn.paid")}</p>
                    <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
                  </div>
                ) : paymentStatusResult === "pending" ? (
                  <p className="text-xl font-bold text-warning">{t("opd.walkIn.payLaterStatus")}</p>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground">{t("opd.walkIn.waived")}</p>
                )}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("opd.walkIn.patient")}</span>
                <span className="font-medium">{selectedPatientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("opd.walkIn.doctor")}</span>
                <span className="font-medium">{selectedDoctor.name}</span>
              </div>
              {paymentStatusResult === "paid" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("opd.walkIn.amountPaid")}</span>
                    <span className="font-medium text-primary">Rs. {selectedDoctor.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("opd.walkIn.paymentMethod")}</span>
                    <span className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</span>
                  </div>
                </>
              )}
              {paymentStatusResult === "pending" && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-warning font-medium">{t("opd.walkIn.feePending")}</span>
                  <span className="font-bold text-warning">Rs. {selectedDoctor.fee.toLocaleString()}</span>
                </div>
              )}
              {paymentStatusResult === "waived" && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground font-medium">{t("opd.walkIn.feeWaived")}</span>
                  <span className="line-through text-muted-foreground">Rs. {selectedDoctor.fee.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={handlePrintToken}>
                <Printer className="h-4 w-4 me-2" />
                {t("opd.walkIn.printToken")}
              </Button>
              <Button variant="outline" onClick={handlePrintReceipt}>
                <Printer className="h-4 w-4 me-2" />
                {t("opd.walkIn.printReceipt")}
              </Button>
              <Button onClick={handlePrintBoth}>
                <Printer className="h-4 w-4 me-2" />
                {t("opd.walkIn.printBoth")}
              </Button>
            </div>

            <Separator />

            <div className="flex justify-center">
              <Button size="lg" onClick={handleNewToken} className="px-8">
                <UserPlus className="h-5 w-5 me-2" />
                {t("opd.walkIn.registerNextPatient")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Print Templates */}
      <div className="hidden">
        <PrintableTokenSlip
          ref={tokenSlipRef}
          tokenNumber={tokenNumber || 0}
          tokenDisplay={tokenDisplay || undefined}
          appointmentDate={format(new Date(), "yyyy-MM-dd")}
          patient={{
            name: selectedPatientName,
            mrNumber: selectedPatientMR,
          }}
          doctor={{
            name: selectedDoctor?.name || '',
            specialty: selectedDoctor?.specialty || '',
          }}
          invoiceNumber={invoiceNumber || ''}
          amountPaid={paymentStatusResult === "paid" ? selectedDoctor?.fee : 0}
          paymentMethod={paymentStatusResult === "paid" ? paymentMethod : undefined}
          paymentStatus={paymentStatusResult}
          organization={orgData}
        />
        <PrintablePaymentReceipt
          ref={receiptRef}
          invoiceNumber={invoiceNumber || ''}
          patient={{
            name: selectedPatientName,
            mrNumber: selectedPatientMR,
          }}
          items={[{
            description: `${selectedDoctor?.specialty || ''} Consultation - ${selectedDoctor?.name || ''}`,
            quantity: 1,
            unitPrice: selectedDoctor?.fee || 0,
            total: selectedDoctor?.fee || 0,
          }]}
          subtotal={selectedDoctor?.fee || 0}
          totalAmount={selectedDoctor?.fee || 0}
          paidAmount={selectedDoctor?.fee || 0}
          paymentMethod={paymentMethod}
          referenceNumber={referenceNumber}
          organization={orgData}
        />
      </div>
    </div>
  );
}
