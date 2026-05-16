import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Syringe, Package, Thermometer, CalendarRange, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { enqueue } from "@/lib/offline-sync/outbox";
import { forceSync } from "@/lib/offline-sync/sync-engine";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  given: "default", scheduled: "outline", missed: "outline", refused: "outline",
};

export default function ImmunizationsListPage() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { online } = useOfflineSync();
  const orgId = profile?.organization_id;

  const { data: rows, isLoading } = useQuery({
    queryKey: ["immunizations", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase.from("immunizations").select("*")
        .eq("organization_id", orgId!).order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const patientIds = useMemo(() => Array.from(new Set((rows ?? []).map((r) => r.patient_id))), [rows]);
  const { data: patients } = useQuery({
    queryKey: ["imm_patients", patientIds.join(",")],
    enabled: patientIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", patientIds);
      return data ?? [];
    },
  });
  const patientMap = useMemo(() => new Map((patients ?? []).map((p) => [p.id, p])), [patients]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    patient_id: "", vaccine_code: "", dose_number: 1, vaccine_lot_id: "",
    route: "IM", site: "left_deltoid", reaction_notes: "",
    given_date: new Date().toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);

  const { data: patientOptions } = useQuery({
    queryKey: ["patients_search_imm", orgId],
    enabled: !!orgId && open,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number")
        .eq("organization_id", orgId!).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const { data: lotOptions } = useQuery({
    queryKey: ["vaccine_lots_active", orgId],
    enabled: !!orgId && open,
    queryFn: async () => {
      const { data } = await supabase.from("vaccine_lots").select("id, lot_number, vaccine_code, expiry_date, quantity_remaining")
        .eq("organization_id", orgId!).eq("recalled", false).gt("quantity_remaining", 0)
        .order("expiry_date", { ascending: true }).limit(100);
      return data ?? [];
    },
  });

  const record = async () => {
    if (!orgId) return;
    if (!draft.patient_id || !draft.vaccine_code) {
      toast.error(t("imm.validation", "Patient and vaccine are required")); return;
    }
    setSaving(true);
    const { error } = await supabase.from("immunizations").insert({
      organization_id: orgId,
      patient_id: draft.patient_id,
      vaccine_code: draft.vaccine_code,
      dose_number: draft.dose_number,
      vaccine_lot_id: draft.vaccine_lot_id || null,
      route: draft.route || null,
      site: draft.site || null,
      reaction_notes: draft.reaction_notes || null,
      given_date: new Date(draft.given_date).toISOString(),
      given_by: profile?.id ?? null,
      status: "given",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    if (draft.vaccine_lot_id) {
      const lot = (lotOptions ?? []).find((l) => l.id === draft.vaccine_lot_id);
      if (lot && lot.quantity_remaining > 0) {
        await supabase.from("vaccine_lots").update({ quantity_remaining: lot.quantity_remaining - 1 }).eq("id", lot.id);
      }
    }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["immunizations", orgId] });
    qc.invalidateQueries({ queryKey: ["vaccine_lots_active", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("imm.title", "Immunizations")}
        subtitle={t("imm.description", "Record vaccinations, manage lots and cold chain")}
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline"><Link to="/app/immunizations/lots"><Package className="h-4 w-4 me-2" />{t("imm.lots.title", "Vaccine lots")}</Link></Button>
            <Button asChild variant="outline"><Link to="/app/immunizations/cold-chain"><Thermometer className="h-4 w-4 me-2" />{t("imm.cold.title", "Cold chain")}</Link></Button>
            <Button asChild variant="outline"><Link to="/app/immunizations/schedules"><CalendarRange className="h-4 w-4 me-2" />{t("imm.sched.title", "Schedules")}</Link></Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 me-2" />{t("imm.record", "Record vaccination")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>{t("imm.record", "Record vaccination")}</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <Label>{t("imm.patient", "Patient")}</Label>
                    <Select value={draft.patient_id} onValueChange={(v) => setDraft({ ...draft, patient_id: v })}>
                      <SelectTrigger><SelectValue placeholder={t("imm.select_patient", "Select patient")} /></SelectTrigger>
                      <SelectContent>
                        {(patientOptions ?? []).map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.patient_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t("imm.vaccine_code", "Vaccine code")}</Label>
                      <Input value={draft.vaccine_code} onChange={(e) => setDraft({ ...draft, vaccine_code: e.target.value.toUpperCase() })} placeholder="BCG, OPV, MMR…" />
                    </div>
                    <div>
                      <Label>{t("imm.dose_number", "Dose #")}</Label>
                      <Input type="number" min={1} value={draft.dose_number} onChange={(e) => setDraft({ ...draft, dose_number: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("imm.lot", "Vaccine lot (FEFO)")}</Label>
                    <Select value={draft.vaccine_lot_id || "__none__"} onValueChange={(v) => setDraft({ ...draft, vaccine_lot_id: v === "__none__" ? "" : v })}>
                      <SelectTrigger><SelectValue placeholder={t("imm.select_lot", "Select lot")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{t("common.none", "None")}</SelectItem>
                        {(lotOptions ?? []).map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.vaccine_code} · {l.lot_number} · exp {l.expiry_date} · {l.quantity_remaining} left
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>{t("imm.route", "Route")}</Label>
                      <Select value={draft.route} onValueChange={(v) => setDraft({ ...draft, route: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IM">IM</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ID">ID</SelectItem>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="nasal">Nasal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t("imm.site", "Site")}</Label>
                      <Input value={draft.site} onChange={(e) => setDraft({ ...draft, site: e.target.value })} />
                    </div>
                    <div>
                      <Label>{t("imm.given_date", "Given at")}</Label>
                      <Input type="datetime-local" value={draft.given_date} onChange={(e) => setDraft({ ...draft, given_date: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("imm.reaction", "Reaction notes")}</Label>
                    <Textarea rows={2} value={draft.reaction_notes} onChange={(e) => setDraft({ ...draft, reaction_notes: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                  <Button onClick={record} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save", "Save")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !rows?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Syringe className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("imm.empty", "No immunizations recorded yet.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const p = patientMap.get(r.patient_id);
            return (
              <Card key={r.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-primary/10 p-2"><Syringe className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="font-medium">
                        {r.vaccine_code} · {t("imm.dose", "Dose")} {r.dose_number}
                        {p && <> · {p.first_name} {p.last_name}</>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {r.given_date ? new Date(r.given_date).toLocaleString() : t("imm.not_given", "Not given yet")}
                        {r.route && <> · {r.route}</>}{r.site && <> · {r.site}</>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{t(`imm.status_${r.status}`, r.status)}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
