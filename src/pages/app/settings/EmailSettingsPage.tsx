import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Server, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEmailSettings, useUpdateEmailSettings, useTestEmailConfig, type EmailSettings } from "@/hooks/useEmailSettings";

const formSchema = z.object({
  email_provider: z.enum(["resend", "smtp", "sendgrid"]).nullable(),
  resend_api_key: z.string().optional(),
  sendgrid_api_key: z.string().optional(),
  smtp_host: z.string().optional(),
  smtp_port: z.string().optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_encryption: z.enum(["tls", "ssl", "none"]).optional(),
  email_from_name: z.string().optional(),
  email_from_address: z.string().email("Invalid email address").optional().or(z.literal("")),
  email_reply_to: z.string().email("Invalid email address").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function EmailSettingsPage() {
  const { data: settings, isLoading } = useEmailSettings();
  const updateSettings = useUpdateEmailSettings();
  const testEmail = useTestEmailConfig();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: settings ? {
      email_provider: settings.email_provider as FormValues["email_provider"],
      resend_api_key: settings.resend_api_key || "",
      sendgrid_api_key: settings.sendgrid_api_key || "",
      smtp_host: settings.smtp_host || "",
      smtp_port: settings.smtp_port || "",
      smtp_username: settings.smtp_username || "",
      smtp_password: settings.smtp_password || "",
      smtp_encryption: settings.smtp_encryption as FormValues["smtp_encryption"] || "tls",
      email_from_name: settings.email_from_name || "",
      email_from_address: settings.email_from_address || "",
      email_reply_to: settings.email_reply_to || "",
    } : undefined,
  });

  const selectedProvider = form.watch("email_provider");
  const isConfigured = settings?.email_provider && (
    (settings.email_provider === "resend" && settings.resend_api_key) ||
    (settings.email_provider === "sendgrid" && settings.sendgrid_api_key) ||
    (settings.email_provider === "smtp" && settings.smtp_host)
  );

  const onSubmit = (values: FormValues) => {
    updateSettings.mutate(values as Partial<EmailSettings>);
  };

  const handleTestEmail = () => {
    if (testEmailAddress) {
      testEmail.mutate(testEmailAddress);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Email Settings" description="Configure your email provider" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Email Settings" 
        description="Configure your organization's email provider and sender settings"
      />

      {/* Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration Status
            </CardTitle>
            {isConfigured ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        {isConfigured && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Provider: <span className="font-medium text-foreground capitalize">{settings?.email_provider}</span>
              {settings?.email_from_address && (
                <> • From: <span className="font-medium text-foreground">{settings.email_from_address}</span></>
              )}
            </p>
          </CardContent>
        )}
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Email Provider
              </CardTitle>
              <CardDescription>
                Choose your email service provider. Each provider requires different configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email_provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="resend">
                          <div className="flex items-center gap-2">
                            <span>Resend</span>
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="smtp">Custom SMTP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Resend is recommended for ease of setup. SMTP allows any email server.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Resend Settings */}
              {selectedProvider === "resend" && (
                <div className="pt-4 space-y-4 border-t">
                  <h4 className="font-medium">Resend Configuration</h4>
                  <FormField
                    control={form.control}
                    name="resend_api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showApiKey ? "text" : "password"}
                              placeholder="re_xxxxxxxxxxxx"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Get your API key from{" "}
                          <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            resend.com/api-keys
                          </a>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* SendGrid Settings */}
              {selectedProvider === "sendgrid" && (
                <div className="pt-4 space-y-4 border-t">
                  <h4 className="font-medium">SendGrid Configuration</h4>
                  <FormField
                    control={form.control}
                    name="sendgrid_api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showApiKey ? "text" : "password"}
                              placeholder="SG.xxxxxxxxxxxx"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Get your API key from SendGrid dashboard
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* SMTP Settings */}
              {selectedProvider === "smtp" && (
                <div className="pt-4 space-y-4 border-t">
                  <h4 className="font-medium">SMTP Configuration</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="smtp_host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="smtp.gmail.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smtp_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="587" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smtp_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smtp_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="••••••••" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="smtp_encryption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Encryption</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "tls"}>
                          <FormControl>
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tls">TLS (Recommended)</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sender Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Sender Information
              </CardTitle>
              <CardDescription>
                Configure how your emails appear to recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email_from_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="City Hospital" />
                      </FormControl>
                      <FormDescription>
                        The name that appears in recipients' inbox
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email_from_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="noreply@cityhospital.com" />
                      </FormControl>
                      <FormDescription>
                        Must be verified with your email provider
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email_reply_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reply-To Address (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="support@cityhospital.com" />
                    </FormControl>
                    <FormDescription>
                      Where replies will be sent if different from the From address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Test Email */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Send a test email to verify your configuration is working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="max-w-sm"
              />
              <Button 
                onClick={handleTestEmail} 
                disabled={!testEmailAddress || testEmail.isPending}
                variant="outline"
              >
                {testEmail.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
