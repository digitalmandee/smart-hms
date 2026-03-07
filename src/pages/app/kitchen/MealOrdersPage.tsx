import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useKitchenOrders } from "@/hooks/useKitchen";
import { useTranslation } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors: Record<string, string> = {
  pending: "secondary",
  preparing: "default",
  ready: "success",
  delivered: "outline",
};

export default function MealOrdersPage() {
  const { t } = useTranslation();
  const [mealFilter, setMealFilter] = useState<string>("all");
  const { data: orders, isLoading } = useKitchenOrders();

  const filtered = orders?.filter((o) => mealFilter === "all" || o.meal_type === mealFilter) || [];

  return (
    <div>
      <PageHeader
        title={t("kitchen.mealOrders" as any, "Meal Orders")}
        description={t("kitchen.mealOrdersDesc" as any, "Kitchen work orders aggregated from IPD diet charts")}
        breadcrumbs={[
          { label: t("kitchen.title" as any, "Kitchen"), href: "/app/kitchen" },
          { label: t("kitchen.mealOrders" as any, "Meal Orders") },
        ]}
      />

      <div className="space-y-4">
        <div className="flex gap-3">
          <Select value={mealFilter} onValueChange={setMealFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Meals" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Meals</SelectItem>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Snack">Snack</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Bed</TableHead>
                    <TableHead>Diet Type</TableHead>
                    <TableHead>Meal</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No meal orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.patient_name}</TableCell>
                        <TableCell>{order.ward_name}</TableCell>
                        <TableCell>{order.bed_number}</TableCell>
                        <TableCell>{order.diet_type}</TableCell>
                        <TableCell>{order.meal_type}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[order.status] as any}>{order.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
