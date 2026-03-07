import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function HousekeepingDashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("housekeeping.dashboard" as any, "Housekeeping")}
        description={t("housekeeping.dashboardDesc" as any, "Task management, inspections, and issue reporting")}
        breadcrumbs={[{ label: t("housekeeping.title" as any, "Housekeeping") }]}
      />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks Today</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">0</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">0</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">0</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">0</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No housekeeping tasks for today. Use Task Assignments to create cleaning tasks.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
