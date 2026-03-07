import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Clock, ChefHat, Truck } from "lucide-react";
import { useKitchenStats } from "@/hooks/useKitchen";
import { useTranslation } from "@/lib/i18n";

export default function KitchenDashboard() {
  const { t } = useTranslation();
  const stats = useKitchenStats();

  return (
    <div>
      <PageHeader
        title={t("kitchen.dashboard" as any, "Kitchen Dashboard")}
        description={t("kitchen.dashboardDesc" as any, "Overview of meal orders and kitchen operations")}
        breadcrumbs={[{ label: t("kitchen.title" as any, "Kitchen") }]}
      />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals Today</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_meals_today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              <ChefHat className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.preparing}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Truck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
        </div>

        {/* Diet Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Diet Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.diet_distribution).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active patients</p>
              ) : (
                Object.entries(stats.diet_distribution).map(([diet, count]) => (
                  <Badge key={diet} variant="secondary" className="text-sm py-1 px-3">
                    {diet}: {count}
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
