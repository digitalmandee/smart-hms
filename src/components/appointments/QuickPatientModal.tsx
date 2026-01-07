import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const quickPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.string().optional(),
});

type QuickPatientData = z.infer<typeof quickPatientSchema>;

interface QuickPatientModalProps {
  onPatientCreated: (patient: { id: string; first_name: string; last_name: string | null; patient_number: string; phone: string | null }) => void;
  trigger?: React.ReactNode;
}

export function QuickPatientModal({ onPatientCreated, trigger }: QuickPatientModalProps) {
  const [open, setOpen] = useState(false);
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
    },
  });

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
        phone: data.phone,
        gender: data.gender as any,
        date_of_birth,
      });

      toast({
        title: 'Patient registered',
        description: `MRN: ${result.patient_number}`,
      });

      onPatientCreated({
        id: result.id,
        first_name: result.first_name,
        last_name: result.last_name,
        patient_number: result.patient_number,
        phone: result.phone,
      });

      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Quick Register
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick Patient Registration
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
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
                      <Input placeholder="Doe" {...field} />
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
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="03XX-XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                        <SelectTrigger>
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
                      <Input type="number" placeholder="35" min="0" max="150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
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
      </DialogContent>
    </Dialog>
  );
}
