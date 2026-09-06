import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDentalProcedures, useCreateDentalTreatment } from "@/hooks/useDental";
import {
  useDentalPlans,
  useDentalPlanItems,
  useCreateDentalPlan,
  useAddPlanItem,
  useUpdatePlanItem,
  useDeletePlanItem,
  useUpdateDentalPlan,
  useToothSurfaces,
} from "@/hooks/useDentalCharting";
import { useDentalT } from "@/lib/dental/i18n";
import { normalizeCondition } from "@/lib/dental/constants";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function DentalPlansPage() {
  const { profile } = useAuth();
  const { dt, isRTL } = useDentalT();
  const [patientId, setPatientId] = useState("");
  const [planId, setPlanId] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const { data: patients } = useQuery({
    queryKey: ["patients-dental-plans", profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await (supabase.from("patients").select("id, first_name, last_name, patient_number") as any)
        .eq("organization_id", profile!.organization_id!).order("first_name").limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const { data: procedures } = useDentalProcedures();
  const { data: plans } = useDentalPlans(patientId || undefined);
  const { data: items } = useDentalPlanItems(planId || undefined);
  const { data: surfaces } = useToothSurfaces(patientId || undefined);

  const createPlan = useCreateDentalPlan();
  const addItem = useAddPlanItem();
  const updateItem = useUpdatePlanItem();
  const deleteItem = useDeletePlanItem();
  const updatePlan = useUpdateDentalPlan();
  const createTreatment = useCreateDentalTreatment();

  const [newItem, setNewItem] = useState({ tooth_number: "", procedure_id: "", phase: "1", cost: "" });

  const total = useMemo(
    () => (items || []).reduce((sum: number, i: any) => sum + Number(i.cost || 0), 0),
    [items]
  );

  // Findings that have no plan item yet
  const findings = useMemo(() => {
    const planned = new Set((items || []).map((i: any) => `${i.tooth_number}-${i.surfaces || ""}`));
    return (surfaces || [])
      .filter((s: any) => normalizeCondition(s.condition) !== "healthy")
      .filter((s: any) => !planned.has(`${s.tooth_number}-${s.surface}`));
  }, [surfaces, items]);

  const activePlan = (plans || []).find((p: any) => p.id === planId);

  const handleAddItem = (tooth?: string, surface?: string) => {
    if (!planId) return;
    const proc = (procedures || []).find((p: any) => p.id === newItem.procedure_id);
    if (!proc) return;
    addItem.mutate(
      {
        plan_id: planId,
        procedure_id: proc.id,
        procedure_name: proc.name,
        tooth_number: tooth ? Number(tooth) : newItem.tooth_number ? Number(newItem.tooth_number) : null,
        surfaces: surface || null,
        phase: Number(newItem.phase) || 1,
        cost: newItem.cost ? Number(newItem.cost) : Number(proc.default_cost || 0),
      },
      {
        onSuccess: () => setNewItem({ tooth_number: "", procedure_id: "", phase: "1", cost: "" }),
      }
    );
  };

  const startTreatment = (item: any) => {
    createTreatment.mutate(
      {
        patient_id: patientId,
        tooth_number: item.tooth_number || undefined,
        surface: item.surfaces || undefined,
        procedure_id: item.procedure_id || undefined,
        procedure_name: item.procedure_name,
        cost: Number(item.cost || 0),
        status: "planned",
      },
      { onSuccess: (t: any) => updateItem.mutate({ id: item.id, plan_id: item.plan_id, status: "in_progress", treatment_id: t?.id }) }
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={dt("dental.plans")}
        description={dt("dental.planFromChart")}
        breadcrumbs={[{ label: "Dental", href: "/app/dental" }, { label: dt("dental.plans") }]}
      />

      <Card>
        <CardContent className="pt-6 grid gap-3 md:grid-cols-3">
          <Select value={patientId} onValueChange={(v) => { setPatientId(v); setPlanId(null); }}>
            <SelectTrigger><SelectValue placeholder={dt("dental.selectPatient")} /></SelectTrigger>
            <SelectContent>
              {(patients || []).map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} — {p.patient_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {patientId && (
            <>
              <Input placeholder={dt("dental.planTitle")} value={title} onChange={(e) => setTitle(e.target.value)} />
              <Button
                onClick={() =>
                  createPlan.mutate(
                    { patient_id: patientId, title: title || "Treatment Plan" },
                    { onSuccess: (p: any) => { setPlanId(p?.id); setTitle(""); } }
                  )
                }
                disabled={createPlan.isPending}
              >
                <Plus className="h-4 w-4 me-2" />{dt("dental.newPlan")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {patientId && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dental.plans")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(plans || []).length === 0 && <p className="text-sm text-muted-foreground">{dt("dental.noPlans")}</p>}
              {(plans || []).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => setPlanId(p.id)}
                  className={`w-full text-start p-3 rounded-lg border transition-all ${planId === p.id ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()} · <Badge variant="outline" className="ms-1">{p.status}</Badge>
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            {planId && (
              <>
                <Card>
                  <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{activePlan?.title}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{dt("dental.total")}: {total.toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePlan.mutate({ id: planId, status: "accepted", accepted_at: new Date().toISOString(), total_cost: total })}
                      >
                        <CheckCircle2 className="h-4 w-4 me-1.5" />{dt("dental.accept")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-5 items-end mb-4">
                      <div>
                        <Label className="text-xs">{dt("dental.tooth")}</Label>
                        <Input value={newItem.tooth_number} onChange={(e) => setNewItem({ ...newItem, tooth_number: e.target.value })} type="number" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-xs">{dt("dental.procedure")}</Label>
                        <Select value={newItem.procedure_id} onValueChange={(v) => {
                          const p = (procedures || []).find((x: any) => x.id === v);
                          setNewItem({ ...newItem, procedure_id: v, cost: p?.default_cost ? String(p.default_cost) : newItem.cost });
                        }}>
                          <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            {(procedures || []).map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{p.code} — {p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{dt("dental.phase")}</Label>
                        <Input value={newItem.phase} onChange={(e) => setNewItem({ ...newItem, phase: e.target.value })} type="number" min={1} />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">{dt("dental.cost")}</Label>
                          <Input value={newItem.cost} onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })} type="number" />
                        </div>
                        <Button className="self-end" onClick={() => handleAddItem()} disabled={!newItem.procedure_id}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(items || []).map((it: any) => (
                        <div key={it.id} className="flex items-center gap-3 p-2 rounded-lg border text-sm">
                          <Badge variant="outline">{dt("dental.phase")} {it.phase}</Badge>
                          <span className="font-medium">{it.tooth_number ? `#${it.tooth_number}` : "—"}</span>
                          <span className="flex-1">{it.procedure_name}{it.surfaces ? ` (${it.surfaces})` : ""}</span>
                          <span>{Number(it.cost).toFixed(2)}</span>
                          <Badge variant="secondary">{it.status}</Badge>
                          {it.status === "planned" && (
                            <Button size="sm" variant="outline" onClick={() => startTreatment(it)}>Start</Button>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => deleteItem.mutate({ id: it.id, plan_id: planId })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {findings.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">{dt("dental.planFromChart")}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {findings.map((f: any) => (
                        <div key={f.id} className="flex items-center gap-3 text-sm p-2 rounded border">
                          <span className="font-medium">#{f.tooth_number} {f.surface}</span>
                          <span className="flex-1 text-muted-foreground">{dt(`cond.${normalizeCondition(f.condition)}`)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!newItem.procedure_id}
                            onClick={() => handleAddItem(String(f.tooth_number), f.surface)}
                          >
                            {dt("dental.addItem")}
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
