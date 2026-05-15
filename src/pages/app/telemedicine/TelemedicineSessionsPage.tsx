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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Video, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  scheduled: "outline", waiting: "default", in_progress: "default",
  completed: "secondary", cancelled: "outline", no_show: "destructive",
};

export default function TelemedicineSessionsPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const [tab, setTab] = useState<"upcoming" | "in_progress" | "past">("upcoming");

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["telemed_sessions", orgId, tab],
    enabled: !!orgId,
    queryFn: async () => {
      let q = supabase.from("telemedicine_sessions").select("*").eq("organization_id", orgId!);
      const now = new Date().toISOString();
      if (tab === "upcoming") q = q.in("status", ["scheduled", "waiting"]).gte("scheduled_at", new Date(Date.now() - 86400000).toISOString()).order("scheduled_at", { ascending: true });
      else if (tab === "in_progress") q = q.eq("status", "in_progress").order("started_at", { ascending: false });
      else q = q.in("status", ["completed", "cancelled", "no_show"]).lt("scheduled_at", now).order("scheduled_at", { ascending: false }).limit(100);
      const { data } = await q;
      return data ?? [];
    },
  });

  const patientIds = useMemo(() => Array.from(new Set((sessions ?? []).map((s) => s.patient_id))), [sessions]);
  const { data: patients } = useQuery({
    queryKey: ["telemed_patients", patientIds.join(",")],
    enabled: patientIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number").in("id", patientIds);
      return data ?? [];
    },
  });
  const patientMap = useMemo(() => new Map((patients ?? []).map((p) => [p.id, p])), [patients]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    patient_id: "", scheduled_at: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    room_provider: "jitsi", recording_enabled: false, amount: 0,
  });
  const [saving, setSaving] = useState(false);

  const { data: patientOptions } = useQuery({
    queryKey: ["patients_search_telemed", orgId],
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
      toast.error(t("telemed.validation", "Patient and time are required")); return;
    }
    setSaving(true);
    const room_name = `tm-${orgId.slice(0, 8)}-${Date.now().toString(36)}`;
    const { error } = await supabase.from("telemedicine_sessions").insert({
      organization_id: orgId,
      patient_id: draft.patient_id,
      doctor_id: profile?.id ?? "",
      scheduled_at: new Date(draft.scheduled_at).toISOString(),
      room_provider: draft.room_provider,
      room_name,
      recording_enabled: draft.recording_enabled,
      amount: draft.amount || null,
      status: "scheduled",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["telemed_sessions", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("telemed.title", "Telemedicine")}
        subtitle={t("telemed.description", "Schedule and conduct virtual consultations")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("telemed.new", "New session")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("telemed.new", "New session")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>{t("telemed.patient", "Patient")}</Label>
                  <Select value={draft.patient_id} onValueChange={(v) => setDraft({ ...draft, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder={t("telemed.select_patient", "Select patient")} /></SelectTrigger>
                    <SelectContent>
                      {(patientOptions ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.patient_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("telemed.scheduled_at", "Scheduled at")}</Label>
                    <Input type="datetime-local" value={draft.scheduled_at}
                      onChange={(e) => setDraft({ ...draft, scheduled_at: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("telemed.provider", "Room provider")}</Label>
                    <Select value={draft.room_provider} onValueChange={(v) => setDraft({ ...draft, room_provider: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jitsi">Jitsi Meet</SelectItem>
                        <SelectItem value="daily">Daily.co</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <Label>{t("telemed.amount", "Consultation fee")}</Label>
                    <Input type="number" min={0} step="0.01" value={draft.amount}
                      onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={draft.recording_enabled}
                      onCheckedChange={(c) => setDraft({ ...draft, recording_enabled: c })} />
                    <Label>{t("telemed.recording", "Record session")}</Label>
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="upcoming">{t("telemed.tab_upcoming", "Upcoming")}</TabsTrigger>
          <TabsTrigger value="in_progress">{t("telemed.tab_live", "Live")}</TabsTrigger>
          <TabsTrigger value="past">{t("telemed.tab_past", "Past")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !sessions?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("telemed.empty", "No sessions in this view.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const p = patientMap.get(s.patient_id);
            return (
              <Link key={s.id} to={`/app/telemedicine/${s.id}`}>
                <Card className="hover:bg-accent/40 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-primary/10 p-2"><Video className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="font-medium">
                          {p ? `${p.first_name} ${p.last_name}` : "—"} · {s.room_provider}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(s.scheduled_at).toLocaleString()}
                          {s.duration_seconds ? ` · ${Math.round(s.duration_seconds / 60)} ${t("telemed.minutes", "min")}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>{t(`telemed.status_${s.status}`, s.status)}</Badge>
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
