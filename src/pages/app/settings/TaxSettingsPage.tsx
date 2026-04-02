import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Percent, Save, Loader2, ExternalLink } from "lucide-react";

export default function TaxSettingsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [defaultTaxRate, setDefaultTaxRate] = useState("0");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxLabel, setTaxLabel] = useState("GST");

  // Fetch organization settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["tax-settings", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", profile.organization_id)
        .in("setting_key", ["default_tax_rate", "tax_enabled", "tax_label"]);
      if (error) throw error;

      const settingsMap = Object.fromEntries(
        data.map((s) => [s.setting_key, s.setting_value])
      );

      setDefaultTaxRate(settingsMap.default_tax_rate || "0");
      setTaxEnabled(settingsMap.tax_enabled !== "false");
      setTaxLabel(settingsMap.tax_label || "GST");

      return settingsMap;
    },
    enabled: !!profile?.organization_id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error("Organization not found");

      const settingsToSave = [
        { key: "default_tax_rate", value: defaultTaxRate },
        { key: "tax_enabled", value: taxEnabled.toString() },
        { key: "tax_label", value: taxLabel },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("organization_settings")
          .upsert(
            {
              organization_id: profile.organization_id,
              setting_key: setting.key,
              setting_value: setting.value,
            },
            {
              onConflict: "organization_id,setting_key",
            }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-settings"] });
      toast({
        title: "Settings Saved",
        description: "Tax settings have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save tax settings.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tax Settings</h1>
          <p className="text-muted-foreground">
            Configure tax rates and settings for your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Tax Configuration
          </CardTitle>
          <CardDescription>
            Set default tax rates for invoices and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Tax</Label>
              <p className="text-sm text-muted-foreground">
                Apply tax to invoices and bills
              </p>
            </div>
            <Switch
              checked={taxEnabled}
              onCheckedChange={setTaxEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax-label">Tax Label</Label>
            <Input
              id="tax-label"
              placeholder="GST, VAT, Sales Tax, etc."
              value={taxLabel}
              onChange={(e) => setTaxLabel(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              This label will appear on invoices and receipts
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-rate">Default Tax Rate (%)</Label>
            <div className="relative w-32">
              <Input
                id="default-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                className="pr-8"
              />
              <Percent className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Default tax rate applied to new invoices
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Billing Tax Slabs
          </CardTitle>
          <CardDescription>
            Manage different tax rates for different service categories (e.g., Standard 17%, Zero Rated, Reduced 5%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate("/app/settings/billing-tax-slabs")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Tax Slabs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
