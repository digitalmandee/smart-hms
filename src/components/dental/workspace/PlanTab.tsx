import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Check } from "lucide-react";
import { useDentalT } from "@/lib/dental/i18n";
import {
  useDentalPlans,
  useDentalPlanItems,
  useCreateDentalPlan,
  useAddPlanItem,
  useUpdatePlanItem,
  useDeletePlanItem,
  useUpdateDentalPlan,
} from "@/hooks/useDentalCharting";
import { useDentalProcedures } from "@/hooks/useDental";
import type { ChartFinding } from "@/hooks/useDentalWorkspace";

interface Props {
  patientId: string;
  findings: ChartFinding[];
}

export default function PlanTab({ patientId, findings }: Props) {
  const { dt } = useDentalT();
  const { data: plans } = useDentalPlans(patientId);
  const { data: procedures } = useDentalProcedures();
  const createPlan = useCreateDentalPlan();
  const addItem = useAddPlanItem();
  const updateItem = useUpdatePlanItem();
  const deleteItem = useDeletePlanItem();
  const updatePlan = useUpdateDentalPlan();

  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const planId = activePlanId || plans?.[0]?.id;
  const { data: items } = useDentalPlanItems(planId);

  const [title, setTitle] = useState("");
  const [procId, setProcId] = useState("");
  const [tooth, setTooth] = useState("");
  const [cost, setCost] = useState("");
  const [phase, setPhase] = useState("1");

  const openFindings = useMemo(() => findings.filter((f) => !f.closed_at && f.status !== "completed"), [findings]);
  const total = useMemo(() => (items || []).reduce((s, i) => s + Number(i.cost || 0), 0), [items]);

  const addFromFinding = (f: ChartFinding) => {
    if (!planId) return;
    addItem.mutate({
      plan_id: planId,
      procedure_name: f.finding_name || f.finding_key,
      tooth_number: f.tooth_number,
      surfaces: f.surface,
      phase: 1,
      cost: 0,
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.plan.new")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={dt("dw.f.title")} />
            <Button
              className="w-full gap-1.5"
              disabled={!title.trim()}
              onClick={() => createPlan.mutate({ patient_id: patientId, title }, { onSuccess: (p: any) => { setTitle(""); setActivePlanId(p?.id); } })}
            >
              <Plus className="h-4 w-4" /> {dt("dw.save")}
            </Button>
            <div className="pt-2 space-y-1">
              {(plans || []).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePlanId(p.id)}
                  className={`w-full text-start p-2 rounded-md border text-sm ${p.id === planId ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <span className="font-medium">{p.title}</span>
                  <span className="block text-[11px] text-muted-foreground">{p.status} · {new Date(p.created_at).toLocaleDateString()}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dw.plan.fromFindings")}</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {!openFindings.length && <p className="text-xs text-muted-foreground">{dt("dw.noFindings")}</p>}
            {openFindings.map((f) => (
              <button
                key={f.id}
                disabled={!planId}
                onClick={() => addFromFinding(f)}
                className="w-full flex items-center gap-2 p-2 rounded-md border text-xs hover:bg-accent disabled:opacity-50"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color || "#dc2626" }} />
                <span className="flex-1 text-start">#{f.tooth_number}{f.surface ? ` ${f.surface}` : ""} · {f.finding_name || f.finding_key}</span>
                <Plus className="h-3.5 w-3.5" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">{dt("dw.tab.plan")}</CardTitle>
          {planId && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{dt("dw.plan.total")}: {total.toFixed(2)}</Badge>
              <Button size="sm" variant="outline" onClick={() => updatePlan.mutate({ id: planId, status: "accepted", accepted_at: new Date().toISOString(), total_cost: total })}>
                <Check className="h-4 w-4 me-1" /> {dt("dw.plan.accept")}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {!planId ? (
            <p className="text-sm text-muted-foreground">{dt("dw.plan.none")}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end p-3 border rounded-lg">
                <div className="space-y-1 md:col-span-2">
                  <Label className="text-xs">{dt("dw.plan.procedure")}</Label>
                  <Select value={procId} onValueChange={(v) => {
                    setProcId(v);
                    const p = (procedures || []).find((x: any) => x.id === v);
                    if (p?.default_cost) setCost(String(p.default_cost));
                  }}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {(procedures || []).map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{dt("dw.tooth")}</Label>
                  <Input value={tooth} onChange={(e) => setTooth(e.target.value)} placeholder="36" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{dt("dw.f.cost")}</Label>
                  <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{dt("dw.plan.phase")}</Label>
                  <Input type="number" value={phase} onChange={(e) => setPhase(e.target.value)} />
                </div>
                <Button
                  className="md:col-span-5 gap-1.5"
                  disabled={!procId}
                  onClick={() => {
                    const p = (procedures || []).find((x: any) => x.id === procId);
                    addItem.mutate({
                      plan_id: planId,
                      procedure_id: procId,
                      procedure_name: p?.name || "Procedure",
                      tooth_number: tooth ? Number(tooth) : null,
                      phase: Number(phase) || 1,
                      cost: Number(cost) || 0,
                    }, { onSuccess: () => { setProcId(""); setTooth(""); setCost(""); } });
                  }}
                >
                  <Plus className="h-4 w-4" /> {dt("dw.add")}
                </Button>
              </div>

              {!items?.length ? (
                <p className="text-sm text-muted-foreground">{dt("dw.noRecords")}</p>
              ) : (
                <div className="space-y-2">
                  {items.map((i: any) => (
                    <div key={i.id} className="flex items-center gap-2 p-2.5 border rounded-lg text-sm">
                      <Badge variant="outline">P{i.phase}</Badge>
                      {i.tooth_number && <Badge variant="secondary">#{i.tooth_number}</Badge>}
                      <span className="flex-1">{i.procedure_name}</span>
                      <span className="text-muted-foreground">{Number(i.cost || 0).toFixed(2)}</span>
                      <Select value={i.status} onValueChange={(v) => updateItem.mutate({ id: i.id, plan_id: planId, status: v })}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["planned", "in_progress", "completed", "cancelled"].map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem.mutate({ id: i.id, plan_id: planId })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
