import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, Send, Settings, CheckCircle, 
  AlertTriangle, Loader2
} from "lucide-react";
import { useOrgSettings, useUpdateOrgSetting } from "@/hooks/useSettings";
import { useSendSMS, useNotificationStats } from "@/hooks/useNotificationLogs";
import { toast } from "sonner";

const SMS_PROVIDERS = [
  { value: "twilio", label: "Twilio" },
  { value: "telenor", label: "Telenor SMS (Pakistan)" },
  { value: "jazz", label: "Jazz SMS (Pakistan)" },
  { value: "custom", label: "Custom HTTP API" },
];

export default function SMSSettingsPage() {
  const { data: settings, isLoading } = useOrgSettings();
  const updateSetting = useUpdateOrgSetting();
  const sendSMS = useSendSMS();
  const { data: stats } = useNotificationStats();

  const [provider, setProvider] = useState("");
  const [senderId, setSenderId] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testMessage, setTestMessage] = useState("This is a test message from your HMS.");

  useEffect(() => {
    if (settings?.settings) {
      setProvider(settings.settings.sms_provider || "");
      setSenderId(settings.settings.sms_sender_id || "");
    }
  }, [settings]);

  const handleSaveProvider = async () => {
    await updateSetting.mutateAsync({ key: "sms_provider", value: provider });
    toast.success("SMS provider updated");
  };

  const handleSaveSenderId = async () => {
    await updateSetting.mutateAsync({ key: "sms_sender_id", value: senderId });
    toast.success("Sender ID updated");
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number");
      return;
    }
    await sendSMS.mutateAsync({ to: testPhone, message: testMessage });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="SMS Gateway Settings"
          breadcrumbs={[
            { label: "Settings", href: "/app/settings" },
            { label: "SMS Gateway" },
          ]}
        />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="SMS Gateway Settings"
        description="Configure SMS provider and sending options"
        breadcrumbs={[
          { label: "Settings", href: "/app/settings" },
          { label: "SMS Gateway" },
        ]}
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.smsCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.sentCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.failedCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Provider</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {provider || "Not Set"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Configuration</CardTitle>
            <CardDescription>Select and configure your SMS gateway provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>SMS Provider</Label>
                <div className="flex gap-2">
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {SMS_PROVIDERS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSaveProvider} disabled={updateSetting.isPending}>
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sender ID / Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="e.g., HMS"
                  />
                  <Button onClick={handleSaveSenderId} disabled={updateSetting.isPending}>
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">API Key Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to configure the SMS API key in Supabase Edge Function secrets.
                    Go to Supabase Dashboard → Settings → Edge Functions to add your provider's API key.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test SMS */}
        <Card>
          <CardHeader>
            <CardTitle>Test SMS</CardTitle>
            <CardDescription>Send a test message to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+923001234567"
                />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <Button onClick={handleTestSMS} disabled={sendSMS.isPending}>
              {sendSMS.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Test SMS
            </Button>
          </CardContent>
        </Card>

        {/* Provider Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {provider === "twilio" && (
                <div className="space-y-2">
                  <h4 className="font-medium">Twilio Setup</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Create a Twilio account at twilio.com</li>
                    <li>Get your Account SID and Auth Token from the dashboard</li>
                    <li>Purchase a phone number for sending SMS</li>
                    <li>Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER as secrets</li>
                  </ol>
                </div>
              )}
              {provider === "telenor" && (
                <div className="space-y-2">
                  <h4 className="font-medium">Telenor SMS Setup</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Register for Telenor SMS API</li>
                    <li>Get your API credentials</li>
                    <li>Add TELENOR_API_KEY as a secret</li>
                  </ol>
                </div>
              )}
              {provider === "jazz" && (
                <div className="space-y-2">
                  <h4 className="font-medium">Jazz SMS Setup</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Register for Jazz SMS API</li>
                    <li>Get your API credentials</li>
                    <li>Add JAZZ_API_KEY as a secret</li>
                  </ol>
                </div>
              )}
              {!provider && (
                <p className="text-muted-foreground">Select a provider above to see setup instructions.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
