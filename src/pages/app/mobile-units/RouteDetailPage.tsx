import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, MapPin, ArrowLeft, Play, Square, CheckCircle2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { NewVisitDialog } from "./NewVisitDialog";

export default function RouteDetailPage() {
  const { unitId, routeId } = useParams<{ unitId: string; routeId: string }>();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { profile } = useAuth();

  const { data: route } = useQuery({
    queryKey: ["mobile_route", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data } = await supabase.from("mobile_routes").select("*").eq("id", routeId!).maybeSingle();
      return data;
    },
  });

  const { data: stops } = useQuery({
    queryKey: ["mobile_route_stops", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data } = await supabase.from("mobile_route_stops").select("*")
        .eq("route_id", routeId!).order("sequence");
      return data ?? [];
    },
  });

  const { data: visits } = useQuery({
    queryKey: ["mobile_visits", routeId],
    enabled: !!routeId,
    queryFn: async () => {
      const { data } = await supabase.from("mobile_visits").select("*")
        .eq("route_id", routeId!).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const [stopOpen, setStopOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [stopDraft, setStopDraft] = useState({ location_name: "", address: "", scheduled_at: "" });

  const addStop = async () => {
    if (!routeId || !stopDraft.location_name) {
      toast.error(t("mobile.stops.validation", "Location name is required")); return;
    }
    const { error } = await supabase.from("mobile_route_stops").insert({
      route_id: routeId,
      sequence: (stops?.length ?? 0) + 1,
      location_name: stopDraft.location_name,
      address: stopDraft.address || null,
      scheduled_at: stopDraft.scheduled_at || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setStopOpen(false);
    setStopDraft({ location_name: "", address: "", scheduled_at: "" });
    qc.invalidateQueries({ queryKey: ["mobile_route_stops", routeId] });
  };

  const setRouteStatus = async (status: "in_progress" | "completed" | "cancelled") => {
    if (!routeId) return;
    const patch: Record<string, unknown> = { status };
    if (status === "in_progress") patch.start_time = new Date().toISOString();
    if (status === "completed") patch.end_time = new Date().toISOString();
    const { error } = await supabase.from("mobile_routes").update(patch).eq("id", routeId);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["mobile_route", routeId] });
  };

  const setStopArrived = async (stopId: string) => {
    const { error } = await supabase.from("mobile_route_stops")
      .update({ arrived_at: new Date().toISOString() }).eq("id", stopId);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["mobile_route_stops", routeId] });
  };

  const setStopDeparted = async (stopId: string) => {
    const { error } = await supabase.from("mobile_route_stops")
      .update({ departed_at: new Date().toISOString() }).eq("id", stopId);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["mobile_route_stops", routeId] });
  };

  if (!route) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={`${t("mobile.routes.title", "Route")} ${route.route_code}`}
        subtitle={`${route.route_date} · ${t(`mobile.routes.status_${route.status}`, route.status)}`}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/app/mobile-units/${unitId}/routes`}><ArrowLeft className="h-4 w-4 me-2" />{t("common.back", "Back")}</Link>
            </Button>
            {route.status === "planned" && (
              <Button size="sm" onClick={() => setRouteStatus("in_progress")}>
                <Play className="h-4 w-4 me-2" />{t("mobile.routes.start", "Start route")}
              </Button>
            )}
            {route.status === "in_progress" && (
              <Button size="sm" onClick={() => setRouteStatus("completed")}>
                <CheckCircle2 className="h-4 w-4 me-2" />{t("mobile.routes.complete", "Complete")}
              </Button>
            )}
            {route.status !== "completed" && route.status !== "cancelled" && (
              <Button size="sm" variant="outline" onClick={() => setRouteStatus("cancelled")}>
                <Square className="h-4 w-4 me-2" />{t("mobile.routes.cancel", "Cancel")}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("mobile.stops.title", "Stops")}</CardTitle>
            <Dialog open={stopOpen} onOpenChange={setStopOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="h-4 w-4 me-1" />{t("mobile.stops.add", "Add stop")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("mobile.stops.add", "Add stop")}</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <Label>{t("mobile.stops.location", "Location name")}</Label>
                    <Input value={stopDraft.location_name} onChange={(e) => setStopDraft({ ...stopDraft, location_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("mobile.stops.address", "Address")}</Label>
                    <Textarea value={stopDraft.address} onChange={(e) => setStopDraft({ ...stopDraft, address: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("mobile.stops.scheduled", "Scheduled at")}</Label>
                    <Input type="datetime-local" value={stopDraft.scheduled_at}
                      onChange={(e) => setStopDraft({ ...stopDraft, scheduled_at: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStopOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                  <Button onClick={addStop}>{t("common.save", "Save")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-2">
            {!stops?.length ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {t("mobile.stops.empty", "No stops planned")}
              </div>
            ) : stops.map((s) => (
              <div key={s.id} className="rounded-md border p-3 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{s.sequence}. {s.location_name}</div>
                    {s.address && <div className="text-xs text-muted-foreground">{s.address}</div>}
                    {s.scheduled_at && <div className="text-xs text-muted-foreground">
                      {t("mobile.stops.scheduled", "Scheduled at")}: {new Date(s.scheduled_at).toLocaleString()}
                    </div>}
                  </div>
                  <Badge variant={s.departed_at ? "secondary" : s.arrived_at ? "default" : "outline"}>
                    {s.departed_at ? t("mobile.stops.departed", "Departed") :
                      s.arrived_at ? t("mobile.stops.arrived", "Arrived") :
                      t("mobile.stops.pending", "Pending")}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-1">
                  {!s.arrived_at && (
                    <Button size="sm" variant="outline" onClick={() => setStopArrived(s.id)}>
                      {t("mobile.stops.mark_arrived", "Arrived")}
                    </Button>
                  )}
                  {s.arrived_at && !s.departed_at && (
                    <Button size="sm" variant="outline" onClick={() => setStopDeparted(s.id)}>
                      {t("mobile.stops.mark_departed", "Departed")}
                    </Button>
                  )}
                  <Button size="sm" onClick={() => { setActiveStopId(s.id); setVisitOpen(true); }}>
                    <Stethoscope className="h-4 w-4 me-1" />{t("mobile.visits.new", "New visit")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {t("mobile.visits.title", "Visits")} ({visits?.length ?? 0})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => { setActiveStopId(null); setVisitOpen(true); }}>
              <Plus className="h-4 w-4 me-1" />{t("mobile.visits.new", "New visit")}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {!visits?.length ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {t("mobile.visits.empty", "No visits recorded yet")}
              </div>
            ) : visits.map((v) => (
              <div key={v.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{v.visit_number ?? v.id.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.chief_complaint ?? t("mobile.visits.no_complaint", "No complaint recorded")}
                    </div>
                  </div>
                  <div className="text-end">
                    {v.amount_collected ? (
                      <Badge variant="default">
                        {Number(v.amount_collected).toFixed(2)} {v.payment_method ?? ""}
                      </Badge>
                    ) : <Badge variant="outline">{t("mobile.visits.no_payment", "No payment")}</Badge>}
                    {v.created_offline && <div className="text-[10px] text-muted-foreground mt-1">offline</div>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <NewVisitDialog
        open={visitOpen}
        onOpenChange={setVisitOpen}
        organizationId={profile?.organization_id ?? ""}
        routeId={routeId!}
        stopId={activeStopId}
        onCreated={() => qc.invalidateQueries({ queryKey: ["mobile_visits", routeId] })}
      />
    </div>
  );
}
