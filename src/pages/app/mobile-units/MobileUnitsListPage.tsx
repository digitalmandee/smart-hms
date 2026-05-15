import { useState } from "react";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["active", "inactive", "maintenance", "retired"] as const;

export default function MobileUnitsListPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data, isLoading } = useQuery({
    queryKey: ["mobile_units", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("mobile_units")
        .select("*")
        .eq("organization_id", orgId!)
        .order("unit_code");
      return data ?? [];
    },
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    unit_code: "", unit_name: "", vehicle_plate: "",
    capacity: 4, status: "active" as typeof STATUSES[number],
  });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!orgId) return;
    if (!draft.unit_code || !draft.unit_name) {
      toast.error(t("mobile.units.validation_required", "Code and name are required"));
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("mobile_units").insert({
      organization_id: orgId,
      unit_code: draft.unit_code,
      unit_name: draft.unit_name,
      vehicle_plate: draft.vehicle_plate || null,
      capacity: draft.capacity,
      status: draft.status,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    setDraft({ unit_code: "", unit_name: "", vehicle_plate: "", capacity: 4, status: "active" });
    qc.invalidateQueries({ queryKey: ["mobile_units", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("mobile.units.title", "Mobile Units")}
        subtitle={t("mobile.units.description", "Clinic-on-wheels vehicles, crew, and routes")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("mobile.units.new", "New unit")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("mobile.units.new", "New unit")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>{t("mobile.units.code", "Unit code")}</Label>
                  <Input value={draft.unit_code} onChange={(e) => setDraft({ ...draft, unit_code: e.target.value })} placeholder="CoW-01" />
                </div>
                <div>
                  <Label>{t("mobile.units.name", "Unit name")}</Label>
                  <Input value={draft.unit_name} onChange={(e) => setDraft({ ...draft, unit_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("mobile.units.plate", "Plate")}</Label>
                    <Input value={draft.vehicle_plate} onChange={(e) => setDraft({ ...draft, vehicle_plate: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("mobile.units.capacity", "Capacity")}</Label>
                    <Input type="number" min={1} value={draft.capacity}
                      onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <Label>{t("mobile.units.status", "Status")}</Label>
                  <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`mobile.units.status_${s}`, s)}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
      ) : !data?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("mobile.units.empty", "No mobile units yet. Add your first vehicle to start scheduling routes.")}
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.map((u) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-lg">{u.unit_name}</div>
                    <div className="text-sm text-muted-foreground">{u.unit_code} · {u.vehicle_plate ?? "—"}</div>
                  </div>
                  <Badge variant={u.status === "active" ? "default" : "secondary"}>
                    {t(`mobile.units.status_${u.status}`, u.status)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("mobile.units.capacity", "Capacity")}: {u.capacity ?? "—"}
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/app/mobile-units/${u.id}/routes`}>
                    <MapPin className="h-4 w-4 me-2" />{t("mobile.units.view_routes", "View routes")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
