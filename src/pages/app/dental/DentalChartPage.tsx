import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDentalChart, useUpsertDentalChart } from "@/hooks/useDental";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// FDI tooth numbering: Q1 (11-18), Q2 (21-28), Q3 (31-38), Q4 (41-48)
const QUADRANTS = [
  { label: "Upper Right (Q1)", teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: "Upper Left (Q2)", teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: "Lower Left (Q3)", teeth: [38, 37, 36, 35, 34, 33, 32, 31] },
  { label: "Lower Right (Q4)", teeth: [41, 42, 43, 44, 45, 46, 47, 48] },
];

const CONDITIONS = ["healthy", "decayed", "missing", "restored", "crown", "implant", "bridge", "root_canal", "fractured"];
const CONDITION_COLORS: Record<string, string> = {
  healthy: "bg-green-100 text-green-800 border-green-300",
  decayed: "bg-red-100 text-red-800 border-red-300",
  missing: "bg-gray-200 text-gray-500 border-gray-300",
  restored: "bg-blue-100 text-blue-800 border-blue-300",
  crown: "bg-yellow-100 text-yellow-800 border-yellow-300",
  implant: "bg-purple-100 text-purple-800 border-purple-300",
  bridge: "bg-orange-100 text-orange-800 border-orange-300",
  root_canal: "bg-pink-100 text-pink-800 border-pink-300",
  fractured: "bg-red-200 text-red-900 border-red-400",
};

export default function DentalChartPage() {
  const [patientId, setPatientId] = useState("");
  const { data: chartData } = useDentalChart(patientId || undefined);
  const upsertChart = useUpsertDentalChart();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const toothMap = (chartData || []).reduce((acc: Record<number, any>, t: any) => {
    acc[t.tooth_number] = t;
    return acc;
  }, {});

  const handleConditionChange = (toothNumber: number, condition: string) => {
    if (!patientId) return;
    upsertChart.mutate({ patient_id: patientId, tooth_number: toothNumber, condition });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dental Chart"
        description="Interactive FDI tooth chart — select a patient to view/edit"
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: "Tooth Chart" }]}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <Input
              placeholder="Enter Patient ID to load chart..."
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
            />
          </div>

          {/* Tooth Chart Grid */}
          <div className="space-y-6">
            {QUADRANTS.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{q.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {q.teeth.map(tooth => {
                    const data = toothMap[tooth];
                    const condition = data?.condition || "healthy";
                    const colorClass = CONDITION_COLORS[condition] || "bg-muted";
                    return (
                      <button
                        key={tooth}
                        onClick={() => setSelectedTooth(selectedTooth === tooth ? null : tooth)}
                        className={`w-12 h-14 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold transition-all ${colorClass} ${selectedTooth === tooth ? "ring-2 ring-primary" : ""}`}
                      >
                        <span>{tooth}</span>
                        <span className="text-[9px] font-normal truncate">{condition === "healthy" ? "" : condition.slice(0, 4)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Selected tooth detail */}
          {selectedTooth && patientId && (
            <div className="mt-6 p-4 border rounded-lg">
              <p className="font-semibold mb-2">Tooth #{selectedTooth}</p>
              <Select
                value={toothMap[selectedTooth]?.condition || "healthy"}
                onValueChange={val => handleConditionChange(selectedTooth, val)}
              >
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CONDITIONS.map(c => (
              <Badge key={c} variant="outline" className={CONDITION_COLORS[c]}>{c.replace("_", " ")}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
