import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, UserCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { VitalsForm } from '@/components/consultation/VitalsForm';
import { PatientQuickInfo } from '@/components/consultation/PatientQuickInfo';
import { useAppointment, useCheckInWithVitals } from '@/hooks/useAppointments';
import { Vitals } from '@/hooks/useConsultations';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const priorityOptions = [
  { value: '0', label: 'Normal', description: 'Regular queue order', color: 'bg-green-500' },
  { value: '1', label: 'Urgent', description: 'Needs attention soon', color: 'bg-yellow-500' },
  { value: '2', label: 'Emergency', description: 'Immediate attention required', color: 'bg-red-500' },
];

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: appointment, isLoading } = useAppointment(id || '');
  const checkInWithVitals = useCheckInWithVitals();

  const [vitals, setVitals] = useState<Vitals>({});
  const [priority, setPriority] = useState('0');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [insuranceVerified, setInsuranceVerified] = useState(false);
  const [consentSigned, setConsentSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync chief complaint from appointment when loaded
  useState(() => {
    if (appointment?.chief_complaint) {
      setChiefComplaint(appointment.chief_complaint);
    }
  });

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

  const handleCheckIn = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await checkInWithVitals.mutateAsync({
        id,
        vitals,
        priority: parseInt(priority),
        chiefComplaint: chiefComplaint || undefined,
      });
      
      toast({
        title: 'Patient checked in',
        description: `Token #${appointment.token_number} is now in the queue`,
      });
      
      navigate('/app/appointments/queue');
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
        description={`Token #${appointment.token_number || 'N/A'} - ${patient?.first_name} ${patient?.last_name || ''}`}
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
          {/* Priority Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Triage Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={priority} onValueChange={setPriority} className="grid gap-3">
                {priorityOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors',
                      priority === option.value && 'border-primary bg-primary/5'
                    )}
                    onClick={() => setPriority(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={`priority-${option.value}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', option.color)} />
                        <Label htmlFor={`priority-${option.value}`} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Vitals Recording */}
          <VitalsForm vitals={vitals} onChange={setVitals} />

          {/* Chief Complaint */}
          <Card>
            <CardHeader>
              <CardTitle>Chief Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Patient's main complaint or reason for visit..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="insurance"
                  checked={insuranceVerified}
                  onCheckedChange={(checked) => setInsuranceVerified(checked === true)}
                />
                <Label htmlFor="insurance" className="cursor-pointer">
                  Insurance/Payment verified
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentSigned}
                  onCheckedChange={(checked) => setConsentSigned(checked === true)}
                />
                <Label htmlFor="consent" className="cursor-pointer">
                  Consent form signed
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full"
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
            <CardHeader>
              <CardTitle className="text-sm font-medium">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token</span>
                <Badge variant="outline" className="font-mono">
                  #{appointment.token_number || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{appointment.appointment_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span>{appointment.appointment_time || 'Walk-in'}</span>
              </div>
              {appointment.doctor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor</span>
                  <span>Dr. {(appointment.doctor as any).profile?.full_name}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
