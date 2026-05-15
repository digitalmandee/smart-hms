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
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function VaccineLotsPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data: lots, isLoading } = useQuery({
    queryKey: ["vaccine_lots", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase.from("vaccine_lots").select("*")
        .eq("organization_id", orgId!).order("expiry_date", { ascending: true });
      return data ?? [];
    },
  });

  const today = useMemo(() => new Date(), []);
  const isExpiring = (d: string) => {
    const days = Math.ceil((new Date(d).getTime() - today.getTime()) / 86400000);
    return days <= 60;
  };
  const isExpired = (d: string) => new Date(d).getTime() < today.getTime();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    vaccine_code: "", lot_number: "", manufacturer: "",
    expiry_date: "", quantity_received: 0, cold_chain_ok: true,
  });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!orgId) return;
    if (!draft.vaccine_code || !draft.lot_number || !draft.expiry_date) {
      toast.error(t("imm.lots.validation", "Vaccine, lot, expiry are required")); return;
    }
    setSaving(true);
    const { error } = await supabase.from("vaccine_lots").insert({
      organization_id: orgId,
      vaccine_code: draft.vaccine_code.toUpperCase(),
      lot_number: draft.lot_number,
      manufacturer: draft.manufacturer || null,
      expiry_date: draft.expiry_date,
      quantity_received: draft.quantity_received,
      quantity_remaining: draft.quantity_received,
      cold_chain_ok: draft.cold_chain_ok,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["vaccine_lots", orgId] });
  };

  const recall = async (id: string, recalled: boolean) => {
    const { error } = await supabase.from("vaccine_lots").update({ recalled }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(t("common.saved", "Saved"));
    qc.invalidateQueries({ queryKey: ["vaccine_lots", orgId] });
  };

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("imm.lots.title", "Vaccine lots")}
        subtitle={t("imm.lots.description", "Track lots, expiry and cold-chain integrity")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("imm.lots.new", "New lot")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("imm.lots.new", "New lot")}</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("imm.vaccine_code", "Vaccine code")}</Label>
                    <Input value={draft.vaccine_code} onChange={(e) => setDraft({ ...draft, vaccine_code: e.target.value })} placeholder="BCG" />
                  </div>
                  <div>
                    <Label>{t("imm.lots.lot_number", "Lot #")}</Label>
                    <Input value={draft.lot_number} onChange={(e) => setDraft({ ...draft, lot_number: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{t("imm.lots.manufacturer", "Manufacturer")}</Label>
                    <Input value={draft.manufacturer} onChange={(e) => setDraft({ ...draft, manufacturer: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("imm.lots.expiry", "Expiry date")}</Label>
                    <Input type="date" value={draft.expiry_date} onChange={(e) => setDraft({ ...draft, expiry_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <Label>{t("imm.lots.qty_received", "Quantity received")}</Label>
                    <Input type="number" min={0} value={draft.quantity_received} onChange={(e) => setDraft({ ...draft, quantity_received: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={draft.cold_chain_ok} onCheckedChange={(c) => setDraft({ ...draft, cold_chain_ok: c })} />
                    <Label>{t("imm.lots.cold_ok", "Cold chain intact")}</Label>
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

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
      ) : !lots?.length ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {t("imm.lots.empty", "No vaccine lots yet.")}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {lots.map((l) => {
            const expired = isExpired(l.expiry_date);
            const expiring = !expired && isExpiring(l.expiry_date);
            return (
              <Card key={l.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="rounded-md bg-primary/10 p-2"><Package className="h-5 w-5 text-primary" /></div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {l.vaccine_code} · {l.lot_number}
                        {l.manufacturer && <span className="text-muted-foreground"> · {l.manufacturer}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("imm.lots.expiry", "Expiry date")}: {l.expiry_date} · {l.quantity_remaining}/{l.quantity_received}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {expired && <Badge variant="destructive">{t("imm.lots.expired", "Expired")}</Badge>}
                    {expiring && <Badge variant="outline"><AlertTriangle className="h-3 w-3 me-1" />{t("imm.lots.expiring_soon", "Expiring soon")}</Badge>}
                    {!l.cold_chain_ok && <Badge variant="destructive">{t("imm.lots.cold_break", "Cold-chain break")}</Badge>}
                    {l.recalled
                      ? <Badge variant="destructive">{t("imm.lots.recalled", "Recalled")}</Badge>
                      : <Badge variant="secondary">{t("imm.lots.active", "Active")}</Badge>}
                    <Button size="sm" variant="outline" onClick={() => recall(l.id, !l.recalled)}>
                      {l.recalled ? t("imm.lots.unrecall", "Un-recall") : t("imm.lots.recall_action", "Recall")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
