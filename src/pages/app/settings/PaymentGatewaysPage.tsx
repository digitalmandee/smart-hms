import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CreditCard, Smartphone, Wallet } from "lucide-react";
import { ModernPageHeader } from "@/components/ModernPageHeader";

type Provider = "hyperpay" | "tap" | "stcpay";

interface Setting {
  id?: string;
  organization_id?: string;
  provider: Provider;
  enabled: boolean;
  mode: "test" | "live";
  public_config: Record<string, string>;
}

const PROVIDERS: { id: Provider; name: string; icon: typeof CreditCard; configFields: { key: string; label: string }[] }[] = [
  { id: "hyperpay", name: "HyperPay", icon: CreditCard, configFields: [{ key: "entity_id", label: "Entity ID (Mada / Visa)" }] },
  { id: "tap", name: "Tap Payments", icon: Wallet, configFields: [{ key: "source", label: "Source ID (default src_all)" }] },
  { id: "stcpay", name: "STC Pay", icon: Smartphone, configFields: [{ key: "branch_id", label: "Branch ID" }] },
];

export default function PaymentGatewaysPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const orgId = profile?.organization_id;

  const { data, isLoading } = useQuery({
    queryKey: ["payment_gateway_settings", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data } = await supabase
        .from("payment_gateway_settings")
        .select("*")
        .eq("organization_id", orgId!);
      return (data ?? []) as unknown as Setting[];
    },
  });

  const [drafts, setDrafts] = useState<Record<Provider, Setting>>({} as any);

  useEffect(() => {
    if (!data) return;
    const next: Record<Provider, Setting> = {} as any;
    for (const p of PROVIDERS) {
      const existing = data.find((d) => d.provider === p.id);
      next[p.id] = existing ?? {
        provider: p.id, enabled: false, mode: "test", public_config: {},
      };
    }
    setDrafts(next);
  }, [data]);

  const update = (p: Provider, patch: Partial<Setting>) =>
    setDrafts((d) => ({ ...d, [p]: { ...d[p], ...patch } }));

  const save = async (p: Provider) => {
    if (!orgId) return;
    const draft = drafts[p];
    const payload = {
      organization_id: orgId,
      provider: p,
      enabled: draft.enabled,
      mode: draft.mode,
      public_config: draft.public_config ?? {},
    };
    const { error } = draft.id
      ? await supabase.from("payment_gateway_settings").update(payload).eq("id", draft.id)
      : await supabase.from("payment_gateway_settings").insert(payload);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("payments.settings.saved"));
      qc.invalidateQueries({ queryKey: ["payment_gateway_settings", orgId] });
    }
  };

  if (isLoading || !drafts.hyperpay) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t("payments.settings.title", "Payment Gateways")}
        description={t("payments.settings.description", "Enable Mada, Visa, Tap, and STC Pay for KSA card and wallet payments.")}
      />

      <div className="grid gap-4">
        {PROVIDERS.map((p) => {
          const Icon = p.icon;
          const draft = drafts[p.id];
          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div>
                  <div>
                    <CardTitle className="text-lg">{p.name}</CardTitle>
                    <CardDescription>
                      {draft.enabled ? <Badge variant="outline" className="mr-2">{t(`payments.mode.${draft.mode}`, draft.mode)}</Badge> : null}
                      {draft.enabled
                        ? t("payments.settings.enabled_hint", "Available at checkout")
                        : t("payments.settings.disabled_hint", "Disabled — toggle on after adding credentials")}
                    </CardDescription>
                  </div>
                </div>
                <Switch checked={draft.enabled} onCheckedChange={(v) => update(p.id, { enabled: v })} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>{t("payments.settings.mode", "Mode")}</Label>
                    <Select value={draft.mode} onValueChange={(v) => update(p.id, { mode: v as "test" | "live" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">{t("payments.mode.test", "Test")}</SelectItem>
                        <SelectItem value="live">{t("payments.mode.live", "Live")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {p.configFields.map((f) => (
                    <div key={f.key}>
                      <Label>{f.label}</Label>
                      <Input
                        value={draft.public_config?.[f.key] ?? ""}
                        onChange={(e) => update(p.id, {
                          public_config: { ...draft.public_config, [f.key]: e.target.value },
                        })}
                        placeholder={t("payments.settings.optional", "Optional")}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => save(p.id)}>{t("common.save", "Save")}</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("payments.settings.credentials_title", "Where credentials live")}</CardTitle>
          <CardDescription>
            {t(
              "payments.settings.credentials_hint",
              "Secret API keys (HyperPay access token, Tap secret key, STC Pay merchant secret) are stored as Lovable secrets, not in this database. Ask your admin to add them in the project secrets panel.",
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
