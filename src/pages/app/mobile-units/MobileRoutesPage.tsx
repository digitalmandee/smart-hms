import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ChevronRight, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function MobileRoutesPage() {
  const { unitId } = useParams<{ unitId: string }>();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data: unit } = useQuery({
    queryKey: ["mobile_unit", unitId],
    enabled: !!unitId,
    queryFn: async () => {
      const { data } = await supabase.from("mobile_units").select("*").eq("id", unitId!).maybeSingle();
      return data;
    },
  });

  const { data: routes, isLoading } = useQuery({
    queryKey: ["mobile_routes", unitId],
    enabled: !!unitId,
    queryFn: async () => {
      const { data } = await supabase.from("mobile_routes").select("*")
        .eq("mobile_unit_id", unitId!).order("route_date", { ascending: false }).limit(60);
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ route_code: "", route_date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!orgId || !unitId) return;
    if (!draft.route_code || !draft.route_date) {
      toast.error(t("mobile.routes.validation", "Route code and date are required"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("mobile_routes").insert({
      organization_id: orgId, mobile_unit_id: unitId,
      route_code: draft.route_code, route_date: draft.route_date, status: "planned",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    setDraft({ route_code: "", route_date: new Date().toISOString().slice(0, 10) });
    qc.invalidateQueries({ queryKey: ["mobile_routes", unitId] });
  };

  const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
    planned: "outline", in_progress: "default", completed: "secondary", cancelled: "secondary",
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={unit?.unit_name ?? t("mobile.routes.title", "Routes")}
        subtitle={t("mobile.routes.description", "Plan, run, and review trips for this unit")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("mobile.routes.new", "New route")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("mobile.routes.new", "New route")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>{t("mobile.routes.code", "Route code")}</Label>
                  <Input value={draft.route_code} onChange={(e) => setDraft({ ...draft, route_code: e.target.value })} placeholder="R-2026-001" />
                </div>
                <div>
                  <Label>{t("mobile.routes.date", "Date")}</Label>
                  <Input type="date" value={draft.route_date} onChange={(e) => setDraft({ ...draft, route_date: e.target.value })} />
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
      ) : !routes?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("mobile.routes.empty", "No routes yet for this unit.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {routes.map((r) => (
            <Link key={r.id} to={`/app/mobile-units/${unitId}/routes/${r.id}`}>
              <Card className="hover:bg-accent/40 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-md bg-primary/10 p-2"><CalendarDays className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="font-medium">{r.route_code}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.route_date} · {r.total_stops ?? 0} {t("mobile.routes.stops", "stops")} · {r.total_visits ?? 0} {t("mobile.routes.visits", "visits")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[r.status] ?? "outline"}>
                      {t(`mobile.routes.status_${r.status}`, r.status)}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
