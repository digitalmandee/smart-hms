import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ClipboardList } from "lucide-react";
import { toast } from "sonner";

const FREQS = ["daily", "weekly", "biweekly", "monthly", "as_needed"] as const;

export default function CarePlansPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data: plans, isLoading } = useQuery({
    queryKey: ["care_plans", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase.from("care_plans").select("*")
        .eq("organization_id", orgId!).order("start_date", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const patientIds = useMemo(() => Array.from(new Set((plans ?? []).map((p) => p.patient_id))), [plans]);
  const { data: patients } = useQuery({
    queryKey: ["care_plan_patients", patientIds.join(",")],
    enabled: patientIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", patientIds);
      return data ?? [];
    },
  });
  const patientMap = useMemo(() => new Map((patients ?? []).map((p) => [p.id, p])), [patients]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "", patient_id: "", plan_code: `CP-${Date.now().toString().slice(-6)}`,
    frequency: "weekly" as typeof FREQS[number],
    start_date: new Date().toISOString().slice(0, 10), end_date: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: patientOptions } = useQuery({
    queryKey: ["patients_search_cp", orgId],
    enabled: !!orgId && open,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number")
        .eq("organization_id", orgId!).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const create = async () => {
    if (!orgId) return;
    if (!draft.title || !draft.patient_id) {
      toast.error(t("home.care_plans.validation", "Title and patient are required")); return;
    }
    setSaving(true);
    const { error } = await supabase.from("care_plans").insert({
      organization_id: orgId, patient_id: draft.patient_id,
      title: draft.title, plan_code: draft.plan_code,
      frequency: draft.frequency, start_date: draft.start_date,
      end_date: draft.end_date || null, status: "active",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["care_plans", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("home.care_plans.title", "Care plans")}
        subtitle={t("home.care_plans.description", "Recurring care schedules for home patients")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("home.care_plans.new", "New plan")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("home.care_plans.new", "New plan")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>{t("home.care_plans.plan_title", "Plan title")}</Label>
                  <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    placeholder={t("home.care_plans.title_placeholder", "Post-op wound care")} />
                </div>
                <div>
                  <Label>{t("home.visits.patient", "Patient")}</Label>
                  <Select value={draft.patient_id} onValueChange={(v) => setDraft({ ...draft, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t("home.visits.select_patient", "Select patient")} /></SelectTrigger>
                    <SelectContent>
                      {(patientOptions ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.patient_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("home.care_plans.code", "Plan code")}</Label>
                    <Input value={draft.plan_code} onChange={(e) => setDraft({ ...draft, plan_code: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("home.care_plans.frequency", "Frequency")}</Label>
                    <Select value={draft.frequency} onValueChange={(v) => setDraft({ ...draft, frequency: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FREQS.map((f) => <SelectItem key={f} value={f}>{t(`home.care_plans.freq_${f}`, f)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("home.care_plans.start", "Start date")}</Label>
                    <Input type="date" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("home.care_plans.end", "End date (optional)")}</Label>
                    <Input type="date" value={draft.end_date} onChange={(e) => setDraft({ ...draft, end_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button onClick={create} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save", "Save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !plans?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("home.care_plans.empty", "No care plans yet.")}
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {plans.map((p) => {
            const pt = patientMap.get(p.patient_id);
            return (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.plan_code} · {pt ? `${pt.first_name} ${pt.last_name}` : "—"}</div>
                    </div>
                    <Badge variant={p.status === "active" ? "default" : "secondary"}>{p.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(`home.care_plans.freq_${p.frequency ?? "weekly"}`, p.frequency ?? "—")} · {p.start_date}
                    {p.end_date ? ` → ${p.end_date}` : ""}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
