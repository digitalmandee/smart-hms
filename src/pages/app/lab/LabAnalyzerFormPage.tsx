import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  useLabAnalyzer,
  useCreateLabAnalyzer, 
  useUpdateLabAnalyzer,
  ANALYZER_TYPES,
  CONNECTION_TYPES,
} from '@/hooks/useLabAnalyzers';
import { FlaskConical, Loader2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  analyzer_type: z.string().min(1, 'Type is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  connection_type: z.string().default('manual'),
  ip_address: z.string().optional(),
  port: z.coerce.number().optional(),
  location: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function LabAnalyzerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  const { data: analyzer, isLoading } = useLabAnalyzer(isEditing ? id : undefined);
  const createAnalyzer = useCreateLabAnalyzer();
  const updateAnalyzer = useUpdateLabAnalyzer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      analyzer_type: '',
      manufacturer: '',
      model: '',
      serial_number: '',
      connection_type: 'manual',
      ip_address: '',
      port: undefined,
      location: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (analyzer) {
      form.reset({
        name: analyzer.name,
        analyzer_type: analyzer.analyzer_type,
        manufacturer: analyzer.manufacturer || '',
        model: analyzer.model || '',
        serial_number: analyzer.serial_number || '',
        connection_type: analyzer.connection_type,
        ip_address: analyzer.ip_address || '',
        port: analyzer.port || undefined,
        location: analyzer.location || '',
        is_active: analyzer.is_active,
      });
    }
  }, [analyzer, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await updateAnalyzer.mutateAsync({ id, ...values });
      } else {
        await createAnalyzer.mutateAsync({
          name: values.name,
          analyzer_type: values.analyzer_type,
          manufacturer: values.manufacturer,
          model: values.model,
          serial_number: values.serial_number,
          connection_type: values.connection_type,
          ip_address: values.ip_address,
          port: values.port,
          location: values.location,
          is_active: values.is_active,
        });
      }
      navigate('/app/lab/analyzers');
    } catch (error) {
      // Error handled in hooks
    }
  };

  const isSubmitting = createAnalyzer.isPending || updateAnalyzer.isPending;
  const connectionType = form.watch('connection_type');

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={isEditing ? 'Edit Analyzer' : 'Add Analyzer'}
        subtitle={isEditing ? `Editing ${analyzer?.name}` : 'Register a new lab analyzer device'}
        icon={FlaskConical}
        iconColor="text-primary"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/lab/analyzers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Analyzer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analyzer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sysmex XN-1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="analyzer_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Analyzer Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ANALYZER_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sysmex, Roche, Beckman" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., XN-1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serial_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Device serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Lab, Room 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Connection Settings</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="connection_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Connection Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select connection type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONNECTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Manual entry is used when no direct integration is available
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {connectionType !== 'manual' && (
                    <>
                      <div /> {/* Spacer */}
                      <FormField
                        control={form.control}
                        name="ip_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IP Address</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 192.168.1.100" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 2575" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel className="!mt-0">Active</FormLabel>
                        <FormDescription>
                          Inactive analyzers won't appear in test mapping options
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app/lab/analyzers')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEditing ? 'Update' : 'Create'} Analyzer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
