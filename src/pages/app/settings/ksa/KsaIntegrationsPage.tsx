import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { useKsaIntegrationStats } from "@/hooks/useKsaIntegrationStats";
import { useKsaConnectionTest, type KsaIntegration } from "@/hooks/useKsaConnectionTest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { FileText, Pill, ScanBarcode, ShieldAlert, Fingerprint, Smartphone, Receipt, Loader2, PlayCircle, Settings, AlertTriangle } from "lucide-react";

const INTEGRATIONS: {
  key: KsaIntegration;
  name: string;
  description: string;
  icon: React.ElementType;
  route: string;
  statKey: keyof ReturnType<typeof useKsaIntegrationStats>["data"] extends infer T ? T extends undefined ? never : T : never;
  statLabel: string;
}[] = [
  { key: "nphies", name: "NPHIES Insurance", description: "HL7 FHIR claims, eligibility & pre-auth", icon: FileText, route: "/app/settings/ksa/nphies", statKey: "nphiesClaims" as any, statLabel: "Claims" },
  { key: "zatca", name: "ZATCA Phase 2", description: "E-invoicing clearance & reporting", icon: Receipt, route: "/app/settings/ksa/zatca", statKey: "zatcaInvoices" as any, statLabel: "Invoices" },
  { key: "wasfaty", name: "Wasfaty E-Prescription", description: "MOH electronic prescription gateway", icon: Pill, route: "/app/settings/ksa/wasfaty", statKey: "wasfatyPrescriptions" as any, statLabel: "Prescriptions" },
  { key: "tatmeen", name: "Tatmeen / RSD", description: "SFDA drug track & trace", icon: ScanBarcode, route: "/app/settings/ksa/tatmeen", statKey: "tatmeenTransactions" as any, statLabel: "Transactions" },
  { key: "hesn", name: "HESN Public Health", description: "MOH communicable disease reporting", icon: ShieldAlert, route: "/app/settings/ksa/hesn", statKey: "hesnReports" as any, statLabel: "Reports" },
  { key: "nafath", name: "Nafath Identity", description: "National SSO identity verification", icon: Fingerprint, route: "/app/settings/ksa/nafath", statKey: "nafathVerified" as any, statLabel: "Verified" },
  { key: "sehhaty", name: "Sehhaty Patient App", description: "Push appointments & results to patients", icon: Smartphone, route: "/app/settings/ksa/sehhaty", statKey: "sehhatySyncs" as any, statLabel: "Synced" },
];

export default function KsaIntegrationsPage() {
  const { t } = useTranslation();
  const { country_code } = useCountryConfig();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useKsaIntegrationStats();
  const { testConnection, testing, results } = useKsaConnectionTest();

  if (country_code !== "SA") {
    return (
      <div className="space-y-6">
        <PageHeader title={t("ksa.title" as any, "KSA Compliance Integrations")} description={t("ksa.notAvailable" as any, "This page is only available for Saudi Arabia organizations")} />
        <Card><CardContent className="py-12 text-center"><AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t("ksa.saOnly" as any, "Configure your organization's country to Saudi Arabia to access KSA integrations.")}</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("ksa.title" as any, "🇸🇦 KSA Compliance Integrations")}
        description={t("ksa.description" as any, "Monitor and manage all Saudi regulatory integrations")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          const count = stats?.[integration.statKey as keyof typeof stats] ?? 0;
          const testResult = results[integration.key];
          const isTesting = testing === integration.key;

          return (
            <Card key={integration.key} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                  </div>
                  {testResult && (
                    <Badge variant={testResult.success ? "default" : "destructive"} className="text-xs">
                      {testResult.success ? "Connected" : "Error"}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">{integration.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{integration.statLabel}</span>
                  <span className="font-semibold text-foreground">
                    {statsLoading ? "..." : count}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => navigate(integration.route)}>
                    <Settings className="h-3 w-3" />
                    {t("common.configure" as any, "Configure")}
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1" disabled={isTesting} onClick={() => testConnection(integration.key)}>
                    {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
                    {t("common.test" as any, "Test")}
                  </Button>
                </div>
                {testResult && (
                  <p className={`text-xs ${testResult.success ? "text-green-600" : "text-destructive"}`}>
                    Last: {new Date(testResult.timestamp).toLocaleTimeString()} — {testResult.message.slice(0, 60)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
