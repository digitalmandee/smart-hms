import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, TestTube, CreditCard, FileCheck, Building2 } from "lucide-react";

interface LabSettings {
  id?: string;
  organization_id: string;
  branch_id: string | null;
  allow_direct_lab_payment: boolean;
  require_consultation_for_lab: boolean;
  lab_payment_location: "reception" | "lab" | "both";
  auto_generate_invoice: boolean;
  allow_unpaid_processing: boolean;
}

const DEFAULT_SETTINGS: Omit<LabSettings, "organization_id"> = {
  branch_id: null,
  allow_direct_lab_payment: false,
  require_consultation_for_lab: true,
  lab_payment_location: "reception",
  auto_generate_invoice: true,
  allow_unpaid_processing: false,
};

export default function LabSettingsPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<LabSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch lab settings
  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ["lab-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data, error } = await (supabase as any)
        .from("lab_settings")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .is("branch_id", null)
        .maybeSingle();

      if (error) throw error;
      return data as LabSettings | null;
    },
    enabled: !!profile?.organization_id,
  });

  // Initialize settings
  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    } else if (profile?.organization_id) {
      setSettings({
        organization_id: profile.organization_id,
        ...DEFAULT_SETTINGS,
      });
    }
  }, [fetchedSettings, profile?.organization_id]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: LabSettings) => {
      if (data.id) {
        // Update existing
        const { error } = await (supabase as any)
          .from("lab_settings")
          .update({
            allow_direct_lab_payment: data.allow_direct_lab_payment,
            require_consultation_for_lab: data.require_consultation_for_lab,
            lab_payment_location: data.lab_payment_location,
            auto_generate_invoice: data.auto_generate_invoice,
            allow_unpaid_processing: data.allow_unpaid_processing,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await (supabase as any)
          .from("lab_settings")
          .insert({
            organization_id: data.organization_id,
            branch_id: data.branch_id,
            allow_direct_lab_payment: data.allow_direct_lab_payment,
            require_consultation_for_lab: data.require_consultation_for_lab,
            lab_payment_location: data.lab_payment_location,
            auto_generate_invoice: data.auto_generate_invoice,
            allow_unpaid_processing: data.allow_unpaid_processing,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-settings"] });
      toast.success("Lab settings saved successfully");
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const updateSetting = <K extends keyof LabSettings>(key: K, value: LabSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (settings) {
      saveMutation.mutate(settings);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Settings"
        description="Configure laboratory workflow and payment options"
        actions={
          <Button onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        }
      />

      <div className="grid gap-6">
        {/* Workflow Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Lab Order Workflow
            </CardTitle>
            <CardDescription>
              Configure how lab orders are created and processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Require Doctor Consultation</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, lab orders can only be created through doctor consultations.
                  When disabled, reception staff can create lab orders directly.
                </p>
              </div>
              <Switch
                checked={settings?.require_consultation_for_lab ?? true}
                onCheckedChange={(checked) =>
                  updateSetting("require_consultation_for_lab", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Generate Invoice</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create an invoice when a lab order is placed
                </p>
              </div>
              <Switch
                checked={settings?.auto_generate_invoice ?? true}
                onCheckedChange={(checked) =>
                  updateSetting("auto_generate_invoice", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Configuration
            </CardTitle>
            <CardDescription>
              Configure where and how lab payments are collected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Direct Lab Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow patients to pay for lab tests directly at the lab counter
                </p>
              </div>
              <Switch
                checked={settings?.allow_direct_lab_payment ?? false}
                onCheckedChange={(checked) =>
                  updateSetting("allow_direct_lab_payment", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Processing Unpaid Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Lab staff can collect samples and enter results before payment is received ("Pay Later" workflow)
                </p>
              </div>
              <Switch
                checked={settings?.allow_unpaid_processing ?? false}
                onCheckedChange={(checked) =>
                  updateSetting("allow_unpaid_processing", checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Collection Location</Label>
              <Select
                value={settings?.lab_payment_location ?? "reception"}
                onValueChange={(value) =>
                  updateSetting("lab_payment_location", value as "reception" | "lab" | "both")
                }
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reception">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Reception Only
                    </div>
                  </SelectItem>
                  <SelectItem value="lab">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4" />
                      Lab Counter Only
                    </div>
                  </SelectItem>
                  <SelectItem value="both">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Both Locations
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose where lab test payments can be collected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="bg-primary/10 rounded-full p-3 h-fit">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-medium">About Lab Workflow Settings</h4>
                <p className="text-sm text-muted-foreground">
                  These settings control how lab orders flow through your facility. 
                  If you disable the consultation requirement, reception staff with the 
                  <strong> laboratory.create-order</strong> permission will be able to 
                  create lab orders directly for walk-in patients.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  The payment location setting determines which counters can accept 
                  payment for lab services. This helps streamline your billing workflow 
                  based on your facility's layout and staffing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
