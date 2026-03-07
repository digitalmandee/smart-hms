import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Check, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import { useCreatePatient } from '@/hooks/usePatients';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCountryConfig } from '@/contexts/CountryConfigContext';
import { useTranslation } from '@/lib/i18n';
import { isValidSaudiId } from '@/lib/validations/saudiId';

const quickPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.string().optional(),
  national_id: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

type QuickPatientData = z.infer<typeof quickPatientSchema>;

interface QuickPatientModalProps {
  onPatientCreated: (patient: { id: string; first_name: string; last_name: string | null; patient_number: string; phone: string | null }) => void;
  trigger?: React.ReactNode;
}

export function QuickPatientModal({ onPatientCreated, trigger }: QuickPatientModalProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<any>(null);
  const [printCard, setPrintCard] = useState(false);
  const { toast } = useToast();
  const createPatient = useCreatePatient();

  const form = useForm<QuickPatientData>({
    resolver: zodResolver(quickPatientSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      gender: undefined,
      age: '',
      national_id: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
    },
  });

  const resetAndClose = () => {
    form.reset();
    setShowSuccess(false);
    setCreatedPatient(null);
    setOpen(false);
  };

  const onSubmit = async (data: QuickPatientData) => {
    try {
      // Calculate date of birth from age if provided
      let date_of_birth: string | undefined;
      if (data.age) {
        const age = parseInt(data.age);
        if (!isNaN(age)) {
          const dob = new Date();
          dob.setFullYear(dob.getFullYear() - age);
          date_of_birth = dob.toISOString().split('T')[0];
        }
      }

      const result = await createPatient.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name || null,
        phone: data.phone || null,
        gender: data.gender as any,
        date_of_birth: date_of_birth || null,
        national_id: data.national_id || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        // branch_id is handled by the hook using profile.branch_id
      });

      setCreatedPatient(result);
      setShowSuccess(true);

      // TODO: Print card if selected
      if (printCard) {
        toast({
          title: 'Print feature',
          description: 'Patient card will be printed',
        });
      }

    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleContinue = () => {
    if (createdPatient) {
      onPatientCreated({
        id: createdPatient.id,
        first_name: createdPatient.first_name,
        last_name: createdPatient.last_name,
        patient_number: createdPatient.patient_number,
        phone: createdPatient.phone,
      });
    }
    resetAndClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetAndClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Quick Register
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Quick Patient Registration
          </DialogTitle>
        </DialogHeader>

        {showSuccess && createdPatient ? (
          // Success State
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Patient Registered Successfully!</h3>
              <p className="text-muted-foreground mt-1">
                {createdPatient.first_name} {createdPatient.last_name || ''}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 inline-block">
              <div className="text-sm text-muted-foreground">Patient Number</div>
              <div className="text-2xl font-mono font-bold text-primary">
                {createdPatient.patient_number}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetAndClose}
              >
                Register Another
              </Button>
              <Button
                className="flex-1"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          // Form State
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="03XX-XXXXXXX" {...field} className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => {
                  const val = field.value || '';
                  const isSA = countryConfig.country_code === 'SA';
                  const showError = isSA && val.length > 0 && !isValidSaudiId(val);
                  return (
                    <FormItem>
                      <FormLabel>{countryConfig.national_id_label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isSA ? t('saudiId.placeholder') : countryConfig.national_id_format}
                          {...field}
                          className="h-10"
                          maxLength={isSA ? 10 : undefined}
                        />
                      </FormControl>
                      {showError && (
                        <p className="text-sm text-destructive">{t('saudiId.invalidFormat')}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="35" min="0" max="150" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Emergency Contact - Collapsible */}
              <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground">Emergency Contact (Optional)</div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Contact name" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Contact phone" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Print Option */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="printCard"
                  checked={printCard}
                  onCheckedChange={(checked) => setPrintCard(checked === true)}
                />
                <Label htmlFor="printCard" className="cursor-pointer text-sm flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print patient ID card after registration
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={resetAndClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createPatient.isPending}
                >
                  {createPatient.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Register
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
