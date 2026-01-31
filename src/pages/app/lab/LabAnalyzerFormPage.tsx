import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useLabAnalyzerCatalogGrouped, LabAnalyzerCatalogItem } from '@/hooks/useLabAnalyzerCatalog';
import { FlaskConical, Loader2, ArrowLeft, Sparkles, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<LabAnalyzerCatalogItem | null>(null);

  const { data: analyzer, isLoading } = useLabAnalyzer(isEditing ? id : undefined);
  const { data: catalogGrouped, items: catalogItems, isLoading: catalogLoading } = useLabAnalyzerCatalogGrouped();
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

  // Handle catalog item selection
  const handleCatalogSelect = (item: LabAnalyzerCatalogItem) => {
    setSelectedCatalogItem(item);
    form.setValue('name', `${item.manufacturer} ${item.model}`);
    form.setValue('manufacturer', item.manufacturer);
    form.setValue('model', item.model);
    form.setValue('analyzer_type', item.analyzer_type);
    
    // Map connection protocol to connection type
    const protocol = item.connection_protocol.toLowerCase();
    if (protocol.includes('hl7')) {
      form.setValue('connection_type', 'hl7');
    } else if (protocol.includes('astm')) {
      form.setValue('connection_type', 'astm');
    } else if (protocol.includes('api')) {
      form.setValue('connection_type', 'tcp_ip');
    } else {
      form.setValue('connection_type', 'manual');
    }
    
    if (item.default_port) {
      form.setValue('port', item.default_port);
    }
  };

  // Filter catalog items
  const filteredCatalogItems = catalogItems?.filter(item => {
    if (!catalogSearch) return true;
    const search = catalogSearch.toLowerCase();
    return (
      item.manufacturer.toLowerCase().includes(search) ||
      item.model.toLowerCase().includes(search) ||
      item.analyzer_type.toLowerCase().includes(search)
    );
  });

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

      {/* Catalog Selection Card - Only show for new analyzers */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quick Setup: Select from Device Catalog
            </CardTitle>
            <CardDescription>
              Choose a pre-configured analyzer to auto-fill settings, or skip to enter manually below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by manufacturer, model, or type..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {catalogLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="p-4 space-y-4">
                  {Object.entries(catalogGrouped || {}).map(([manufacturer, items]) => {
                    const visibleItems = items.filter(item => 
                      !catalogSearch || 
                      item.manufacturer.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      item.model.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                      item.analyzer_type.toLowerCase().includes(catalogSearch.toLowerCase())
                    );
                    
                    if (visibleItems.length === 0) return null;
                    
                    return (
                      <div key={manufacturer}>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">{manufacturer}</h4>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {visibleItems.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleCatalogSelect(item)}
                              className={`p-3 text-left border rounded-lg transition-colors hover:bg-accent ${
                                selectedCatalogItem?.id === item.id 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-border'
                              }`}
                            >
                              <div className="font-medium text-sm">{item.model}</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {item.analyzer_type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {item.connection_protocol}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    );
                  })}
                  
                  {filteredCatalogItems?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No devices found matching "{catalogSearch}"
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            
            {selectedCatalogItem && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    Selected: {selectedCatalogItem.manufacturer} {selectedCatalogItem.model}
                  </span>
                </div>
                {selectedCatalogItem.notes && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedCatalogItem.notes}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
