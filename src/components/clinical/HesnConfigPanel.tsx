import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function HesnConfigPanel() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          {t("hesn.configTitle" as any, "HESN Configuration")}
        </CardTitle>
        <CardDescription>
          {t("hesn.configDescription" as any, "Health Electronic Surveillance Network (HESN) for communicable disease and immunization reporting to MOH")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">{t("hesn.apiStatus" as any, "API Connection")}</p>
            <p className="text-sm text-muted-foreground">
              {t("hesn.apiDescription" as any, "Connect to MOH HESN platform")}
            </p>
          </div>
          <Badge variant="outline">{t("hesn.sandbox" as any, "Sandbox")}</Badge>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">{t("hesn.reportTypes" as any, "Report Types")}</p>
            <p className="text-sm text-muted-foreground">
              {t("hesn.reportTypesDescription" as any, "Communicable Disease, Immunization, Outbreak, Adverse Event")}
            </p>
          </div>
          <Badge variant="secondary">4 {t("hesn.types" as any, "types")}</Badge>
        </div>

        <Button variant="outline" className="w-full gap-2" asChild>
          <a href="https://hesn.moh.gov.sa" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t("hesn.openPortal" as any, "Open HESN Portal")}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
