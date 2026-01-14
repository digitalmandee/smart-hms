import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDietCharts } from "@/hooks/useDietCharts";
import { DietChartForm } from "./DietChartForm";
import { UtensilsCrossed, Plus, Droplets, Flame, Dumbbell } from "lucide-react";

const DIET_TYPE_LABELS: Record<string, string> = {
  normal: "Normal / Regular",
  soft: "Soft Diet",
  liquid: "Full Liquid",
  clear_liquid: "Clear Liquid",
  npo: "NPO (Nothing By Mouth)",
  diabetic: "Diabetic Diet",
  renal: "Renal Diet",
  cardiac: "Cardiac Diet",
  low_sodium: "Low Sodium",
  high_protein: "High Protein",
  low_fat: "Low Fat",
  bland: "Bland Diet",
  pureed: "Pureed",
  tube_feeding: "Tube Feeding",
  custom: "Custom Diet",
};

interface DietChartCardProps {
  admissionId: string;
  patientAllergies?: string[];
}

export function DietChartCard({ admissionId, patientAllergies = [] }: DietChartCardProps) {
  const { data: dietCharts = [], isLoading } = useDietCharts(admissionId);
  const [showNewChart, setShowNewChart] = useState(false);

  const currentChart = dietCharts[0]; // Most recent chart

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading diet chart...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Diet Chart
        </h3>
        <Dialog open={showNewChart} onOpenChange={setShowNewChart}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Diet Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Diet Chart</DialogTitle>
            </DialogHeader>
            <DietChartForm
              admissionId={admissionId}
              patientAllergies={patientAllergies}
              onSuccess={() => setShowNewChart(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {currentChart ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {DIET_TYPE_LABELS[currentChart.diet_type] || currentChart.diet_type}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Effective from {format(new Date(currentChart.effective_from), "MMM d, yyyy")}
                  {currentChart.effective_to && (
                    <> to {format(new Date(currentChart.effective_to), "MMM d, yyyy")}</>
                  )}
                </p>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nutritional Targets */}
            {(currentChart.calories_target ||
              currentChart.protein_target ||
              currentChart.carbs_target ||
              currentChart.fat_target) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentChart.calories_target && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-medium">{currentChart.calories_target} kcal</p>
                    </div>
                  </div>
                )}
                {currentChart.protein_target && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <Dumbbell className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-medium">{currentChart.protein_target}g</p>
                    </div>
                  </div>
                )}
                {currentChart.carbs_target && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className="h-4 w-4 text-yellow-500 font-bold text-xs">C</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-medium">{currentChart.carbs_target}g</p>
                    </div>
                  </div>
                )}
                {currentChart.fat_target && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <div className="h-4 w-4 text-purple-500 font-bold text-xs">F</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="font-medium">{currentChart.fat_target}g</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentChart.fluid_restriction_ml && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    Fluid Restriction: {currentChart.fluid_restriction_ml} ml/day
                  </p>
                </div>
              </div>
            )}

            {currentChart.custom_diet && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Custom Diet</h4>
                <p>{currentChart.custom_diet}</p>
              </div>
            )}

            {currentChart.allergies && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Food Allergies</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentChart.allergies.split(",").map((allergy, i) => (
                    <Badge key={i} variant="destructive">
                      {allergy.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentChart.restrictions && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Restrictions</h4>
                <p>{currentChart.restrictions}</p>
              </div>
            )}

            {currentChart.preferences && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Preferences</h4>
                <p>{currentChart.preferences}</p>
              </div>
            )}

            {currentChart.special_instructions && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Special Instructions</h4>
                <p>{currentChart.special_instructions}</p>
              </div>
            )}

            <div className="pt-2 border-t text-xs text-muted-foreground">
              Prescribed by {currentChart.prescribed_by_profile?.full_name || "Unknown"} on{" "}
              {format(new Date(currentChart.created_at), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No diet chart assigned yet</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowNewChart(true)}
            >
              Assign Diet Chart
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previous Charts */}
      {dietCharts.length > 1 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Previous Diet Charts</h4>
          <div className="space-y-2">
            {dietCharts.slice(1).map((chart: any) => (
              <div
                key={chart.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {DIET_TYPE_LABELS[chart.diet_type] || chart.diet_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(chart.effective_from), "MMM d, yyyy")} -{" "}
                    {chart.effective_to
                      ? format(new Date(chart.effective_to), "MMM d, yyyy")
                      : "Ongoing"}
                  </p>
                </div>
                <Badge variant="outline">Past</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
