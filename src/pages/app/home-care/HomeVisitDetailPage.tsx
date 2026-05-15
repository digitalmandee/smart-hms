import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, MapPin, LogIn, LogOut, Play, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { enqueue } from "@/lib/offline-sync/outbox";
import { forceSync } from "@/lib/offline-sync/sync-engine";
import { useAuth } from "@/contexts/AuthContext";

const variantFor = (s: string): "default" | "secondary" | "outline" =>
  s === "completed" ? "secondary" : s === "cancelled" ? "outline" :
  s === "in_progress" || s === "arrived" ? "default" : "outline";

async function getPosition(): Promise<GeolocationPosition | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 8000 });
  });
}

export default function HomeVisitDetailPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const { t } = useTranslation();
  const { profile, user } = useAuth();
  const qc = useQueryClient();

  const { data: visit, isLoading } = useQuery({
    queryKey: ["home_visit", visitId],
    enabled: !!visitId,
    queryFn: async () => {
      const { data } = await supabase.from("home_visits").select("*").eq("id", visitId!).maybeSingle();
      return data;
    },
  });

  const { data: patient } = useQuery({
    queryKey: ["home_visit_patient", visit?.patient_id],
    enabled: !!visit?.patient_id,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("id, first_name, last_name, patient_number, phone, address")
        .eq("id", visit!.patient_id).maybeSingle();
      return data;
    },
  });

  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [temp, setTemp] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const updateVisit = async (patch: Record<string, unknown>) => {
    if (!visitId) return;
    setBusy(true);
    if (typeof navigator !== "undefined" && navigator.onLine) {
      const { error } = await supabase.from("home_visits").update(patch).eq("id", visitId);
      setBusy(false);
      if (error) { toast.error(error.message); return false; }
    } else if (user?.id && profile?.organization_id) {
      await enqueue({
        user_id: user.id, organization_id: profile.organization_id,
        entity_type: "home_visits", operation: "update",
        payload: { id: visitId, ...patch },
      });
      forceSync();
      setBusy(false);
      toast.success(t("home.visits.queued", "Saved offline — will sync"));
    }
    qc.invalidateQueries({ queryKey: ["home_visit", visitId] });
    return true;
  };

  const checkIn = async () => {
    const pos = await getPosition();
    await updateVisit({
      status: "arrived",
      checkin_at: new Date().toISOString(),
      checkin_lat: pos?.coords.latitude ?? null,
      checkin_lng: pos?.coords.longitude ?? null,
    });
  };

  const startVisit = () => updateVisit({ status: "in_progress" });

  const checkOut = async () => {
    const pos = await getPosition();
    const vitals: Record<string, string> = {};
    if (bp) vitals.bp = bp;
    if (pulse) vitals.pulse = pulse;
    if (temp) vitals.temp = temp;
    await updateVisit({
      status: "completed",
      checkout_at: new Date().toISOString(),
      checkout_lat: pos?.coords.latitude ?? null,
      checkout_lng: pos?.coords.longitude ?? null,
      vitals: Object.keys(vitals).length ? vitals : (visit?.vitals ?? null),
      notes: notes ? [(visit?.notes ?? ""), notes].filter(Boolean).join("\n") : visit?.notes ?? null,
    });
  };

  const cancel = () => updateVisit({ status: "cancelled" });

  if (isLoading || !visit) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={`${visit.visit_number} · ${patient ? `${patient.first_name} ${patient.last_name}` : ""}`}
        subtitle={`${new Date(visit.scheduled_at).toLocaleString()} · ${t(`home.visits.status_${visit.status}`, visit.status)}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/home-care/visits"><ArrowLeft className="h-4 w-4 me-2" />{t("common.back", "Back")}</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">{t("home.visits.patient", "Patient")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">{t("home.visits.mrn", "MRN")}:</span> {patient?.patient_number ?? "—"}</div>
            <div><span className="text-muted-foreground">{t("home.visits.phone", "Phone")}:</span> {patient?.phone ?? "—"}</div>
            <div><span className="text-muted-foreground">{t("home.visits.address", "Address")}:</span> {patient?.address ?? "—"}</div>
            {visit.checkin_at && (
              <div className="pt-3 border-t">
                <div className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{t("home.visits.checkin", "Check-in")}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(visit.checkin_at).toLocaleString()}
                  {visit.checkin_lat ? ` · ${visit.checkin_lat.toFixed(4)}, ${visit.checkin_lng?.toFixed(4)}` : ""}
                </div>
              </div>
            )}
            {visit.checkout_at && (
              <div className="pt-2">
                <div className="font-medium flex items-center gap-1"><MapPin className="h-3 w-3" />{t("home.visits.checkout", "Check-out")}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(visit.checkout_at).toLocaleString()}
                  {visit.checkout_lat ? ` · ${visit.checkout_lat.toFixed(4)}, ${visit.checkout_lng?.toFixed(4)}` : ""}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("home.visits.documentation", "Documentation")}</CardTitle>
            <Badge variant={variantFor(visit.status)}>{t(`home.visits.status_${visit.status}`, visit.status)}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {visit.status === "scheduled" && (
                <Button onClick={checkIn} disabled={busy}>
                  <LogIn className="h-4 w-4 me-2" />{t("home.visits.action_checkin", "Check in")}
                </Button>
              )}
              {visit.status === "arrived" && (
                <Button onClick={startVisit} disabled={busy}>
                  <Play className="h-4 w-4 me-2" />{t("home.visits.action_start", "Start care")}
                </Button>
              )}
              {(visit.status === "in_progress" || visit.status === "arrived") && (
                <Button onClick={checkOut} disabled={busy} variant="default">
                  <LogOut className="h-4 w-4 me-2" />{t("home.visits.action_checkout", "Check out & complete")}
                </Button>
              )}
              {!["completed", "cancelled"].includes(visit.status) && (
                <Button onClick={cancel} disabled={busy} variant="outline">
                  <XCircle className="h-4 w-4 me-2" />{t("home.visits.action_cancel", "Cancel visit")}
                </Button>
              )}
              {visit.status === "completed" && (
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 me-1" />{t("home.visits.completed_badge", "Completed")}</Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>{t("home.visits.bp", "BP")}</Label>
                <Input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" />
              </div>
              <div>
                <Label>{t("home.visits.pulse", "Pulse")}</Label>
                <Input value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" />
              </div>
              <div>
                <Label>{t("home.visits.temp", "Temp")}</Label>
                <Input value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="36.8" />
              </div>
            </div>

            <div>
              <Label>{t("home.visits.add_notes", "Add notes")}</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t("home.visits.notes_placeholder", "Care provided, observations, follow-up…")} />
            </div>

            {visit.notes && (
              <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">{visit.notes}</div>
            )}
            {visit.vitals && (
              <div className="text-sm">
                <div className="font-medium mb-1">{t("home.visits.vitals", "Vitals")}</div>
                <div className="flex gap-3 text-muted-foreground">
                  {Object.entries(visit.vitals as Record<string, string>).map(([k, v]) => (
                    <div key={k}><span className="font-mono">{k}:</span> {v}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
