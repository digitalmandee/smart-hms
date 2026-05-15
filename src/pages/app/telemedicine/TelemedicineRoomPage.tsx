import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Video, PhoneOff, ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const buildRoomUrl = (provider: string, roomName: string) => {
  if (provider === "jitsi") return `https://meet.jit.si/${encodeURIComponent(roomName)}`;
  if (provider === "daily") return `https://your-team.daily.co/${encodeURIComponent(roomName)}`;
  return `about:blank`;
};

export default function TelemedicineRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: session, isLoading } = useQuery({
    queryKey: ["telemed_session", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("telemedicine_sessions").select("*").eq("id", id!).maybeSingle();
      return data;
    },
  });

  const { data: patient } = useQuery({
    queryKey: ["telemed_patient", session?.patient_id],
    enabled: !!session?.patient_id,
    queryFn: async () => {
      const { data } = await supabase.from("patients")
        .select("id, first_name, last_name, patient_number, phone")
        .eq("id", session!.patient_id).maybeSingle();
      return data;
    },
  });

  const { data: existingConsent } = useQuery({
    queryKey: ["telemed_consent", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase.from("telemedicine_consents")
        .select("*").eq("session_id", id!).order("granted_at", { ascending: false }).limit(1);
      return data?.[0] ?? null;
    },
  });

  const [consentChecked, setConsentChecked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [joined, setJoined] = useState(false);
  const [notes, setNotes] = useState("");
  const [endingSaving, setEndingSaving] = useState(false);

  useEffect(() => { if (session?.notes) setNotes(session.notes); }, [session?.notes]);
  useEffect(() => { if (existingConsent?.granted) setConsentChecked(true); }, [existingConsent]);

  const roomUrl = useMemo(
    () => session ? buildRoomUrl(session.room_provider, session.room_name) : "",
    [session],
  );

  const recordConsent = async () => {
    if (!id || !session) return;
    setConsentSaving(true);
    const { error } = await supabase.from("telemedicine_consents").insert({
      session_id: id,
      patient_id: session.patient_id,
      consent_type: "video_consultation",
      granted: true,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    setConsentSaving(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["telemed_consent", id] });
    toast.success(t("telemed.consent_recorded", "Consent recorded"));
  };

  const startCall = async () => {
    if (!id || !session) return;
    setJoined(true);
    if (session.status === "scheduled" || session.status === "waiting") {
      await supabase.from("telemedicine_sessions").update({
        status: "in_progress", started_at: new Date().toISOString(),
      }).eq("id", id);
      qc.invalidateQueries({ queryKey: ["telemed_session", id] });
    }
  };

  const endCall = async (status: "completed" | "no_show" | "cancelled") => {
    if (!id || !session) return;
    setEndingSaving(true);
    const ended_at = new Date().toISOString();
    const duration = session.started_at
      ? Math.max(0, Math.round((new Date(ended_at).getTime() - new Date(session.started_at).getTime()) / 1000))
      : null;
    const { error } = await supabase.from("telemedicine_sessions").update({
      status, ended_at, duration_seconds: duration, notes: notes || null,
    }).eq("id", id);
    setEndingSaving(false);
    if (error) { toast.error(error.message); return; }
    setJoined(false);
    qc.invalidateQueries({ queryKey: ["telemed_session", id] });
    toast.success(t("telemed.ended", "Session ended"));
    if (status === "completed") navigate("/app/telemedicine");
  };

  if (isLoading || !session) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  const consentGranted = !!existingConsent?.granted;
  const finalised = ["completed", "cancelled", "no_show"].includes(session.status);

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={patient ? `${patient.first_name} ${patient.last_name}` : t("telemed.session", "Session")}
        subtitle={`${session.room_provider} · ${new Date(session.scheduled_at).toLocaleString()}`}
        actions={<Badge>{t(`telemed.status_${session.status}`, session.status)}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" /> {t("telemed.consent", "Patient consent")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consentGranted ? (
            <div className="text-sm text-muted-foreground">
              {t("telemed.consent_on", "Recorded")} · {new Date(existingConsent!.granted_at).toLocaleString()}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("telemed.consent_text", "I consent to a video consultation. I understand the limits of telemedicine and that audio/video may be recorded if disclosed.")}</p>
              <div className="flex items-center gap-3">
                <Checkbox id="cn" checked={consentChecked} onCheckedChange={(c) => setConsentChecked(!!c)} />
                <label htmlFor="cn" className="text-sm">{t("telemed.consent_agree", "Patient agrees")}</label>
              </div>
              <Button size="sm" onClick={recordConsent} disabled={!consentChecked || consentSaving}>
                {consentSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("telemed.record_consent", "Record consent")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" /> {t("telemed.room", "Consultation room")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!joined ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={startCall} disabled={!consentGranted || finalised}>
                <Video className="h-4 w-4 me-2" />{t("telemed.join", "Join call")}
              </Button>
              <Button variant="outline" asChild disabled={!consentGranted}>
                <a href={roomUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 me-2" />{t("telemed.open_external", "Open in new tab")}
                </a>
              </Button>
              {!consentGranted && (
                <span className="text-sm text-muted-foreground self-center">
                  {t("telemed.consent_required", "Record consent before joining.")}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <iframe
                  src={roomUrl}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className="h-full w-full"
                  title="Telemedicine room"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={() => endCall("completed")} disabled={endingSaving}>
                  <PhoneOff className="h-4 w-4 me-2" />{t("telemed.end_complete", "End & complete")}
                </Button>
                <Button variant="outline" onClick={() => endCall("no_show")} disabled={endingSaving}>
                  {t("telemed.no_show", "Mark no-show")}
                </Button>
                <Button variant="outline" onClick={() => endCall("cancelled")} disabled={endingSaving}>
                  {t("telemed.cancel", "Cancel session")}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("telemed.notes", "Consultation notes")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea rows={6} value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder={t("telemed.notes_placeholder", "Symptoms, assessment, plan, follow-up…")} />
          <div className="mt-3 flex justify-end">
            <Button variant="outline" disabled={endingSaving} onClick={async () => {
              if (!id) return;
              const { error } = await supabase.from("telemedicine_sessions").update({ notes: notes || null }).eq("id", id);
              if (error) { toast.error(error.message); return; }
              toast.success(t("common.saved", "Saved"));
            }}>{t("common.save", "Save")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
