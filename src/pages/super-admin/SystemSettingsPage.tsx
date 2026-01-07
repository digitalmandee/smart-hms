import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSettings";
import { Loader2, Save, Plug, Mail, MessageSquare, Eye, EyeOff, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingItemProps {
  settingKey: string;
  label: string;
  description?: string;
  type: "string" | "number" | "boolean" | "password";
  value: string | null;
  onSave: (key: string, value: string | null) => void;
  isSaving: boolean;
}

function SettingItem({ settingKey, label, description, type, value, onSave, isSaving }: SettingItemProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLocalValue(value || "");
    setIsDirty(false);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setIsDirty(newValue !== (value || ""));
  };

  const handleSave = () => {
    onSave(settingKey, localValue || null);
    setIsDirty(false);
  };

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between py-4 border-b last:border-0">
        <div className="space-y-0.5">
          <Label>{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Switch
          checked={value === "true"}
          onCheckedChange={(checked) => onSave(settingKey, checked ? "true" : "false")}
          disabled={isSaving}
        />
      </div>
    );
  }

  if (type === "password") {
    return (
      <div className="py-4 border-b last:border-0">
        <div className="space-y-2">
          <Label>{label}</Label>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          <div className="flex gap-2">
            <div className="relative max-w-md flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Enter API key..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {isDirty && (
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 border-b last:border-0">
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        <div className="flex gap-2">
          <Input
            type={type === "number" ? "number" : "text"}
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className="max-w-md"
          />
          {isDirty && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiIntegrationsCard() {
  const { data, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const handleSave = (key: string, value: string | null) => {
    updateSetting.mutate({ key, value });
    setTestResult(null);
  };

  const testResendConnection = async () => {
    const apiKey = data?.settings["resend_api_key"];
    if (!apiKey) {
      toast({
        title: "No API Key",
        description: "Please enter a Resend API key first",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Call edge function to test the connection
      const { error } = await supabase.functions.invoke("check-overdue-invoices", {
        body: { test: true },
      });

      if (error) throw error;

      setTestResult("success");
      toast({
        title: "Connection Successful",
        description: "Resend API key is valid and working",
      });
    } catch (error: any) {
      setTestResult("error");
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to verify Resend API key",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isResendConfigured = !!data?.settings["resend_api_key"];

  const apiSettings = [
    { 
      key: "resend_api_key", 
      label: "Resend API Key", 
      type: "password" as const, 
      description: "API key for sending email notifications via Resend" 
    },
    { 
      key: "notification_from_email", 
      label: "From Email Address", 
      type: "string" as const, 
      description: "Email address used as sender for all notifications" 
    },
    { 
      key: "sms_provider", 
      label: "SMS Provider", 
      type: "string" as const, 
      description: "SMS provider name (e.g., twilio, messagebird) - Coming soon" 
    },
    { 
      key: "sms_api_key", 
      label: "SMS API Key", 
      type: "password" as const, 
      description: "API key for SMS provider - Coming soon" 
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5" />
          API Integrations
        </CardTitle>
        <CardDescription>Configure third-party API connections for notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resend Status */}
        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Email Provider (Resend)</span>
            </div>
            <div className="flex items-center gap-2">
              {isResendConfigured ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4" />
                  Not configured
                </span>
              )}
            </div>
          </div>
          
          <SettingItem
            settingKey="resend_api_key"
            label="Resend API Key"
            description="Get your API key from resend.com/api-keys"
            type="password"
            value={data?.settings["resend_api_key"] || null}
            onSave={handleSave}
            isSaving={updateSetting.isPending}
          />

          <SettingItem
            settingKey="notification_from_email"
            label="From Email Address"
            description="Must be from a verified domain in Resend"
            type="string"
            value={data?.settings["notification_from_email"] || null}
            onSave={handleSave}
            isSaving={updateSetting.isPending}
          />

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Get API Key <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={testResendConnection}
              disabled={!isResendConfigured || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>
        </div>

        {/* SMS Provider (Coming Soon) */}
        <div className="rounded-lg border p-4 space-y-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">SMS Provider</span>
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            SMS notifications will be available in a future update. Configure Twilio, MessageBird, or other providers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemSettingsPage() {
  const { data, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();

  const handleSave = (key: string, value: string | null) => {
    updateSetting.mutate({ key, value });
  };

  const settingsConfig = [
    { key: "platform_name", label: "Platform Name", type: "string" as const, description: "The name displayed across the platform" },
    { key: "support_email", label: "Support Email", type: "string" as const, description: "Email address for support inquiries" },
    { key: "default_currency", label: "Default Currency", type: "string" as const, description: "Currency code (e.g., PKR, USD)" },
    { key: "default_date_format", label: "Date Format", type: "string" as const, description: "Default date format (e.g., DD/MM/YYYY)" },
    { key: "default_time_format", label: "Time Format", type: "string" as const, description: "12h or 24h format" },
    { key: "trial_duration_days", label: "Trial Duration (Days)", type: "number" as const, description: "Number of days for trial period" },
    { key: "max_branches_basic", label: "Max Branches (Basic)", type: "number" as const, description: "Maximum branches for Basic plan" },
    { key: "max_branches_professional", label: "Max Branches (Professional)", type: "number" as const, description: "Maximum branches for Professional plan" },
    { key: "max_branches_enterprise", label: "Max Branches (Enterprise)", type: "string" as const, description: "Maximum branches for Enterprise plan (use 'unlimited' for no limit)" },
    { key: "maintenance_mode", label: "Maintenance Mode", type: "boolean" as const, description: "Enable to show maintenance message to all users" },
  ];

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure platform-wide settings"
        breadcrumbs={[
          { label: "Super Admin", href: "/super-admin/dashboard" },
          { label: "System Settings" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {settingsConfig.slice(0, 5).map((config) => (
                  <SettingItem
                    key={config.key}
                    settingKey={config.key}
                    label={config.label}
                    description={config.description}
                    type={config.type}
                    value={data?.settings[config.key] || null}
                    onSave={handleSave}
                    isSaving={updateSetting.isPending}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Limits</CardTitle>
            <CardDescription>Configure plan limits and trial settings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {settingsConfig.slice(5).map((config) => (
                  <SettingItem
                    key={config.key}
                    settingKey={config.key}
                    label={config.label}
                    description={config.description}
                    type={config.type}
                    value={data?.settings[config.key] || null}
                    onSave={handleSave}
                    isSaving={updateSetting.isPending}
                  />
                ))}
              </>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ApiIntegrationsCard />
        </div>
      </div>
    </div>
  );
}
