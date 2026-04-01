import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { SessionStatusBanner } from "@/components/billing/SessionStatusBanner";
import { 
  UserPlus, Search, Stethoscope, CreditCard, Ticket, 
  Printer, Check, Users, Phone, Receipt
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

export default function ClinicTokenPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Session requirement for payment collection
  const { hasActiveSession, session } = useRequireSession("reception");
  
  // Step state
  const [step, setStep] = useState<"patient" | "doctor" | "payment" | "complete">("patient");
  
  // Patient state
  const [searchMode, setSearchMode] = useState<"search" | "new">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  
  // New patient form
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "male" as "male" | "female" | "other" | "child",
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
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
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

  // Fetch today's queue counts for all doctors
  const { data: todayAppointments } = useQuery({
    queryKey: ['today-queue-counts', profile?.branch_id],
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

  // Get today's queue count for each doctor (real count from appointments)
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

  const handlePatientSelect = (patient: { id: string; first_name: string; last_name: string }) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(`${patient.first_name} ${patient.last_name}`);
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
      setStep("doctor");
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDoctorSelect = (doctor: NonNullable<typeof doctors>[0]) => {
    const fee = (doctor as any).consultation_fee || 500; // Default fee if not set
    setSelectedDoctor({
      id: doctor.id,
      name: `Dr. ${doctor.profile?.full_name || "Unknown"}`,
      specialty: doctor.specialization || "General",
      fee,
      queueCount: getDoctorQueueCount(doctor.id),
    });
    setStep("payment");
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
        description: `Amount received (Rs. ${receivedAmount}) is less than fee (Rs. ${selectedDoctor.fee})`,
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
      // 1. Create Invoice with consultation fee
      const invoice = await createInvoice.mutateAsync({
        patientId: selectedPatientId,
        branchId: profile.branch_id,
        items: [{
          description: `${selectedDoctor.specialty} Consultation - ${selectedDoctor.name}`,
          quantity: 1,
          unit_price: selectedDoctor.fee,
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
        notes: `Token payment via ${paymentMethod}`,
      });

      // 3. Create Appointment with checked_in status
      const appointment = await createAppointment.mutateAsync({
        patient_id: selectedPatientId,
        doctor_id: selectedDoctor.id,
        branch_id: profile.branch_id,
        appointment_date: format(new Date(), "yyyy-MM-dd"),
        appointment_time: format(new Date(), "HH:mm"),
        appointment_type: "walk_in",
        status: "checked_in",
        chief_complaint: "Consultation",
      });

      setTokenNumber(appointment.token_number || 0);
      setInvoiceNumber(invoice.invoice_number);
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
  } : { name: 'Clinic' };

  const handleNewToken = () => {
    // Reset all state
    setStep("patient");
    setSearchMode("search");
    setSearchQuery("");
    setSelectedPatientId(null);
    setSelectedPatientName("");
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
    setInvoiceNumber(null);
    setShowPrintDialog(false);
  };

  const change = selectedDoctor 
    ? Math.max(0, (parseFloat(amountReceived) || 0) - selectedDoctor.fee)
    : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Token Counter"
        description="Issue tokens for patient consultations"
      />

      {/* Session Status Banner - Payment requires active session */}
      <SessionStatusBanner counterType="reception" />

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 p-4">
        {["patient", "doctor", "payment", "complete"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : ["patient", "doctor", "payment", "complete"].indexOf(step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            {i < 3 && (
              <div
                className={`w-12 h-0.5 ${
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
                <Label htmlFor="search">Search Existing</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">New Patient</Label>
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
                    className="pl-10"
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
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {patient.patient_number} • {patient.phone}
                            </p>
                          </div>
                          <Badge variant="outline">{patient.gender}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length > 2 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No patients found. Try a different search or register a new patient.
                  </p>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
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
                      <SelectTrigger id="gender">
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
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) =>
                        setNewPatient({ ...newPatient, age: e.target.value })
                      }
                      placeholder="Years"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleNewPatientSubmit}
                  disabled={createPatient.isPending}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register & Continue
                </Button>
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
            <CardDescription>
              Patient: <strong>{selectedPatientName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {doctorsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors?.map((doctor) => {
                  const fee = (doctor as any).consultation_fee || 500;
                  const queueCount = getDoctorQueueCount(doctor.id);

                  return (
                    <div
                      key={doctor.id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            Dr. {doctor.profile?.full_name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialization || "General"}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          Queue: {queueCount}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-primary">
                        Rs. {fee.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex justify-start">
              <Button variant="outline" onClick={() => setStep("patient")}>
                ← Back to Patient
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
            <CardDescription>
              Patient: <strong>{selectedPatientName}</strong> • 
              Doctor: <strong>{selectedDoctor.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fee Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center text-lg">
                <span>Consultation Fee</span>
                <span className="font-bold">Rs. {selectedDoctor.fee.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "mobile_wallet", label: "JazzCash/Easypaisa" },
                  { value: "upi", label: "Bank Transfer" },
                ].map((method) => (
                  <div key={method.value}>
                    <RadioGroupItem
                      value={method.value}
                      id={method.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={method.value}
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Amount Received */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="received">Amount Received</Label>
                <Input
                  id="received"
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder={selectedDoctor.fee.toString()}
                />
              </div>
              <div>
                <Label>Change</Label>
                <div className="h-10 px-3 py-2 rounded-md border bg-muted flex items-center">
                  Rs. {change.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Reference Number for non-cash */}
            {paymentMethod !== "cash" && (
              <div>
                <Label htmlFor="reference">Reference / Transaction ID</Label>
                <Input
                  id="reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter transaction reference"
                />
              </div>
            )}

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setStep("doctor")}>
                ← Back to Doctor
              </Button>
              <Button
                onClick={handlePaymentComplete}
                disabled={isProcessing}
                size="lg"
              >
                <Ticket className="h-4 w-4 mr-2" />
                Generate Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && tokenNumber && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Token Generated!</h2>
            <div className="text-6xl font-bold text-primary my-6">
              #{tokenNumber}
            </div>
            <p className="text-muted-foreground mb-2">
              Patient: {selectedPatientName} • Doctor: {selectedDoctor?.name}
            </p>
            {invoiceNumber && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Receipt className="h-4 w-4" />
                <span>Invoice: {invoiceNumber} • Rs. {selectedDoctor?.fee?.toLocaleString()} Paid</span>
              </div>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={handlePrintBoth} className="bg-primary">
                <Printer className="h-4 w-4 mr-2" />
                Print Both
              </Button>
              <Button variant="outline" onClick={() => handlePrintToken()}>
                <Ticket className="h-4 w-4 mr-2" />
                Token Only
              </Button>
              <Button variant="outline" onClick={() => handlePrintReceipt()}>
                <Receipt className="h-4 w-4 mr-2" />
                Receipt Only
              </Button>
              <Button onClick={handleNewToken}>
                <UserPlus className="h-4 w-4 mr-2" />
                New Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Printable Components */}
      <div className="hidden">
        <PrintableTokenSlip
          ref={tokenSlipRef}
          tokenNumber={tokenNumber || 0}
          patient={{ name: selectedPatientName }}
          doctor={{ name: selectedDoctor?.name || '', specialty: selectedDoctor?.specialty || '' }}
          invoiceNumber={invoiceNumber || undefined}
          amountPaid={selectedDoctor?.fee}
          paymentMethod={paymentMethod}
          organization={orgData}
        />
        <PrintablePaymentReceipt
          ref={receiptRef}
          invoiceNumber={invoiceNumber || ''}
          patient={{ name: selectedPatientName }}
          items={selectedDoctor ? [{
            description: `${selectedDoctor.specialty} Consultation - ${selectedDoctor.name}`,
            quantity: 1,
            unitPrice: selectedDoctor.fee,
            total: selectedDoctor.fee
          }] : []}
          totalAmount={selectedDoctor?.fee || 0}
          paidAmount={selectedDoctor?.fee || 0}
          paymentMethod={paymentMethod}
          referenceNumber={referenceNumber || undefined}
          organization={orgData}
        />
      </div>
    </div>
  );
}
