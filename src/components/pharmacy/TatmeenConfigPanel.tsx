import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanBarcode, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function TatmeenConfigPanel() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanBarcode className="h-5 w-5" />
          {t("tatmeen.configTitle" as any, "RSD / Tatmeen Configuration")}
        </CardTitle>
        <CardDescription>
          {t("tatmeen.configDescription" as any, "SFDA Drug Track & Trace (RSD/Tatmeen) integration for GS1 barcode scanning and drug movement reporting")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">{t("tatmeen.apiStatus" as any, "API Connection")}</p>
            <p className="text-sm text-muted-foreground">
              {t("tatmeen.apiDescription" as any, "Connect to SFDA Tatmeen platform")}
            </p>
          </div>
          <Badge variant="outline">{t("tatmeen.sandbox" as any, "Sandbox")}</Badge>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">{t("tatmeen.gs1Support" as any, "GS1 Barcode Support")}</p>
            <p className="text-sm text-muted-foreground">
              {t("tatmeen.gs1Description" as any, "DataMatrix (2D) barcode scanning for drug verification")}
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">{t("common.enabled" as any, "Enabled")}</Badge>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">{t("tatmeen.eventTypes" as any, "Supported Events")}</p>
            <p className="text-sm text-muted-foreground">
              {t("tatmeen.eventDescription" as any, "Receive, Dispense, Return, Transfer, Destroy")}
            </p>
          </div>
          <Badge variant="secondary">5 {t("tatmeen.types" as any, "types")}</Badge>
        </div>

        <Button variant="outline" className="w-full gap-2" asChild>
          <a href="https://tatmeen.sfda.gov.sa" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("tatmeen.openPortal" as any, "Open SFDA Tatmeen Portal")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
