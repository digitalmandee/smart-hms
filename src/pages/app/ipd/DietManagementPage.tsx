import { useState } from "react";
import { format } from "date-fns";
import { UtensilsCrossed, Salad } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdmissions } from "@/hooks/useAdmissions";
import { useDietCharts } from "@/hooks/useDietCharts";
import { DietChartForm } from "@/components/ipd/DietChartForm";

const DietManagementPage = () => {
  const [selectedAdmission, setSelectedAdmission] = useState<string>("");

  const { data: admissions = [] } = useAdmissions();
  const activeAdmissions = admissions.filter((a) => a.status === "admitted");

  const { data: dietCharts = [], isLoading } = useDietCharts(
    selectedAdmission || undefined
  );

  const selectedAdmissionData = admissions.find((a) => a.id === selectedAdmission);

  const getDietTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      regular: "bg-green-100 text-green-800",
      soft: "bg-blue-100 text-blue-800",
      liquid: "bg-cyan-100 text-cyan-800",
      npo: "bg-red-100 text-red-800",
      diabetic: "bg-orange-100 text-orange-800",
      low_sodium: "bg-purple-100 text-purple-800",
      renal: "bg-pink-100 text-pink-800",
      cardiac: "bg-rose-100 text-rose-800",
      normal: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diet Management"
        description="Manage patient diet charts and restrictions"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAdmission} onValueChange={setSelectedAdmission}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select admitted patient" />
            </SelectTrigger>
            <SelectContent>
              {activeAdmissions.map((admission) => (
                <SelectItem key={admission.id} value={admission.id}>
                  {admission.admission_number} - {admission.patient?.first_name}{" "}
                  {admission.patient?.last_name} ({admission.bed?.bed_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAdmission && (
        <>
          <DietChartForm admissionId={selectedAdmission} />

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Salad className="h-5 w-5" />
                  Diet Charts
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedAdmissionData?.patient?.first_name}{" "}
                  {selectedAdmissionData?.patient?.last_name} - Bed{" "}
                  {selectedAdmissionData?.bed?.bed_number}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading diet charts...
                </div>
              ) : dietCharts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No diet charts created yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dietCharts.map((chart: any) => (
                    <Card key={chart.id} className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getDietTypeBadge(
                                chart.diet_type
                              )}`}
                            >
                              {chart.diet_type?.replace("_", " ").toUpperCase()}
                            </span>
                            <Badge variant={chart.is_active ? "default" : "secondary"}>
                              {chart.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(chart.effective_from || chart.start_date), "dd MMM yyyy")}
                            {(chart.effective_to || chart.end_date) &&
                              ` - ${format(new Date(chart.effective_to || chart.end_date), "dd MMM yyyy")}`}
                          </span>
                        </div>

                        {chart.restrictions && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Restrictions:</p>
                            <p className="text-sm text-muted-foreground">
                              {chart.restrictions}
                            </p>
                          </div>
                        )}

                        {chart.special_instructions && (
                          <div>
                            <p className="text-sm font-medium">Special Instructions:</p>
                            <p className="text-sm text-muted-foreground">
                              {chart.special_instructions}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DietManagementPage;
