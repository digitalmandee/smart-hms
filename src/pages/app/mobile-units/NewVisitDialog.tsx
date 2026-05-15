import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { enqueue } from "@/lib/offline-sync/outbox";
import { kick } from "@/lib/offline-sync/sync-engine";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  organizationId: string;
  routeId: string;
  stopId: string | null;
  onCreated: () => void;
}

const PAYMENT_METHODS = ["cash", "card", "mada", "stcpay", "tap", "insurance", "none"] as const;

export function NewVisitDialog({ open, onOpenChange, organizationId, routeId, stopId, onCreated }: Props) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [draft, setDraft] = useState({
    visit_number: "",
    chief_complaint: "",
    diagnosis: "",
    amount_collected: "",
    payment_method: "cash" as typeof PAYMENT_METHODS[number],
    bp: "", pulse: "", temp: "",
  });
  const [saving, setSaving] = useState(false);

  const reset = () => setDraft({
    visit_number: "", chief_complaint: "", diagnosis: "",
    amount_collected: "", payment_method: "cash", bp: "", pulse: "", temp: "",
  });

  const submit = async () => {
    if (!user?.id || !organizationId) return;
    setSaving(true);
    const vitals: Record<string, string> = {};
    if (draft.bp) vitals.bp = draft.bp;
    if (draft.pulse) vitals.pulse = draft.pulse;
    if (draft.temp) vitals.temp = draft.temp;

    const payload = {
      organization_id: organizationId,
      route_id: routeId,
      stop_id: stopId,
      visit_number: draft.visit_number || null,
      chief_complaint: draft.chief_complaint || null,
      diagnosis: draft.diagnosis || null,
      amount_collected: draft.amount_collected ? Number(draft.amount_collected) : null,
      payment_method: draft.payment_method === "none" ? null : draft.payment_method,
      vitals: Object.keys(vitals).length ? vitals : null,
      created_by: user.id,
    };

    if (typeof navigator !== "undefined" && navigator.onLine) {
      const { error } = await supabase.from("mobile_visits").insert({
        ...payload, client_uuid: crypto.randomUUID(), created_offline: false,
      });
      setSaving(false);
      if (error) { toast.error(error.message); return; }
      toast.success(t("mobile.visits.saved", "Visit recorded"));
    } else {
      await enqueue({
        user_id: user.id,
        organization_id: organizationId,
        entity_type: "mobile_visits",
        operation: "insert",
        payload: { ...payload, created_offline: true },
      });
      kick();
      setSaving(false);
      toast.success(t("mobile.visits.queued", "Saved offline — will sync when reconnected"));
    }
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("mobile.visits.new", "New visit")}
            {typeof navigator !== "undefined" && !navigator.onLine && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <WifiOff className="h-3 w-3" />{t("sync.offline", "Offline")}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <Label>{t("mobile.visits.visit_number", "Visit number")}</Label>
            <Input value={draft.visit_number} onChange={(e) => setDraft({ ...draft, visit_number: e.target.value })}
              placeholder={t("mobile.visits.optional", "Optional")} />
          </div>
          <div>
            <Label>{t("mobile.visits.chief_complaint", "Chief complaint")}</Label>
            <Textarea rows={2} value={draft.chief_complaint} onChange={(e) => setDraft({ ...draft, chief_complaint: e.target.value })} />
          </div>
          <div>
            <Label>{t("mobile.visits.diagnosis", "Diagnosis")}</Label>
            <Textarea rows={2} value={draft.diagnosis} onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>{t("mobile.visits.bp", "BP")}</Label>
              <Input value={draft.bp} onChange={(e) => setDraft({ ...draft, bp: e.target.value })} placeholder="120/80" />
            </div>
            <div>
              <Label>{t("mobile.visits.pulse", "Pulse")}</Label>
              <Input value={draft.pulse} onChange={(e) => setDraft({ ...draft, pulse: e.target.value })} placeholder="72" />
            </div>
            <div>
              <Label>{t("mobile.visits.temp", "Temp")}</Label>
              <Input value={draft.temp} onChange={(e) => setDraft({ ...draft, temp: e.target.value })} placeholder="36.8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{t("mobile.visits.amount", "Amount collected")}</Label>
              <Input type="number" step="0.01" value={draft.amount_collected}
                onChange={(e) => setDraft({ ...draft, amount_collected: e.target.value })} />
            </div>
            <div>
              <Label>{t("mobile.visits.payment_method", "Payment method")}</Label>
              <Select value={draft.payment_method} onValueChange={(v) => setDraft({ ...draft, payment_method: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{t(`mobile.visits.pm_${m}`, m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel", "Cancel")}</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
