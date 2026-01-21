import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Clock, Users } from 'lucide-react';

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
  const { toast } = useToast();
  const { profile } = useAuth();
  const isEditing = !!id;

  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const { data: existingAppointment, isLoading: loadingAppointment } = useAppointment(id || '');
  const { data: doctors } = useDoctors();
  const { data: branches } = useBranches();

  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

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

  const selectedDoctorId = form.watch('doctor_id');
  const selectedDate = form.watch('appointment_date');
  const appointmentType = form.watch('appointment_type');

  // Check if time slot selection is needed
  const requiresTimeSlot = appointmentType === 'scheduled' || appointmentType === 'follow_up';

  // Clear time when switching to walk-in/emergency
  useEffect(() => {
    if (!requiresTimeSlot) {
      form.setValue('appointment_time', '');
    }
  }, [requiresTimeSlot, form]);

  const onSubmit = async (data: AppointmentFormData) => {
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
                                <span className="w-2 h-2 rounded-full bg-red-500" />
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
                  <CardContent>
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
                          {appointmentType === 'walk_in'
                            ? 'A token number will be assigned automatically'
                            : 'Emergency cases are handled with top priority'
                          }
                        </p>
                      </div>
                    </div>
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

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/app/appointments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAppointment.isPending || updateAppointment.isPending}
            >
              {createAppointment.isPending || updateAppointment.isPending
                ? 'Saving...'
                : isEditing
                ? 'Update Appointment'
                : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
