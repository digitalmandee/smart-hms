import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { useKsaConnectionTest } from "@/hooks/useKsaConnectionTest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, Fingerprint, Info } from "lucide-react";

export default function KsaNafathSettingsPage() {
  const { t } = useTranslation();
  const { testConnection, testing, results } = useKsaConnectionTest();
  const result = results["nafath"];

  return (
    <div className="space-y-6">
      <PageHeader title={t("nafath.title" as any, "Nafath Identity Verification")} description={t("nafath.description" as any, "Configure national SSO identity verification for patients")} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("ksa.testConnection" as any, "Test Connection")}</CardTitle>
          <div className="flex items-center gap-2">
            {result && <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅ Passed" : "❌ Failed"}</Badge>}
            <Button size="sm" disabled={testing === "nafath"} onClick={() => testConnection("nafath")}>
              {testing === "nafath" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
              {t("common.test" as any, "Test")}
            </Button>
          </div>
        </CardHeader>
        {result && <CardContent><p className={`text-sm ${result.success ? "text-green-600" : "text-destructive"}`}>{result.message}</p></CardContent>}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <CardTitle>{t("nafath.config" as any, "Nafath Configuration")}</CardTitle>
          </div>
          <CardDescription>{t("nafath.configDesc" as any, "Set your Nafath API credentials. These are stored as Supabase Edge Function secrets.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t("nafath.secretsInfo" as any, "Nafath credentials (NAFATH_API_KEY, NAFATH_APP_ID, NAFATH_API_URL) must be added as Edge Function secrets in the Supabase dashboard.")}</p>
              <p>{t("nafath.sandboxNote" as any, "Without credentials, the gateway runs in sandbox mode and auto-approves verifications.")}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("nafath.appId" as any, "App ID")}</Label>
              <Input placeholder="NAFATH_APP_ID" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("nafath.apiUrl" as any, "API URL")}</Label>
              <Input placeholder="https://nafath.api.elm.sa/api/v1" disabled className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
