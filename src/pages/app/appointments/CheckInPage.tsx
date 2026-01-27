import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, UserCheck, AlertTriangle, Printer, Clock, Stethoscope, Hash } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { VitalsForm } from '@/components/consultation/VitalsForm';
import { PatientQuickInfo } from '@/components/consultation/PatientQuickInfo';
import { PrintableTokenSlip } from '@/components/appointments/PrintableTokenSlip';
import { useAppointment, useCheckInWithVitals } from '@/hooks/useAppointments';
import { useOrganization } from '@/hooks/useOrganizations';
import { useAuth } from '@/contexts/AuthContext';
import { Vitals } from '@/hooks/useConsultations';
import { useToast } from '@/hooks/use-toast';
import { usePrint } from '@/hooks/usePrint';
import { generateVisitId } from '@/lib/visit-id';
import { cn } from '@/lib/utils';

const priorityOptions = [
  { 
    value: 0, 
    label: 'Normal', 
    description: 'Regular queue order', 
    color: 'bg-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/50',
    textColor: 'text-success'
  },
  { 
    value: 1, 
    label: 'Urgent', 
    description: 'Needs attention soon', 
    color: 'bg-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/50',
    textColor: 'text-warning'
  },
  { 
    value: 2, 
    label: 'Emergency', 
    description: 'Immediate attention required', 
    color: 'bg-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/50',
    textColor: 'text-destructive'
  },
];

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: appointment, isLoading } = useAppointment(id || '');
  const { data: organization } = useOrganization(profile?.organization_id ?? undefined);
  const checkInWithVitals = useCheckInWithVitals();
  const { printRef, handlePrint } = usePrint();

  const [vitals, setVitals] = useState<Vitals>({});
  const [priority, setPriority] = useState(0);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [consentSigned, setConsentSigned] = useState(false);
  const [printTokenSlip, setPrintTokenSlip] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkedInAppointment, setCheckedInAppointment] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Appointment not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const patient = appointment.patient as any;
  const doctor = appointment.doctor as any;
  
  // Generate Visit ID
  const visitId = generateVisitId({
    appointment_date: appointment.appointment_date,
    token_number: appointment.token_number,
  });

  const handleCheckIn = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await checkInWithVitals.mutateAsync({
        id,
        vitals,
        priority,
        chiefComplaint: chiefComplaint || undefined,
      });
      
      // Store the checked-in appointment for printing
      setCheckedInAppointment({
        ...appointment,
        priority
      });
      
      toast({
        title: 'Patient checked in successfully',
        description: `Token #${appointment.token_number} is now in the queue`,
      });
      
      // Print token slip if option selected
      if (printTokenSlip) {
        setTimeout(() => {
          handlePrint();
          navigate('/app/appointments/queue');
        }, 300);
      } else {
        navigate('/app/appointments/queue');
      }
    } catch (error: any) {
      toast({
        title: 'Check-in failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Check-In"
        description={`Token #${appointment.token_number || 'N/A'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/app' },
          { label: 'Queue', href: '/app/appointments/queue' },
          { label: 'Check-In' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Token Display */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-md">
                    {appointment.token_number || '-'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {patient?.first_name} {patient?.last_name}
                    </h2>
                    <p className="text-muted-foreground">MR# {patient?.patient_number}</p>
                    {/* Visit ID Display */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <Hash className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-mono font-medium text-primary">{visitId}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.appointment_time || 'Walk-in'}</span>
                  </div>
                  {doctor && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Stethoscope className="h-4 w-4" />
                      <span>Dr. {doctor.profile?.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Selection - Visual Cards */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Triage Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                      priority === option.value 
                        ? cn(option.borderColor, option.bgColor, 'ring-2 ring-offset-2', option.value === 0 ? 'ring-success' : option.value === 1 ? 'ring-warning' : 'ring-destructive')
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-4 h-4 rounded-full mt-0.5 shrink-0', option.color)} />
                      <div>
                        <div className={cn('font-semibold', priority === option.value && option.textColor)}>
                          {option.label}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    {priority === option.value && (
                      <div className="absolute top-2 right-2">
                        <svg className={cn("h-5 w-5", option.textColor)} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vitals Recording */}
          <VitalsForm vitals={vitals} onChange={setVitals} />

          {/* Chief Complaint */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chief Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Patient's main complaint or reason for visit..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Verification & Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verification & Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
                  <Checkbox
                    id="insurance"
                    checked={insuranceVerified}
                    onCheckedChange={(checked) => setInsuranceVerified(checked === true)}
                  />
                  <Label htmlFor="insurance" className="cursor-pointer flex-1">
                    <span className="font-medium">Insurance Verified</span>
                    <p className="text-xs text-muted-foreground">Payment eligibility confirmed</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/30">
                  <Checkbox
                    id="consent"
                    checked={consentSigned}
                    onCheckedChange={(checked) => setConsentSigned(checked === true)}
                  />
                  <Label htmlFor="consent" className="cursor-pointer flex-1">
                    <span className="font-medium">Consent Signed</span>
                    <p className="text-xs text-muted-foreground">Patient consent form completed</p>
                  </Label>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="printToken"
                    checked={printTokenSlip}
                    onCheckedChange={(checked) => setPrintTokenSlip(checked === true)}
                  />
                  <Label htmlFor="printToken" className="cursor-pointer flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    <span>Print token slip after check-in</span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={handleCheckIn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <UserCheck className="h-5 w-5 mr-2" />
            )}
            Complete Check-In
          </Button>
        </div>

        {/* Sidebar - Patient Info */}
        <div className="space-y-6">
          {patient && <PatientQuickInfo patient={patient} />}
          
          {/* Appointment Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Token</span>
                <Badge variant="outline" className="font-mono text-base px-3">
                  #{appointment.token_number || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary" className="capitalize">
                  {appointment.appointment_type?.replace('_', ' ') || 'OPD'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{appointment.appointment_time || 'Walk-in'}</span>
              </div>
              {doctor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span>Dr. {doctor.profile?.full_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Printable Token Slip */}
      <div className="hidden">
        <PrintableTokenSlip
          ref={printRef}
          appointment={checkedInAppointment || appointment}
          patient={patient}
          doctor={doctor}
          organization={organization ? {
            name: organization.name,
            address: organization.address || undefined,
            phone: organization.phone || undefined
          } : undefined}
        />
      </div>
    </div>
  );
}
