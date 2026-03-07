import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Shield, DollarSign } from "lucide-react";

export default function AMCTrackingPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("assets.amc" as any, "AMC Tracking")}
        description={t("assets.amcDesc" as any, "Annual Maintenance Contracts management")}
        breadcrumbs={[
          { label: t("assets.title" as any, "Assets"), href: "/app/assets" },
          { label: t("assets.amc" as any, "AMC Tracking") },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              List of active AMC contracts with renewal dates, vendor contacts, and coverage details.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Cost Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              Annual maintenance costs by asset category and vendor performance.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
