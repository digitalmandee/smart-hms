import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSettings";
import { Loader2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

interface SettingItemProps {
  settingKey: string;
  label: string;
  description?: string;
  type: "string" | "number" | "boolean";
  value: string | null;
  onSave: (key: string, value: string | null) => void;
  isSaving: boolean;
}

function SettingItem({ settingKey, label, description, type, value, onSave, isSaving }: SettingItemProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [isDirty, setIsDirty] = useState(false);

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
      </div>
    </div>
  );
}
