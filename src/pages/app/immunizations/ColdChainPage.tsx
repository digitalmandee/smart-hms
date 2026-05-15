import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Thermometer, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const MIN_C = 2, MAX_C = 8;

export default function ColdChainPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data: logs, isLoading } = useQuery({
    queryKey: ["cold_chain_logs", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase.from("cold_chain_logs").select("*")
        .eq("organization_id", orgId!).order("recorded_at", { ascending: false }).limit(200);
      return data ?? [];
    },
  });

  const lotIds = useMemo(() => Array.from(new Set((logs ?? []).map((l) => l.vaccine_lot_id).filter(Boolean) as string[])), [logs]);
  const { data: lots } = useQuery({
    queryKey: ["cold_chain_lots", lotIds.join(",")],
    enabled: lotIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("vaccine_lots").select("id, lot_number, vaccine_code").in("id", lotIds);
      return data ?? [];
    },
  });
  const lotMap = useMemo(() => new Map((lots ?? []).map((l) => [l.id, l])), [lots]);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ temperature_c: 5, vaccine_lot_id: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const { data: lotOptions } = useQuery({
    queryKey: ["all_lots", orgId],
    enabled: !!orgId && open,
    queryFn: async () => {
      const { data } = await supabase.from("vaccine_lots").select("id, lot_number, vaccine_code")
        .eq("organization_id", orgId!).eq("recalled", false).order("expiry_date", { ascending: true }).limit(200);
      return data ?? [];
    },
  });

  const log = async () => {
    if (!orgId) return;
    setSaving(true);
    const inRange = draft.temperature_c >= MIN_C && draft.temperature_c <= MAX_C;
    const { error } = await supabase.from("cold_chain_logs").insert({
      organization_id: orgId,
      temperature_c: draft.temperature_c,
      in_range: inRange,
      vaccine_lot_id: draft.vaccine_lot_id || null,
      notes: draft.notes || null,
      recorded_by: profile?.id ?? null,
    });
    if (!error && !inRange && draft.vaccine_lot_id) {
      await supabase.from("vaccine_lots").update({ cold_chain_ok: false }).eq("id", draft.vaccine_lot_id);
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["cold_chain_logs", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("imm.cold.title", "Cold chain")}
        subtitle={t("imm.cold.description", "Vaccine refrigerator temperature log (target 2–8°C)")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("imm.cold.new", "Log temperature")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("imm.cold.new", "Log temperature")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div>
                  <Label>{t("imm.cold.temp", "Temperature (°C)")}</Label>
                  <Input type="number" step="0.1" value={draft.temperature_c}
                    onChange={(e) => setDraft({ ...draft, temperature_c: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>{t("imm.cold.lot", "Affected lot (optional)")}</Label>
                  <Select value={draft.vaccine_lot_id || "__none__"}
                    onValueChange={(v) => setDraft({ ...draft, vaccine_lot_id: v === "__none__" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("common.none", "None")}</SelectItem>
                      {(lotOptions ?? []).map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.vaccine_code} · {l.lot_number}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("imm.cold.notes", "Notes")}</Label>
                  <Textarea rows={2} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button onClick={log} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save", "Save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !logs?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Thermometer className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("imm.cold.empty", "No temperature logs yet.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const lot = l.vaccine_lot_id ? lotMap.get(l.vaccine_lot_id) : null;
            return (
              <Card key={l.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-md p-2 ${l.in_range ? "bg-primary/10" : "bg-destructive/10"}`}>
                      {l.in_range ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                    </div>
                    <div>
                      <div className="font-medium">{l.temperature_c.toFixed(1)} °C{lot && <> · {lot.vaccine_code} {lot.lot_number}</>}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(l.recorded_at).toLocaleString()}{l.notes && <> · {l.notes}</>}
                      </div>
                    </div>
                  </div>
                  <Badge variant={l.in_range ? "secondary" : "destructive"}>
                    {l.in_range ? t("imm.cold.in_range", "In range") : t("imm.cold.out_of_range", "Out of range")}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
