import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDentalChart, useUpsertDentalChart } from "@/hooks/useDental";
import { useToothSurfaces, useUpsertToothSurface, useLogToothHistory } from "@/hooks/useDentalCharting";
import Dental3DChart, { ToothState } from "@/components/dental/Dental3DChart";
import Odontogram2D from "@/components/dental/Odontogram2D";
import ToothDetailPanel from "@/components/dental/ToothDetailPanel";
import ConditionPalette from "@/components/dental/ConditionPalette";
import PerioChart from "@/components/dental/PerioChart";
import {
  CONDITIONS,
  CONDITION_MAP,
  Dentition,
  SurfaceKey,
  getQuadrants,
  normalizeCondition,
} from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";
import { Printer } from "lucide-react";

export default function DentalChartPage() {
  const { profile } = useAuth();
  const { dt, isRTL } = useDentalT();
  const [patientId, setPatientId] = useState("");
  const [dentition, setDentition] = useState<Dentition>("permanent");
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [jawView, setJawView] = useState<"both" | "upper" | "lower">("both");
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [paintCondition, setPaintCondition] = useState<string | null>(null);

  const { data: chartRows } = useDentalChart(patientId || undefined);
  const { data: surfaceRows } = useToothSurfaces(patientId || undefined);
  const upsertChart = useUpsertDentalChart();
  const upsertSurface = useUpsertToothSurface();
  const logHistory = useLogToothHistory();

  const { data: patients } = useQuery({
    queryKey: ["patients-dental-chart", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("patients").select("id, first_name, last_name, patient_number") as any)
        .eq("organization_id", profile!.organization_id!).order("first_name").limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const chartMap = useMemo(() => {
    const m: Record<number, any> = {};
    (chartRows || []).forEach((r: any) => { m[r.tooth_number] = r; });
    return m;
  }, [chartRows]);

  const toothStates = useMemo(() => {
    const states: Record<number, ToothState> = {};
    (chartRows || []).forEach((r: any) => {
      states[r.tooth_number] = { condition: normalizeCondition(r.condition), surfaces: {} };
    });
    (surfaceRows || []).forEach((r: any) => {
      if (!states[r.tooth_number]) states[r.tooth_number] = { condition: "healthy", surfaces: {} };
      states[r.tooth_number].surfaces[r.surface as SurfaceKey] = normalizeCondition(r.condition);
    });
    return states;
  }, [chartRows, surfaceRows]);

  const setToothCondition = (tooth: number, condition: string) => {
    if (!patientId) return;
    const prev = chartMap[tooth]?.condition;
    upsertChart.mutate({ patient_id: patientId, tooth_number: tooth, condition, notes: chartMap[tooth]?.notes });
    logHistory.mutate({ patient_id: patientId, tooth_number: tooth, previous_condition: prev, new_condition: condition });
  };

  const setSurfaceCondition = (tooth: number, surface: SurfaceKey, condition: string) => {
    if (!patientId) return;
    upsertSurface.mutate({
      patient_id: patientId,
      tooth_number: tooth,
      surface,
      condition,
      previous_condition: toothStates[tooth]?.surfaces?.[surface],
    });
  };

  // Painting: applies the picked condition to a tooth (whole-tooth condition) or a surface
  const handlePaintSurface = (tooth: number, surface: SurfaceKey) => {
    if (!paintCondition) { setSelectedTooth(tooth); return; }
    const def = CONDITION_MAP[paintCondition];
    if (def?.scope === "tooth") setToothCondition(tooth, paintCondition);
    else setSurfaceCondition(tooth, surface, paintCondition);
  };

  const handleSelectTooth = (tooth: number | null) => {
    if (tooth !== null && paintCondition && CONDITION_MAP[paintCondition]?.scope === "tooth") {
      setToothCondition(tooth, paintCondition);
      setSelectedTooth(tooth);
      return;
    }
    setSelectedTooth(tooth);
  };

  const resetTooth = (tooth: number) => {
    setToothCondition(tooth, "healthy");
    (["M", "D", "B", "L", "O"] as SurfaceKey[]).forEach((s) => {
      if (toothStates[tooth]?.surfaces?.[s] && toothStates[tooth].surfaces[s] !== "healthy") {
        setSurfaceCondition(tooth, s, "healthy");
      }
    });
  };

  const markQuadrantHealthy = (teeth: number[]) => teeth.forEach((t) => setToothCondition(t, "healthy"));

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={dt("dental.chart")}
        description={dt("dental.paintHint")}
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: dt("dental.odontogram") }]}
        actions={
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button variant={viewMode === "3d" ? "default" : "outline"} size="sm" onClick={() => setViewMode("3d")}>{dt("dental.view3d")}</Button>
            <Button variant={viewMode === "2d" ? "default" : "outline"} size="sm" onClick={() => setViewMode("2d")}>{dt("dental.view2d")}</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="h-4 w-4" />{dt("dental.print")}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={patientId} onValueChange={(v) => { setPatientId(v); setSelectedTooth(null); }}>
              <SelectTrigger><SelectValue placeholder={dt("dental.selectPatient")} /></SelectTrigger>
              <SelectContent>
                {(patients || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.patient_number}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dentition} onValueChange={(v) => setDentition(v as Dentition)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">{dt("dental.permanent")}</SelectItem>
                <SelectItem value="primary">{dt("dental.primary")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={jawView} onValueChange={(v) => setJawView(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="both">{dt("dental.both")}</SelectItem>
                <SelectItem value="upper">{dt("dental.upper")}</SelectItem>
                <SelectItem value="lower">{dt("dental.lower")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!patientId && <p className="text-sm text-muted-foreground">{dt("dental.selectPatientFirst")}</p>}
        </CardContent>
      </Card>

      {patientId && (
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">{dt("dental.odontogram")}</TabsTrigger>
            <TabsTrigger value="perio">{dt("dental.perio")}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">{dt("dental.paintMode")}</p>
                <ConditionPalette value={paintCondition} onChange={setPaintCondition} />
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    {viewMode === "3d" ? (
                      <Dental3DChart
                        dentition={dentition}
                        toothStates={toothStates}
                        selectedTooth={selectedTooth}
                        onSelectTooth={handleSelectTooth}
                        onPaintSurface={handlePaintSurface}
                        jawView={jawView}
                      />
                    ) : (
                      <Odontogram2D
                        dentition={dentition}
                        toothStates={toothStates}
                        selectedTooth={selectedTooth}
                        onSelectTooth={handleSelectTooth}
                        onPaintSurface={handlePaintSurface}
                      />
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {getQuadrants(dentition).map((q) => (
                        <Button key={q.key} variant="outline" size="sm" onClick={() => markQuadrantHealthy(q.teeth)}>
                          {dt(`quadrant.${q.labelKey}`)} · {dt("dental.markQuadrant")}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs font-medium text-muted-foreground mb-2">{dt("dental.legend")}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CONDITIONS.map((c) => (
                        <Badge key={c.key} variant="outline" className="gap-1.5 font-normal">
                          <span className="w-2.5 h-2.5 rounded-sm border border-black/10" style={{ backgroundColor: c.color }} />
                          {dt(`cond.${c.key}`)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                {selectedTooth ? (
                  <ToothDetailPanel
                    patientId={patientId}
                    toothNumber={selectedTooth}
                    state={toothStates[selectedTooth] || { condition: "healthy", surfaces: {} }}
                    notes={chartMap[selectedTooth]?.notes}
                    onSetToothCondition={(c) => setToothCondition(selectedTooth, c)}
                    onSetSurfaceCondition={(s, c) => setSurfaceCondition(selectedTooth, s, c)}
                    onSaveNotes={(notes) =>
                      upsertChart.mutate({
                        patient_id: patientId,
                        tooth_number: selectedTooth,
                        condition: toothStates[selectedTooth]?.condition || "healthy",
                        notes,
                      })
                    }
                    onResetTooth={() => resetTooth(selectedTooth)}
                  />
                ) : (
                  <Card><CardContent className="pt-6 text-sm text-muted-foreground">{dt("dental.selectToothHint")}</CardContent></Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="perio">
            <PerioChart patientId={patientId} dentition={dentition} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
