import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Calendar, Wrench } from "lucide-react";

export default function MaintenanceSchedulePage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("assets.maintenance" as any, "Maintenance Schedule")}
        description={t("assets.maintenanceDesc" as any, "Preventive maintenance calendar and work orders")}
        breadcrumbs={[
          { label: t("assets.title" as any, "Assets"), href: "/app/assets" },
          { label: t("assets.maintenance" as any, "Maintenance") },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Preventive Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              Maintenance calendar with scheduled tasks, technician assignments, and due dates.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" />Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              Open, in-progress, and completed work orders with priority tracking.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
