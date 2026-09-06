import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToothSurfaceSelector from "./ToothSurfaceSelector";
import type { ToothState } from "./Dental3DChart";
import { SurfaceKey, SURFACE_CONDITIONS, TOOTH_CONDITIONS, surfaceLabelKey } from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";
import { useChartHistory } from "@/hooks/useDentalCharting";
import { useDentalImages } from "@/hooks/useDental";
import { RotateCcw } from "lucide-react";

interface Props {
  patientId: string;
  toothNumber: number;
  state: ToothState;
  notes?: string;
  onSetToothCondition: (condition: string) => void;
  onSetSurfaceCondition: (surface: SurfaceKey, condition: string) => void;
  onSaveNotes: (notes: string) => void;
  onResetTooth: () => void;
}

export default function ToothDetailPanel({
  patientId,
  toothNumber,
  state,
  notes,
  onSetToothCondition,
  onSetSurfaceCondition,
  onSaveNotes,
  onResetTooth,
}: Props) {
  const { dt } = useDentalT();
  const [activeSurface, setActiveSurface] = useState<SurfaceKey | null>(null);
  const [noteDraft, setNoteDraft] = useState(notes || "");
  const { data: history } = useChartHistory(patientId, toothNumber);
  const { data: images } = useDentalImages(patientId);
  const toothImages = (images || []).filter((i: any) => i.tooth_number === toothNumber);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{dt("dental.tooth")} #{toothNumber}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onResetTooth} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />{dt("dental.resetTooth")}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-3">
            <TabsTrigger value="chart">{dt("dental.odontogram")}</TabsTrigger>
            <TabsTrigger value="history">{dt("dental.history")}</TabsTrigger>
            <TabsTrigger value="images">{dt("dental.images")}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{dt("dental.toothCondition")}</p>
              <Select value={state?.condition || "healthy"} onValueChange={onSetToothCondition}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOOTH_CONDITIONS.map((c) => (
                    <SelectItem key={c.key} value={c.key}>{dt(`cond.${c.key}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">{dt("dental.surfaces")}</p>
              <ToothSurfaceSelector
                toothNumber={toothNumber}
                surfaces={state?.surfaces || {}}
                activeSurface={activeSurface}
                onSelectSurface={setActiveSurface}
              />
              {activeSurface && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {dt(surfaceLabelKey(activeSurface, toothNumber))}
                  </p>
                  <Select
                    value={state?.surfaces?.[activeSurface] || "healthy"}
                    onValueChange={(v) => onSetSurfaceCondition(activeSurface, v)}
                  >
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SURFACE_CONDITIONS.map((c) => (
                        <SelectItem key={c.key} value={c.key}>{dt(`cond.${c.key}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">{dt("dental.notes")}</p>
              <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={2} />
              <Button size="sm" className="mt-2" onClick={() => onSaveNotes(noteDraft)}>{dt("dental.save")}</Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {(history || []).length === 0 ? (
              <p className="text-xs text-muted-foreground">{dt("dental.noHistory")}</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {(history || []).map((h: any) => (
                  <li key={h.id} className="text-xs border-s-2 border-primary/40 ps-2">
                    <span className="font-medium">
                      {h.surface ? `${h.surface}: ` : ""}{dt(`cond.${h.new_condition}`)}
                    </span>
                    <span className="text-muted-foreground"> — {new Date(h.changed_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="images">
            {toothImages.length === 0 ? (
              <p className="text-xs text-muted-foreground">{dt("dental.noImages")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {toothImages.map((img: any) => (
                  <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer" className="block">
                    <img src={img.image_url} alt={img.image_type || "Dental image"} className="w-full h-24 object-cover rounded border" loading="lazy" />
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">{img.image_type}</p>
                  </a>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
