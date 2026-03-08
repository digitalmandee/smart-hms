import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, FileText, Pill, CheckCircle, AlertCircle, Settings } from "lucide-react";

export function WasfatyConfigPanel() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["wasfaty-config", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("organizations")
        .select("wasfaty_enabled, wasfaty_facility_id")
        .eq("id", profile.organization_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id && country_code === 'SA',
  });

  const [facilityId, setFacilityId] = useState(config?.wasfaty_facility_id || "");
  const [enabled, setEnabled] = useState(config?.wasfaty_enabled || false);

  const updateConfig = useMutation({
    mutationFn: async (values: { wasfaty_enabled: boolean; wasfaty_facility_id: string }) => {
      if (!profile?.organization_id) throw new Error("No organization");
      const { error } = await supabase
        .from("organizations")
        .update(values)
        .eq("id", profile.organization_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wasfaty-config"] });
      toast.success(t("wasfaty.configSaved" as any, "Wasfaty configuration saved"));
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    },
  });

  if (country_code !== 'SA') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            {t("wasfaty.title" as any, "Wasfaty E-Prescription")}
          </CardTitle>
          <CardDescription>
            {t("wasfaty.ksaOnly" as any, "Wasfaty integration is only available for Saudi Arabia")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              {t("wasfaty.title" as any, "Wasfaty E-Prescription")}
            </CardTitle>
            <CardDescription>
              {t("wasfaty.description" as any, "Saudi MOH electronic prescription system integration")}
            </CardDescription>
          </div>
          <Badge variant={config?.wasfaty_enabled ? "default" : "secondary"}>
            {config?.wasfaty_enabled 
              ? t("common.enabled", "Enabled") 
              : t("common.disabled", "Disabled")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>{t("wasfaty.enableIntegration" as any, "Enable Wasfaty Integration")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("wasfaty.enableDescription" as any, "Allow sending prescriptions to Wasfaty")}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facilityId">
              {t("wasfaty.facilityId" as any, "MOH Facility ID")}
            </Label>
            <Input
              id="facilityId"
              placeholder="e.g., MOH-123456"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("wasfaty.facilityIdHint" as any, "Your facility's MOH registration number")}
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4" />
            {t("wasfaty.apiConfig" as any, "API Configuration")}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("wasfaty.apiConfigNote" as any, "Wasfaty API credentials are configured in Edge Function secrets. Contact your administrator to set up WASFATY_API_KEY.")}
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => updateConfig.mutate({ 
              wasfaty_enabled: enabled, 
              wasfaty_facility_id: facilityId 
            })}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("common.save", "Save")}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium">{t("wasfaty.features" as any, "Features")}</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{t("wasfaty.feature1" as any, "Electronic prescription submission")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{t("wasfaty.feature2" as any, "Real-time status tracking")}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{t("wasfaty.feature3" as any, "Dispensing verification")}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>{t("wasfaty.feature4" as any, "SFDA drug database (coming soon)")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
