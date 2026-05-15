import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, CalendarRange } from "lucide-react";
import { toast } from "sonner";

export default function SchedulesPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data: rows, isLoading } = useQuery({
    queryKey: ["immunization_schedules", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase.from("immunization_schedules").select("*")
        .or(`organization_id.eq.${orgId},organization_id.is.null`)
        .order("age_months_min", { ascending: true });
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    vaccine_code: "", vaccine_name: "", dose_number: 1,
    age_months_min: 0, age_months_max: 0, region_code: "KSA",
    is_mandatory: true, notes: "",
  });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!orgId) return;
    if (!draft.vaccine_code || !draft.vaccine_name) {
      toast.error(t("imm.sched.validation", "Vaccine code and name required")); return;
    }
    setSaving(true);
    const { error } = await supabase.from("immunization_schedules").insert({
      organization_id: orgId,
      vaccine_code: draft.vaccine_code.toUpperCase(),
      vaccine_name: draft.vaccine_name,
      dose_number: draft.dose_number,
      age_months_min: draft.age_months_min,
      age_months_max: draft.age_months_max || null,
      region_code: draft.region_code || "KSA",
      is_mandatory: draft.is_mandatory,
      notes: draft.notes || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["immunization_schedules", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("imm.sched.title", "Immunization schedules")}
        subtitle={t("imm.sched.description", "Region-specific recommended vaccination calendar")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("imm.sched.new", "New schedule entry")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("imm.sched.new", "New schedule entry")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("imm.vaccine_code", "Vaccine code")}</Label>
                    <Input value={draft.vaccine_code} onChange={(e) => setDraft({ ...draft, vaccine_code: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("imm.sched.vaccine_name", "Vaccine name")}</Label>
                    <Input value={draft.vaccine_name} onChange={(e) => setDraft({ ...draft, vaccine_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>{t("imm.dose_number", "Dose #")}</Label>
                    <Input type="number" min={1} value={draft.dose_number} onChange={(e) => setDraft({ ...draft, dose_number: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>{t("imm.sched.age_min", "Min age (months)")}</Label>
                    <Input type="number" min={0} value={draft.age_months_min} onChange={(e) => setDraft({ ...draft, age_months_min: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label>{t("imm.sched.age_max", "Max age (months)")}</Label>
                    <Input type="number" min={0} value={draft.age_months_max} onChange={(e) => setDraft({ ...draft, age_months_max: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <Label>{t("imm.sched.region", "Region code")}</Label>
                    <Input value={draft.region_code} onChange={(e) => setDraft({ ...draft, region_code: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={draft.is_mandatory} onCheckedChange={(c) => setDraft({ ...draft, is_mandatory: c })} />
                    <Label>{t("imm.sched.mandatory", "Mandatory")}</Label>
                  </div>
                </div>
                <div>
                  <Label>{t("common.notes", "Notes")}</Label>
                  <Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
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
      ) : !rows?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <CalendarRange className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("imm.sched.empty", "No schedule entries yet.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-md bg-primary/10 p-2"><CalendarRange className="h-5 w-5 text-primary" /></div>
                  <div>
                    <div className="font-medium">{r.vaccine_code} · {r.vaccine_name} · {t("imm.dose", "Dose")} {r.dose_number}</div>
                    <div className="text-sm text-muted-foreground">
                      {r.age_months_min}{r.age_months_max ? `–${r.age_months_max}` : "+"} {t("imm.sched.months", "mo")} · {r.region_code}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.is_mandatory
                    ? <Badge>{t("imm.sched.mandatory", "Mandatory")}</Badge>
                    : <Badge variant="outline">{t("imm.sched.optional", "Optional")}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
