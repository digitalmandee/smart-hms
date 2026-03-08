import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { useKsaConnectionTest } from "@/hooks/useKsaConnectionTest";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlayCircle, Smartphone, Info } from "lucide-react";

export default function KsaSehhatySettingsPage() {
  const { t } = useTranslation();
  const { testConnection, testing, results } = useKsaConnectionTest();
  const result = results["sehhaty"];

  return (
    <div className="space-y-6">
      <PageHeader title={t("sehhaty.title" as any, "Sehhaty Patient App")} description={t("sehhaty.description" as any, "Push appointments, lab results and sick leave to patients' Sehhaty app")} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("ksa.testConnection" as any, "Test Connection")}</CardTitle>
          <div className="flex items-center gap-2">
            {result && <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅ Passed" : "❌ Failed"}</Badge>}
            <Button size="sm" disabled={testing === "sehhaty"} onClick={() => testConnection("sehhaty")}>
              {testing === "sehhaty" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
              {t("common.test" as any, "Test")}
            </Button>
          </div>
        </CardHeader>
        {result && <CardContent><p className={`text-sm ${result.success ? "text-green-600" : "text-destructive"}`}>{result.message}</p></CardContent>}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>{t("sehhaty.config" as any, "Sehhaty Configuration")}</CardTitle>
          </div>
          <CardDescription>{t("sehhaty.configDesc" as any, "Configure Sehhaty API credentials for patient data sync.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t("sehhaty.secretsInfo" as any, "Sehhaty credentials (SEHHATY_API_KEY, SEHHATY_API_URL) must be added as Edge Function secrets in the Supabase dashboard.")}</p>
              <p>{t("sehhaty.sandboxNote" as any, "Without credentials, the gateway runs in sandbox mode.")}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("sehhaty.apiUrl" as any, "API URL")}</Label>
              <Input placeholder="https://api.sehhaty.sa/v1" disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("sehhaty.apiKey" as any, "API Key")}</Label>
              <Input placeholder="SEHHATY_API_KEY" disabled className="bg-muted" type="password" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
