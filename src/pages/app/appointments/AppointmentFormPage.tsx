import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PatientSearch } from '@/components/appointments/PatientSearch';
import { TimeSlotPicker } from '@/components/appointments/TimeSlotPicker';
import { useCreateAppointment, useUpdateAppointment, useAppointment } from '@/hooks/useAppointments';
import { useDoctors } from '@/hooks/useDoctors';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateInvoice, useRecordPayment, usePaymentMethods } from '@/hooks/useBilling';
import { useOrganization } from '@/hooks/useOrganizations';
import { PaymentMethodSelector } from '@/components/billing/PaymentMethodSelector';
import { PrintableTokenSlip } from '@/components/clinic/PrintableTokenSlip';
import { usePrint } from '@/hooks/usePrint';
import { Clock, Users, CheckCircle, Printer, Banknote } from 'lucide-react';

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Please select a patient'),
  doctor_id: z.string().min(1, 'Please select a doctor'),
  branch_id: z.string().min(1, 'Please select a branch'),
  appointment_date: z.string().min(1, 'Please select a date'),
  appointment_time: z.string().optional(),
  appointment_type: z.enum(['walk_in', 'scheduled', 'follow_up', 'emergency']),
  chief_complaint: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Time slot is required for scheduled and follow_up appointments
  if (data.appointment_type === 'scheduled' || data.appointment_type === 'follow_up') {
    return !!data.appointment_time && data.appointment_time.length > 0;
  }
  return true;
}, {
  message: 'Please select a time slot',
  path: ['appointment_time'],
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function AppointmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { profile } = useAuth();
  const isEditing = !!id;

  // Pre-fill from URL params (from calendar click)
  const prefillDate = searchParams.get('date');
  const prefillTime = searchParams.get('time');
  const prefillDoctor = searchParams.get('doctor');

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Pay-first workflow state
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AppointmentFormData | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedData, setCompletedData] = useState<{
    tokenNumber: number;
    invoiceNumber?: string;
    amountPaid?: number;
    paymentMethodName?: string;
    isPaid: boolean;
  } | null>(null);
  
  // Print ref
  const { printRef, handlePrint } = usePrint();

  const { data: existingAppointment, isLoading: loadingAppointment } = useAppointment(id || '');
  const { data: doctors } = useDoctors();
  const { data: branches } = useBranches();
  const { data: organization } = useOrganization(profile?.organization_id);
  const { data: paymentMethods } = usePaymentMethods();

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: '',
      doctor_id: '',
      branch_id: profile?.branch_id || '',
      appointment_date: format(new Date(), 'yyyy-MM-dd'),
      appointment_time: '',
      appointment_type: 'scheduled',
      chief_complaint: '',
      notes: '',
    },
  });

  // Update form when editing
  useEffect(() => {
    if (existingAppointment && isEditing) {
      form.reset({
        patient_id: existingAppointment.patient_id,
        doctor_id: existingAppointment.doctor_id || '',
        branch_id: existingAppointment.branch_id,
        appointment_date: existingAppointment.appointment_date,
        appointment_time: existingAppointment.appointment_time || '',
        appointment_type: existingAppointment.appointment_type || 'scheduled',
        chief_complaint: existingAppointment.chief_complaint || '',
        notes: existingAppointment.notes || '',
      });
      if (existingAppointment.patient) {
        setSelectedPatient(existingAppointment.patient);
      }
    }
  }, [existingAppointment, isEditing, form]);

  // Pre-fill from URL params (calendar click-to-book)
  // Wait for doctors to load before setting doctor_id to ensure dropdown shows selection
  useEffect(() => {
    if (!isEditing && doctors && doctors.length > 0) {
      if (prefillDate) form.setValue('appointment_date', prefillDate);
      // Time will be handled by TimeSlotPicker's initialSlot prop
      if (prefillDoctor) {
        // Verify doctor exists before setting
        const doctorExists = doctors.some(d => d.id === prefillDoctor);
        if (doctorExists) {
          form.setValue('doctor_id', prefillDoctor);
        }
      }
    }
  }, [prefillDate, prefillDoctor, isEditing, form, doctors]);

  const selectedDoctorId = form.watch('doctor_id');
  const selectedDate = form.watch('appointment_date');
  const appointmentType = form.watch('appointment_type');

  // Get selected doctor details for fee
  const selectedDoctor = doctors?.find(d => d.id === selectedDoctorId);
  const consultationFee = (selectedDoctor as any)?.consultation_fee || 500;
  const selectedPaymentMethod = paymentMethods?.find(p => p.id === paymentMethodId);

  // Check if time slot selection is needed
  const requiresTimeSlot = appointmentType === 'scheduled' || appointmentType === 'follow_up';
  
  // Check if pay-first workflow is needed
  const requiresPayFirst = !isEditing && (appointmentType === 'walk_in' || appointmentType === 'emergency');

  // Clear time when switching to walk-in/emergency
  useEffect(() => {
    if (!requiresTimeSlot) {
      form.setValue('appointment_time', '');
    }
  }, [requiresTimeSlot, form]);

  const onSubmit = async (data: AppointmentFormData) => {
    // For walk-in and emergency, show payment step first
    if (requiresPayFirst) {
      setPendingFormData(data);
      setShowPaymentStep(true);
      return;
    }
    
    // Normal scheduled/follow-up appointment flow
    try {
      if (isEditing && id) {
        await updateAppointment.mutateAsync({ id, ...data });
        toast({ title: 'Appointment updated successfully' });
      } else {
        await createAppointment.mutateAsync({
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          branch_id: data.branch_id,
          appointment_date: data.appointment_date,
          appointment_time: data.appointment_time || null,
          appointment_type: data.appointment_type,
          chief_complaint: data.chief_complaint || null,
          notes: data.notes || null,
        });
        toast({ title: 'Appointment created successfully' });
      }
      navigate('/app/appointments');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle payment and create appointment for walk-in/emergency
  const handlePaymentAndCreate = async () => {
    if (!pendingFormData || !paymentMethodId || !profile?.branch_id) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create Invoice with consultation fee
      const invoice = await createInvoice.mutateAsync({
        patientId: pendingFormData.patient_id,
        branchId: pendingFormData.branch_id,
        items: [{
          description: `${selectedDoctor?.specialization || 'Doctor'} Consultation - Dr. ${selectedDoctor?.profile?.full_name || 'Unknown'}`,
          quantity: 1,
          unit_price: consultationFee,
        }],
        status: "pending",
      });

      // 2. Record Payment (marks invoice as paid)
      await recordPayment.mutateAsync({
        invoiceId: invoice.id,
        amount: consultationFee,
        paymentMethodId,
        referenceNumber: referenceNumber || undefined,
        notes: `${pendingFormData.appointment_type === 'emergency' ? 'Emergency' : 'Walk-in'} appointment payment`,
      });

      // 3. Create Appointment with checked_in status
      const appointment = await createAppointment.mutateAsync({
        patient_id: pendingFormData.patient_id,
        doctor_id: pendingFormData.doctor_id,
        branch_id: pendingFormData.branch_id,
        appointment_date: pendingFormData.appointment_date,
        appointment_time: format(new Date(), 'HH:mm'),
        appointment_type: pendingFormData.appointment_type,
        chief_complaint: pendingFormData.chief_complaint || null,
        notes: pendingFormData.notes || null,
        status: 'checked_in',
      });

      // 4. Show success with token
      setCompletedData({
        tokenNumber: appointment.token_number || 0,
        invoiceNumber: invoice.invoice_number,
        amountPaid: consultationFee,
        paymentMethodName: selectedPaymentMethod?.name || 'Cash',
        isPaid: true,
      });

      toast({ 
        title: 'Token Generated Successfully',
        description: `Token #${appointment.token_number} created with Invoice ${invoice.invoice_number}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle pay later - create appointment without payment
  const handlePayLater = async () => {
    if (!pendingFormData || !profile?.branch_id) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create Appointment with checked_in status (no invoice/payment)
      const appointment = await createAppointment.mutateAsync({
        patient_id: pendingFormData.patient_id,
        doctor_id: pendingFormData.doctor_id,
        branch_id: pendingFormData.branch_id,
        appointment_date: pendingFormData.appointment_date,
        appointment_time: format(new Date(), 'HH:mm'),
        appointment_type: pendingFormData.appointment_type,
        chief_complaint: pendingFormData.chief_complaint || null,
        notes: pendingFormData.notes || null,
        status: 'checked_in',
      });

      // Show success with token (no payment info)
      setCompletedData({
        tokenNumber: appointment.token_number || 0,
        isPaid: false,
      });

      toast({ 
        title: 'Token Generated',
        description: `Token #${appointment.token_number} created - Payment pending`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCompletedData(null);
    setShowPaymentStep(false);
    setPendingFormData(null);
    setPaymentMethodId('');
    setReferenceNumber('');
    setSelectedPatient(null);
    form.reset();
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    if (patient) {
      form.setValue('patient_id', patient.id);
    } else {
      form.setValue('patient_id', '');
    }
  };

  if (isEditing && loadingAppointment) {
    return <div>Loading...</div>;
  }

  // Success screen after token generation
  if (completedData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Token Generated"
          description={completedData.isPaid ? "Appointment created and payment recorded" : "Appointment created - Payment pending"}
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Appointments', href: '/app/appointments' },
            { label: 'Success' },
          ]}
        />

        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6 text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Token Number</p>
              <div className="text-6xl font-bold text-primary">#{completedData.tokenNumber}</div>
            </div>

            {/* Payment Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              completedData.isPaid 
                ? 'bg-primary/10 text-primary' 
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {completedData.isPaid ? 'Paid' : 'Payment Pending'}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              {completedData.isPaid && completedData.invoiceNumber && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice:</span>
                    <span className="font-mono font-medium">{completedData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-semibold">Rs. {completedData.amountPaid?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>{completedData.paymentMethodName}</span>
                  </div>
                </>
              )}
              {!completedData.isPaid && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee:</span>
                  <span className="font-semibold text-amber-600">Rs. {consultationFee.toLocaleString()} (Due)</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span>{selectedPatient?.full_name || selectedPatient?.first_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor:</span>
                <span>Dr. {selectedDoctor?.profile?.full_name}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={() => handlePrint({ title: 'Token Slip' })}>
                <Printer className="mr-2 h-4 w-4" />
                Print Token
              </Button>
              <Button variant="outline" onClick={() => navigate('/app/appointments')}>
                Back to Appointments
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                New Appointment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hidden Printable Token Slip */}
        <div className="hidden">
          {organization && (
            <PrintableTokenSlip
              ref={printRef}
              tokenNumber={completedData.tokenNumber}
              patient={{
                name: selectedPatient?.full_name || `${selectedPatient?.first_name} ${selectedPatient?.last_name || ''}`.trim(),
                mrNumber: selectedPatient?.patient_number,
              }}
              doctor={{
                name: `Dr. ${selectedDoctor?.profile?.full_name || 'Unknown'}`,
                specialty: selectedDoctor?.specialization || 'General',
              }}
              invoiceNumber={completedData.invoiceNumber}
              amountPaid={completedData.amountPaid}
              paymentMethod={completedData.paymentMethodName}
              organization={{
                name: organization.name,
                address: organization.address,
                phone: organization.phone,
                logo_url: organization.logo_url,
                slug: organization.slug,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Payment step for walk-in/emergency
  if (showPaymentStep && pendingFormData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Collect Payment"
          description="Collect consultation fee before generating token"
          breadcrumbs={[
            { label: 'Dashboard', href: '/app' },
            { label: 'Appointments', href: '/app/appointments' },
            { label: 'Payment' },
          ]}
        />

        <div className="max-w-xl mx-auto space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{selectedPatient?.full_name || selectedPatient?.first_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span>Dr. {selectedDoctor?.profile?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialty:</span>
                  <span>{selectedDoctor?.specialization || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{pendingFormData.appointment_type.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Consultation Fee</span>
                  <span className="text-primary">Rs. {consultationFee.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Payment Method</label>
                <PaymentMethodSelector
                  value={paymentMethodId}
                  onValueChange={setPaymentMethodId}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reference Number (Optional)</label>
                <Input
                  placeholder="Transaction ID or reference..."
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPaymentStep(false);
                  setPendingFormData(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={handlePaymentAndCreate}
                disabled={!paymentMethodId || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : `Collect Rs. ${consultationFee.toLocaleString()} & Generate Token`}
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              onClick={handlePayLater}
              disabled={isProcessing}
              className="text-muted-foreground"
            >
              Skip Payment - Generate Token Only (Pay Later)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Edit Appointment' : 'New Appointment'}
        description={isEditing ? 'Update appointment details' : 'Book a new appointment'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Appointments', href: '/app/appointments' },
          { label: isEditing ? 'Edit' : 'New' },
        ]}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Patient Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="patient_id"
                    render={() => (
                      <FormItem>
                        <FormLabel>Select Patient</FormLabel>
                        <FormControl>
                          <PatientSearch
                            onSelect={handlePatientSelect}
                            selectedPatient={selectedPatient}
                            onCreateNew={() => navigate('/app/patients/new?redirect=appointment')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Appointment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="branch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches?.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
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
                    name="doctor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor</FormLabel>
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
                                {doctor.specialization && ` - ${doctor.specialization}`}
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
                    name="appointment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="walk_in">Walk-in</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="follow_up">Follow-up</SelectItem>
                            <SelectItem value="emergency">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-destructive" />
                                Emergency
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} min={format(new Date(), 'yyyy-MM-dd')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Time Slot Selection - Only for scheduled/follow-up */}
              {requiresTimeSlot ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Time Slot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="appointment_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <TimeSlotPicker
                              doctorId={selectedDoctorId}
                              date={selectedDate}
                              selectedSlot={field.value || ''}
                              initialSlot={prefillTime}
                              onSelect={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {appointmentType === 'walk_in' ? 'Walk-in Appointment' : 'Emergency Appointment'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Clock className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">
                          {appointmentType === 'walk_in' 
                            ? 'Patient will be added to the queue'
                            : 'Patient will be prioritized immediately'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Payment will be collected before generating token
                        </p>
                      </div>
                    </div>
                    
                    {/* Show fee preview */}
                    {selectedDoctorId && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Consultation Fee:</span>
                          <span className="font-semibold text-primary">Rs. {consultationFee.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
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
                            placeholder="Describe the main reason for visit..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form Actions - Sticky on mobile */}
          <div className="flex gap-4 sticky bottom-0 bg-background py-4 -mx-4 px-4 md:mx-0 md:px-0 md:relative md:py-0 border-t md:border-t-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/appointments')}
              className="flex-1 md:flex-none h-12 md:h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAppointment.isPending || updateAppointment.isPending}
              className="flex-1 md:flex-none h-12 md:h-10"
            >
              {createAppointment.isPending || updateAppointment.isPending
                ? 'Saving...'
                : isEditing
                ? 'Update Appointment'
                : requiresPayFirst
                ? 'Continue to Payment'
                : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
