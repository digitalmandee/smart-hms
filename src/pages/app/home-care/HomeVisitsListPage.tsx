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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ChevronRight, Home, Calendar, ClipboardList } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["scheduled", "en_route", "arrived", "in_progress", "completed", "cancelled"] as const;

const variantFor = (s: string): "default" | "secondary" | "outline" =>
  s === "completed" ? "secondary" : s === "cancelled" ? "outline" :
  s === "in_progress" || s === "arrived" ? "default" : "outline";

export default function HomeVisitsListPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const [tab, setTab] = useState<"today" | "upcoming" | "past">("today");

  const { data: visits, isLoading } = useQuery({
    queryKey: ["home_visits", orgId, tab],
    enabled: !!orgId,
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
      let q = supabase.from("home_visits").select("*").eq("organization_id", orgId!).order("scheduled_at", { ascending: true });
      if (tab === "today") q = q.gte("scheduled_at", today.toISOString()).lt("scheduled_at", tomorrow.toISOString());
      else if (tab === "upcoming") q = q.gte("scheduled_at", tomorrow.toISOString()).limit(100);
      else q = q.lt("scheduled_at", today.toISOString()).order("scheduled_at", { ascending: false }).limit(100);
      const { data } = await q;
      return data ?? [];
    },
  });

  const patientIds = useMemo(() => Array.from(new Set((visits ?? []).map((v) => v.patient_id))), [visits]);
  const { data: patients } = useQuery({
    queryKey: ["patients_for_visits", patientIds.join(",")],
    enabled: patientIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", patientIds);
      return data ?? [];
    },
  });
  const patientMap = useMemo(() => new Map((patients ?? []).map((p) => [p.id, p])), [patients]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    patient_id: "", scheduled_at: new Date().toISOString().slice(0, 16),
    visit_number: `HV-${Date.now().toString().slice(-6)}`, notes: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: patientOptions } = useQuery({
    queryKey: ["patients_search", orgId],
    enabled: !!orgId && open,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number")
        .eq("organization_id", orgId!).order("created_at", { ascending: false }).limit(100);
      return data ?? [];
    },
  });

  const create = async () => {
    if (!orgId) return;
    if (!draft.patient_id || !draft.scheduled_at) {
      toast.error(t("home.visits.validation", "Patient and date are required")); return;
    }
    setSaving(true);
    const { error } = await supabase.from("home_visits").insert({
      organization_id: orgId, patient_id: draft.patient_id,
      scheduled_at: new Date(draft.scheduled_at).toISOString(),
      visit_number: draft.visit_number, notes: draft.notes || null,
      nurse_id: profile?.id ?? null, status: "scheduled",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["home_visits", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("home.visits.title", "Home Healthcare")}
        subtitle={t("home.visits.description", "Schedule and document patient home visits")}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/app/home-care/care-plans"><ClipboardList className="h-4 w-4 me-2" />{t("home.care_plans.title", "Care plans")}</Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 me-2" />{t("home.visits.new", "Schedule visit")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("home.visits.new", "Schedule visit")}</DialogTitle></DialogHeader>
                <div className="grid gap-3">
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
                      <Label>{t("home.visits.visit_number", "Visit number")}</Label>
                      <Input value={draft.visit_number} onChange={(e) => setDraft({ ...draft, visit_number: e.target.value })} />
                    </div>
                    <div>
                      <Label>{t("home.visits.scheduled_at", "Scheduled at")}</Label>
                      <Input type="datetime-local" value={draft.scheduled_at}
                        onChange={(e) => setDraft({ ...draft, scheduled_at: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("home.visits.notes", "Notes")}</Label>
                    <Textarea rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
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
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="today">{t("home.visits.today", "Today")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t("home.visits.upcoming", "Upcoming")}</TabsTrigger>
          <TabsTrigger value="past">{t("home.visits.past", "Past")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !visits?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Home className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("home.visits.empty", "No visits in this view")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => {
            const p = patientMap.get(v.patient_id);
            return (
              <Link key={v.id} to={`/app/home-care/visits/${v.id}`}>
                <Card className="hover:bg-accent/40 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-primary/10 p-2"><Calendar className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="font-medium">{v.visit_number} · {p ? `${p.first_name} ${p.last_name}` : "—"}</div>
                        <div className="text-sm text-muted-foreground">{new Date(v.scheduled_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={variantFor(v.status)}>{t(`home.visits.status_${v.status}`, v.status)}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
