import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { useKsaConnectionTest } from "@/hooks/useKsaConnectionTest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, Receipt, Info, CheckCircle2 } from "lucide-react";

export default function KsaZatcaSettingsPage() {
  const { t } = useTranslation();
  const { testConnection, testing, results } = useKsaConnectionTest();
  const result = results["zatca"];

  return (
    <div className="space-y-6">
      <PageHeader title={t("zatca.title" as any, "ZATCA E-Invoicing")} description={t("zatca.description" as any, "ZATCA Phase 2 e-invoicing clearance & reporting configuration")} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("ksa.testConnection" as any, "Test Connection")}</CardTitle>
          <div className="flex items-center gap-2">
            {result && <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅ Passed" : "❌ Failed"}</Badge>}
            <Button size="sm" disabled={testing === "zatca"} onClick={() => testConnection("zatca")}>
              {testing === "zatca" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
              {t("common.test" as any, "Test")}
            </Button>
          </div>
        </CardHeader>
        {result && <CardContent><p className={`text-sm ${result.success ? "text-green-600" : "text-destructive"}`}>{result.message}</p></CardContent>}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>{t("zatca.config" as any, "ZATCA Phase 2 Status")}</CardTitle>
          </div>
          <CardDescription>{t("zatca.configDesc" as any, "UBL 2.1 XML generation, SHA-256 hashing and clearance API")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {["UBL 2.1 XML Generation", "SHA-256 Invoice Hashing", "Previous Invoice Hash Chaining", "TLV QR Code (8 fields)", "Clearance API Integration", "Reporting API Integration"].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p>{t("zatca.secretsInfo" as any, "ZATCA credentials are managed via Edge Function secrets: ZATCA_API_URL, ZATCA_CERTIFICATE, ZATCA_PRIVATE_KEY, ZATCA_SECRET.")}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("zatca.apiUrl" as any, "API URL")}</Label>
              <Input placeholder="https://gw-fatoora.zatca.gov.sa" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("zatca.certificate" as any, "Certificate")}</Label>
              <Input placeholder="ZATCA_CERTIFICATE" disabled className="bg-muted" type="password" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
