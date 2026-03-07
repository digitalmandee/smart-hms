import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { Calendar, DollarSign } from "lucide-react";

export default function MealPlanningPage() {
  const { t } = useTranslation();

  return (
    <div>
      <PageHeader
        title={t("kitchen.mealPlanning" as any, "Meal Planning")}
        description={t("kitchen.mealPlanningDesc" as any, "Weekly meal planning, menu templates, and cost tracking")}
        breadcrumbs={[
          { label: t("kitchen.title" as any, "Kitchen"), href: "/app/kitchen" },
          { label: t("kitchen.mealPlanning" as any, "Meal Planning") },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Menu Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              Weekly meal planning calendar — configure menu templates per diet type for each day of the week.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost per Meal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              Track meal costs per patient per day. Configure ingredient costs and calculate per-meal expenses.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
