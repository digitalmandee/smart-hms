import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Shield, Wifi, WifiOff, Eye, EyeOff, Save } from "lucide-react";
import { useNphiesConfig, useUpdateNphiesConfig, useTestNphiesConnection, type NphiesConfig } from "@/hooks/useNphiesConfig";

export function NphiesConfigPanel() {
  const { t } = useTranslation();
  const { data: config, isLoading } = useNphiesConfig();
  const updateConfig = useUpdateNphiesConfig();
  const testConnection = useTestNphiesConnection();
  const [form, setForm] = useState<NphiesConfig>({
    nphies_enabled: false,
    nphies_environment: "sandbox",
    nphies_facility_id: "",
    nphies_cchi_license: "",
    nphies_client_id: "",
    nphies_client_secret: "",
    nphies_base_url: "https://hsb.nphies.sa",
  });
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate(form);
  };

  const handleToggle = (enabled: boolean) => {
    setForm((prev) => ({ ...prev, nphies_enabled: enabled }));
  };

  const handleEnvChange = (env: string) => {
    const baseUrl = env === "production"
      ? "https://hsb.nphies.sa"
      : "https://hsb-stg.nphies.sa";
    setForm((prev) => ({
      ...prev,
      nphies_environment: env as "sandbox" | "production",
      nphies_base_url: baseUrl,
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
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
              <Shield className="h-5 w-5 text-primary" />
              {t("nphies.configTitle", "NPHIES Integration")}
            </CardTitle>
            <CardDescription>
              {t("nphies.configDescription", "Configure your organization's NPHIES credentials for electronic insurance transactions")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={form.nphies_enabled ? "default" : "secondary"}>
              {form.nphies_enabled
                ? t("nphies.enabled", "Enabled")
                : t("nphies.disabled", "Disabled")}
            </Badge>
            <Switch
              checked={form.nphies_enabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Environment Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("nphies.environment", "Environment")}</Label>
            <Select value={form.nphies_environment} onValueChange={handleEnvChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">
                  {t("nphies.sandbox", "Sandbox (Testing)")}
                </SelectItem>
                <SelectItem value="production">
                  {t("nphies.production", "Production")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("nphies.baseUrl", "Base URL")}</Label>
            <Input
              value={form.nphies_base_url}
              onChange={(e) => setForm((prev) => ({ ...prev, nphies_base_url: e.target.value }))}
              placeholder="https://hsb.nphies.sa"
            />
          </div>
        </div>

        {/* Facility Credentials */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("nphies.facilityCredentials", "Facility Credentials")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("nphies.facilityId", "NPHIES Facility ID")}</Label>
              <Input
                value={form.nphies_facility_id}
                onChange={(e) => setForm((prev) => ({ ...prev, nphies_facility_id: e.target.value }))}
                placeholder="e.g., FHIR-12345"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("nphies.cchiLicense", "CCHI License Number")}</Label>
              <Input
                value={form.nphies_cchi_license}
                onChange={(e) => setForm((prev) => ({ ...prev, nphies_cchi_license: e.target.value }))}
                placeholder="e.g., 123456789"
              />
            </div>
          </div>
        </div>

        {/* API Credentials */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("nphies.apiCredentials", "API Credentials")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("nphies.clientId", "Client ID")}</Label>
              <Input
                value={form.nphies_client_id}
                onChange={(e) => setForm((prev) => ({ ...prev, nphies_client_id: e.target.value }))}
                placeholder="NPHIES Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("nphies.clientSecret", "Client Secret")}</Label>
              <div className="relative">
                <Input
                  type={showSecret ? "text" : "password"}
                  value={form.nphies_client_secret}
                  onChange={(e) => setForm((prev) => ({ ...prev, nphies_client_secret: e.target.value }))}
                  placeholder="••••••••••"
                  className="pe-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute end-0 top-0 h-full px-3"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Save className="h-4 w-4 me-2" />
            )}
            {t("common.save", "Save Configuration")}
          </Button>
          <Button
            variant="outline"
            onClick={() => testConnection.mutate()}
            disabled={testConnection.isPending || !form.nphies_client_id}
          >
            {testConnection.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : form.nphies_enabled ? (
              <Wifi className="h-4 w-4 me-2" />
            ) : (
              <WifiOff className="h-4 w-4 me-2" />
            )}
            {t("nphies.testConnection", "Test Connection")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
