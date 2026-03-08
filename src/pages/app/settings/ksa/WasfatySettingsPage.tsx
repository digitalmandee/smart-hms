import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { WasfatyConfigPanel } from "@/components/pharmacy/WasfatyConfigPanel";
import { useKsaConnectionTest } from "@/hooks/useKsaConnectionTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle } from "lucide-react";

export default function KsaWasfatySettingsPage() {
  const { t } = useTranslation();
  const { testConnection, testing, results } = useKsaConnectionTest();
  const result = results["wasfaty"];

  return (
    <div className="space-y-6">
      <PageHeader title={t("wasfaty.title" as any, "Wasfaty E-Prescription")} description={t("wasfaty.description" as any, "Configure MOH electronic prescription gateway")} />
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{t("ksa.testConnection" as any, "Test Connection")}</CardTitle>
          <div className="flex items-center gap-2">
            {result && <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅ Passed" : "❌ Failed"}</Badge>}
            <Button size="sm" disabled={testing === "wasfaty"} onClick={() => testConnection("wasfaty")}>
              {testing === "wasfaty" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
              {t("common.test" as any, "Test")}
            </Button>
          </div>
        </CardHeader>
        {result && <CardContent><p className={`text-sm ${result.success ? "text-green-600" : "text-destructive"}`}>{result.message}</p></CardContent>}
      </Card>
      <WasfatyConfigPanel />
    </div>
  );
}
