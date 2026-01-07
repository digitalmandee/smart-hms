import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgSettings, useUpdateOrgSetting } from "@/hooks/useSettings";
import { Bell, Mail, MessageSquare, Clock, Loader2 } from "lucide-react";

interface SettingItemProps {
  label: string;
  description: string;
  settingKey: string;
  type: "boolean" | "number";
  value: string | null;
  onSave: (key: string, value: string | null) => void;
  isSaving: boolean;
}

function SettingItem({ label, description, settingKey, type, value, onSave, isSaving }: SettingItemProps) {
  const [localValue, setLocalValue] = useState(value || (type === "boolean" ? "false" : ""));
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalValue(value || (type === "boolean" ? "false" : ""));
    setIsDirty(false);
  }, [value, type]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(settingKey, localValue);
    setIsDirty(false);
  };

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between py-4 border-b last:border-0">
        <div className="space-y-0.5">
          <Label className="text-base">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Switch
          checked={localValue === "true"}
          onCheckedChange={(checked) => {
            const newValue = checked ? "true" : "false";
            setLocalValue(newValue);
            onSave(settingKey, newValue);
          }}
          disabled={isSaving}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4 border-b last:border-0">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-24"
          min={1}
        />
        {isDirty && (
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            Save
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const { data, isLoading } = useOrgSettings();
  const updateSetting = useUpdateOrgSetting();

  const handleSave = (key: string, value: string | null) => {
    updateSetting.mutate({ key, value });
  };

  const overdueSettings = [
    {
      key: "overdue_notifications_enabled",
      label: "Enable Overdue Notifications",
      description: "Send notifications when invoices become overdue",
      type: "boolean" as const,
    },
    {
      key: "overdue_notification_days",
      label: "Days Before Notification",
      description: "Number of days after due date to send notification",
      type: "number" as const,
    },
    {
      key: "overdue_email_enabled",
      label: "Email Notifications",
      description: "Send overdue notifications via email",
      type: "boolean" as const,
    },
    {
      key: "overdue_sms_enabled",
      label: "SMS Notifications",
      description: "Send overdue notifications via SMS",
      type: "boolean" as const,
    },
    {
      key: "overdue_reminder_interval",
      label: "Reminder Interval (days)",
      description: "Days between reminder notifications",
      type: "number" as const,
    },
    {
      key: "overdue_max_reminders",
      label: "Maximum Reminders",
      description: "Maximum number of reminders to send per invoice",
      type: "number" as const,
    },
  ];

  const appointmentSettings = [
    {
      key: "appointment_reminder_enabled",
      label: "Appointment Reminders",
      description: "Send reminders before scheduled appointments",
      type: "boolean" as const,
    },
    {
      key: "appointment_reminder_hours",
      label: "Hours Before Appointment",
      description: "Send reminder this many hours before appointment",
      type: "number" as const,
    },
    {
      key: "appointment_email_enabled",
      label: "Email Reminders",
      description: "Send appointment reminders via email",
      type: "boolean" as const,
    },
    {
      key: "appointment_sms_enabled",
      label: "SMS Reminders",
      description: "Send appointment reminders via SMS",
      type: "boolean" as const,
    },
  ];

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Notification Settings"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "Notifications" },
          ]}
        />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notification Settings"
        description="Configure email and SMS notifications for your organization"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "Notifications" },
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Overdue Invoice Notifications
            </CardTitle>
            <CardDescription>
              Configure automatic notifications for overdue invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueSettings.map((setting) => (
              <SettingItem
                key={setting.key}
                label={setting.label}
                description={setting.description}
                settingKey={setting.key}
                type={setting.type}
                value={data?.settings[setting.key] ?? null}
                onSave={handleSave}
                isSaving={updateSetting.isPending}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Appointment Reminders
            </CardTitle>
            <CardDescription>
              Configure automatic appointment reminder notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentSettings.map((setting) => (
              <SettingItem
                key={setting.key}
                label={setting.label}
                description={setting.description}
                settingKey={setting.key}
                type={setting.type}
                value={data?.settings[setting.key] ?? null}
                onSave={handleSave}
                isSaving={updateSetting.isPending}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Configure your notification delivery methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Email & SMS Integration</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Email notifications use Resend and SMS uses your configured provider. 
                    Contact your administrator to set up API keys for these services.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
