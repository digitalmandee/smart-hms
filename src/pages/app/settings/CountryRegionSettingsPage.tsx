import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization, useUpdateOrganization } from "@/hooks/useOrganizations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRY_PRESETS, COUNTRY_OPTIONS, type CountryCode } from "@/lib/countryPresets";
import { Globe, DollarSign, FileText, Phone, Calendar, Shield, Loader2, Languages } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function CountryRegionSettingsPage() {
  const { profile } = useAuth();
  const { data: org, isLoading } = useOrganization(profile?.organization_id || undefined);
  const updateOrg = useUpdateOrganization();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("PK");
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");
  const [currencyCode, setCurrencyCode] = useState("PKR");
  const [taxLabel, setTaxLabel] = useState("GST");
  const [taxRate, setTaxRate] = useState("17");
  const [nationalIdLabel, setNationalIdLabel] = useState("CNIC");
  const [nationalIdFormat, setNationalIdFormat] = useState("XXXXX-XXXXXXX-X");
  const [taxRegLabel, setTaxRegLabel] = useState("NTN");
  const [phoneCode, setPhoneCode] = useState("+92");
  const [eInvoicingEnabled, setEInvoicingEnabled] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(["en"]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);

  // Load current org config
  useEffect(() => {
    if (org) {
      const o = org as any;
      setSelectedCountry((o.country_code as CountryCode) || "PK");
      setCurrencySymbol(o.currency_symbol || "Rs.");
      setCurrencyCode(o.currency_code || "PKR");
      setTaxLabel(o.tax_label || "GST");
      setTaxRate(o.default_tax_rate?.toString() || "17");
      setNationalIdLabel(o.national_id_label || "CNIC");
      setNationalIdFormat(o.national_id_format || "XXXXX-XXXXXXX-X");
      setTaxRegLabel(o.tax_registration_label || "NTN");
      setPhoneCode(o.phone_country_code || "+92");
      setEInvoicingEnabled(o.e_invoicing_enabled || false);
      setDefaultLanguage(o.default_language || "en");
      setSupportedLanguages((o.supported_languages as string[]) || ["en"]);
    }
  }, [org]);

  const applyPreset = (code: CountryCode) => {
    const preset = COUNTRY_PRESETS[code];
    setSelectedCountry(code);
    setCurrencySymbol(preset.currency_symbol);
    setCurrencyCode(preset.currency_code);
    setTaxLabel(preset.tax_label);
    setTaxRate(preset.default_tax_rate.toString());
    setNationalIdLabel(preset.national_id_label);
    setNationalIdFormat(preset.national_id_format);
    setTaxRegLabel(preset.tax_registration_label);
    setPhoneCode(preset.phone_country_code);
    setEInvoicingEnabled(preset.e_invoicing_enabled);
  };

  const handleSave = async () => {
    if (!profile?.organization_id) return;
    setIsSaving(true);

    const preset = COUNTRY_PRESETS[selectedCountry];

    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          country: preset.country_name,
          country_code: selectedCountry,
          currency_code: currencyCode,
          currency_symbol: currencySymbol,
          currency_locale: preset.currency_locale,
          tax_label: taxLabel,
          default_tax_rate: parseFloat(taxRate) || preset.default_tax_rate,
          national_id_label: nationalIdLabel,
          national_id_format: nationalIdFormat,
          date_format: preset.date_format,
          fiscal_year_start: preset.fiscal_year_start,
          e_invoicing_enabled: eInvoicingEnabled,
          e_invoicing_provider: preset.e_invoicing_provider,
          tax_registration_label: taxRegLabel,
          phone_country_code: phoneCode,
          working_days: preset.working_days,
          working_hours_start: undefined,
          working_hours_end: undefined,
        } as any)
        .eq("id", profile.organization_id);

      if (error) throw error;

      toast({
        title: "Country settings saved",
        description: `Organization configured for ${preset.country_name}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLanguage = async () => {
    if (!profile?.organization_id) return;
    setIsSavingLanguage(true);
    try {
      const { error } = await supabase.rpc("set_org_language", {
        p_language: defaultLanguage,
        p_supported_languages: supportedLanguages,
      } as any);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["country-config", profile.organization_id] });
      const langLabel = { en: "English", ar: "العربية", ur: "اردو" }[defaultLanguage] || defaultLanguage;
      toast({ title: "Language updated", description: `UI language set to ${langLabel}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSavingLanguage(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Country & Region"
          breadcrumbs={[{ label: "Settings", href: "/app/settings" }, { label: "Country & Region" }]}
        />
        <Card><CardContent className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent></Card>
      </div>
    );
  }

  const currentPreset = COUNTRY_PRESETS[selectedCountry];

  return (
    <div>
      <PageHeader
        title="Country & Region"
        description="Configure country-specific settings for currency, tax, ID formats, and compliance"
        breadcrumbs={[{ label: "Settings", href: "/app/settings" }, { label: "Country & Region" }]}
      />

      <div className="space-y-6">
        {/* Country Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Country Selection
            </CardTitle>
            <CardDescription>
              Select the country to apply regional presets. You can override individual settings below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {COUNTRY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => applyPreset(option.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedCountry === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.flag}</span>
                      <div>
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {COUNTRY_PRESETS[option.value].currency_code} · {COUNTRY_PRESETS[option.value].tax_label} {COUNTRY_PRESETS[option.value].default_tax_rate}%
                        </p>
                      </div>
                    </div>
                    {selectedCountry === option.value && (
                      <Badge className="mt-2" variant="default">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Currency Code</Label>
                <Input value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Locale</Label>
                <Input value={currentPreset.currency_locale} disabled />
                <p className="text-xs text-muted-foreground">Auto-set by country</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tax Label</Label>
                <Input value={taxLabel} onChange={(e) => setTaxLabel(e.target.value)} placeholder="GST / VAT" />
              </div>
              <div className="space-y-2">
                <Label>Default Tax Rate (%)</Label>
                <Input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tax Registration Label</Label>
                <Input value={taxRegLabel} onChange={(e) => setTaxRegLabel(e.target.value)} placeholder="NTN / VAT TIN / TRN" />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">E-Invoicing (ZATCA)</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCountry === "SA"
                    ? "Required for Saudi Arabia — ZATCA Phase 2 compliance"
                    : "Not required for this country"}
                </p>
              </div>
              <Switch checked={eInvoicingEnabled} onCheckedChange={setEInvoicingEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Identity & Phone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Patient Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>National ID Label</Label>
                <Input value={nationalIdLabel} onChange={(e) => setNationalIdLabel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ID Format Placeholder</Label>
                <Input value={nationalIdFormat} onChange={(e) => setNationalIdFormat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone Country Code</Label>
                <Input value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              UI Language
            </CardTitle>
            <CardDescription>
              Enable languages for your organization and set the default. Arabic enables full RTL layout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enable/disable languages */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Enabled Languages</p>
              <div className="space-y-2">
                {[
                  { code: "en", label: "English", sublabel: "Left-to-right layout" },
                  { code: "ar", label: "العربية — Arabic", sublabel: "Right-to-left (RTL) layout" },
                  { code: "ur", label: "اردو — Urdu", sublabel: "Right-to-left (RTL) layout" },
                ].map((lang) => {
                  const isEnabled = supportedLanguages.includes(lang.code);
                  const isDefault = defaultLanguage === lang.code;
                  return (
                    <div
                      key={lang.code}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isEnabled ? "border-primary/40 bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={isEnabled}
                          disabled={lang.code === "en"} // English always required
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSupportedLanguages((prev) => [...prev, lang.code]);
                            } else {
                              // Can't disable the current default
                              if (defaultLanguage === lang.code) {
                                setDefaultLanguage("en");
                              }
                              setSupportedLanguages((prev) => prev.filter((l) => l !== lang.code));
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium text-sm">{lang.label}</p>
                          <p className="text-xs text-muted-foreground">{lang.sublabel}</p>
                        </div>
                      </div>
                      {isEnabled && (
                        <button
                          onClick={() => setDefaultLanguage(lang.code)}
                          className={`text-xs px-3 py-1 rounded-full border transition-all ${
                            isDefault
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {isDefault ? "Default ✓" : "Set Default"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveLanguage} disabled={isSavingLanguage}>
                {isSavingLanguage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Language Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configuration Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="font-semibold">{currencySymbol} ({currencyCode})</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Tax</p>
                <p className="font-semibold">{taxLabel} {taxRate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">ID Type</p>
                <p className="font-semibold">{nationalIdLabel}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Timezone</p>
                <p className="font-semibold">{currentPreset.timezone}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Working Days</p>
                <p className="font-semibold capitalize">{currentPreset.working_days.slice(0, 3).join(", ")}...</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Languages</p>
                <p className="font-semibold">{currentPreset.supported_languages.join(", ").toUpperCase()}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Fiscal Year</p>
                <p className="font-semibold">Starts Month {currentPreset.fiscal_year_start}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">E-Invoicing</p>
                <p className="font-semibold">{eInvoicingEnabled ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Country Settings
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apply Country Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will update currency ({currencyCode}), tax ({taxLabel} {taxRate}%), ID format ({nationalIdLabel}), 
                  working days, and timezone for your organization. Existing financial data will not be converted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave}>Apply Settings</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
