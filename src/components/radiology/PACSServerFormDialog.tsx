import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  useCreatePACSServer, 
  useUpdatePACSServer, 
  useTestPACSServerConnection,
  PACSServer 
} from '@/hooks/usePACSServers';
import { useRadiologyDeviceCatalogByType, RadiologyDeviceCatalogItem } from '@/hooks/useRadiologyDeviceCatalog';
import { Loader2, CheckCircle, XCircle, Sparkles, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  server_url: z.string().url('Must be a valid URL'),
  ae_title: z.string().default('LOVABLE_HMS'),
  username: z.string().optional(),
  password: z.string().optional(),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PACSServerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: PACSServer | null;
}

export function PACSServerFormDialog({ open, onOpenChange, server }: PACSServerFormDialogProps) {
  const createServer = useCreatePACSServer();
  const updateServer = useUpdatePACSServer();
  const testConnection = useTestPACSServerConnection();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<RadiologyDeviceCatalogItem | null>(null);
  
  // Get PACS servers from catalog (device_type = 'pacs')
  const { data: pacsCatalog, isLoading: catalogLoading } = useRadiologyDeviceCatalogByType();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      server_url: '',
      ae_title: 'LOVABLE_HMS',
      username: '',
      password: '',
      is_default: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (server) {
      form.reset({
        name: server.name,
        server_url: server.server_url,
        ae_title: server.ae_title || 'LOVABLE_HMS',
        username: server.username || '',
        password: '', // Don't prefill password
        is_default: server.is_default,
        is_active: server.is_active,
      });
    } else {
      form.reset({
        name: '',
        server_url: '',
        ae_title: 'LOVABLE_HMS',
        username: '',
        password: '',
        is_default: false,
        is_active: true,
      });
    }
    setTestResult(null);
    setSelectedCatalogItem(null);
    setCatalogSearch('');
  }, [server, open, form]);

  // Handle catalog item selection
  const handleCatalogSelect = (item: RadiologyDeviceCatalogItem) => {
    setSelectedCatalogItem(item);
    form.setValue('name', `${item.manufacturer} ${item.model}`);
    if (item.dicom_ae_title) {
      form.setValue('ae_title', item.dicom_ae_title);
    }
    // Set a placeholder URL based on device type
    if (item.device_type === 'pacs' && item.default_port) {
      form.setValue('server_url', `http://localhost:${item.default_port}`);
    }
  };

  // Filter catalog items for PACS-relevant devices
  const pacsRelevantItems = pacsCatalog?.filter(item => 
    item.device_type === 'pacs' || 
    item.device_type === 'workstation' ||
    item.supports_dicomweb
  );

  const filteredCatalogItems = pacsRelevantItems?.filter(item => {
    if (!catalogSearch) return true;
    const search = catalogSearch.toLowerCase();
    return (
      item.manufacturer.toLowerCase().includes(search) ||
      item.model.toLowerCase().includes(search) ||
      item.device_type.toLowerCase().includes(search)
    );
  });

  const handleTest = async () => {
    const values = form.getValues();
    setTestResult(null);

    try {
      const result = await testConnection.mutateAsync({
        server_url: values.server_url,
        username: values.username,
        password: values.password,
        ae_title: values.ae_title,
      });
      setTestResult(result);
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Connection failed' });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (server) {
        await updateServer.mutateAsync({
          id: server.id,
          name: values.name,
          server_url: values.server_url,
          ae_title: values.ae_title,
          username: values.username,
          password: values.password || undefined,
          is_default: values.is_default,
          is_active: values.is_active,
        });
      } else {
        await createServer.mutateAsync({
          name: values.name,
          server_url: values.server_url,
          ae_title: values.ae_title,
          username: values.username,
          password: values.password,
          is_default: values.is_default,
          is_active: values.is_active,
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled in hooks
    }
  };

  const isSubmitting = createServer.isPending || updateServer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{server ? 'Edit PACS Server' : 'Add PACS Server'}</DialogTitle>
          <DialogDescription>
            Configure the connection details for your PACS/DICOMweb server.
          </DialogDescription>
        </DialogHeader>

        {/* Catalog Selection - Only show for new servers */}
        {!server && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Quick Setup: Select from Catalog</span>
            </div>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PACS/DICOM devices..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <ScrollArea className="h-[120px] border rounded-md bg-background">
              <div className="p-2 space-y-1">
                {catalogLoading ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">Loading catalog...</div>
                ) : filteredCatalogItems && filteredCatalogItems.length > 0 ? (
                  filteredCatalogItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCatalogSelect(item)}
                      className={`w-full p-2 text-left rounded-md transition-colors hover:bg-accent flex items-center justify-between ${
                        selectedCatalogItem?.id === item.id 
                          ? 'bg-primary/10 border border-primary' 
                          : ''
                      }`}
                    >
                      <div>
                        <span className="font-medium text-sm">{item.manufacturer} {item.model}</span>
                        <div className="flex gap-1 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{item.device_type}</Badge>
                          {item.supports_dicomweb && (
                            <Badge variant="outline" className="text-xs">DICOMweb</Badge>
                          )}
                        </div>
                      </div>
                      {item.default_port && (
                        <span className="text-xs text-muted-foreground">Port: {item.default_port}</span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    {catalogSearch ? `No devices matching "${catalogSearch}"` : 'No PACS devices in catalog'}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {selectedCatalogItem && (
              <div className="mt-2 p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                <span className="font-medium">Selected:</span> {selectedCatalogItem.manufacturer} {selectedCatalogItem.model}
                {selectedCatalogItem.notes && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedCatalogItem.notes}</p>
                )}
              </div>
            )}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main PACS Server" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="server_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://pacs.hospital.com:8042" {...field} />
                  </FormControl>
                  <FormDescription>
                    DICOMweb endpoint URL (e.g., Orthanc, DCM4CHEE)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ae_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AE Title</FormLabel>
                  <FormControl>
                    <Input placeholder="LOVABLE_HMS" {...field} />
                  </FormControl>
                  <FormDescription>
                    Application Entity Title for DICOM communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Optional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="is_default"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Default Server</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={testConnection.isPending || !form.getValues('server_url')}
              >
                {testConnection.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test Connection
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {server ? 'Update' : 'Add'} Server
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
