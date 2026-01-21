import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePACSSettings, useUpdatePACSSettings, useTestPACSConnection, PACSSettings } from '@/hooks/usePACSSettings';
import { Save, TestTube, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const pacsConfigSchema = z.object({
  pacs_server_url: z.string().min(1, 'Server URL is required').url('Must be a valid URL'),
  pacs_username: z.string().optional(),
  pacs_password: z.string().optional(),
  pacs_ae_title: z.string().optional(),
});

type PACSConfigFormData = z.infer<typeof pacsConfigSchema>;

export function PACSConfigurationForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const { data: settings, isLoading: isLoadingSettings } = usePACSSettings();
  const updateSettings = useUpdatePACSSettings();
  const testConnection = useTestPACSConnection();
  
  const form = useForm<PACSConfigFormData>({
    resolver: zodResolver(pacsConfigSchema),
    defaultValues: {
      pacs_server_url: '',
      pacs_username: '',
      pacs_password: '',
      pacs_ae_title: 'LOVABLE_HMS',
    },
  });
  
  // Populate form with existing settings
  useEffect(() => {
    if (settings) {
      form.reset({
        pacs_server_url: settings.pacs_server_url || '',
        pacs_username: settings.pacs_username || '',
        pacs_password: settings.pacs_password || '',
        pacs_ae_title: settings.pacs_ae_title || 'LOVABLE_HMS',
      });
    }
  }, [settings, form]);
  
  const handleTestConnection = async () => {
    setTestResult(null);
    const values = form.getValues();
    
    if (!values.pacs_server_url) {
      setTestResult({ success: false, message: 'Please enter a server URL first' });
      return;
    }
    
    try {
      const result = await testConnection.mutateAsync({
        pacs_server_url: values.pacs_server_url,
        pacs_username: values.pacs_username || undefined,
        pacs_password: values.pacs_password || undefined,
        pacs_ae_title: values.pacs_ae_title || undefined,
      });
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Failed to test connection' });
    }
  };
  
  const onSubmit = async (data: PACSConfigFormData) => {
    setTestResult(null);
    await updateSettings.mutateAsync({
      pacs_server_url: data.pacs_server_url,
      pacs_username: data.pacs_username || '',
      pacs_password: data.pacs_password || '',
      pacs_ae_title: data.pacs_ae_title || 'LOVABLE_HMS',
    });
  };
  
  if (isLoadingSettings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>PACS Server Configuration</CardTitle>
        <CardDescription>
          Configure the connection to your DICOMweb-compatible PACS server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pacs_server_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="http://orthanc-server:8042" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The base URL of your PACS server (e.g., http://localhost:8042 for Orthanc)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pacs_username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="orthanc" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      For Basic Auth (leave empty if not required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pacs_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      For Basic Auth (leave empty if not required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="pacs_ae_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AE Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="LOVABLE_HMS" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Application Entity Title for DICOM communication
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>{testResult.success ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
              >
                {testConnection.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              
              <Button 
                type="submit" 
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
