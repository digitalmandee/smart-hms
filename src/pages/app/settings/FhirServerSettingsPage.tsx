import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Copy, Server, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FhirClient {
  id: string;
  client_id: string;
  display_name: string;
  scopes: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function FhirServerSettingsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<FhirClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [newSecret, setNewSecret] = useState<{ client_id: string; secret: string } | null>(null);

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fhir-server`;

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("fhir_clients")
      .select("id, client_id, display_name, scopes, is_active, last_used_at, created_at")
      .order("created_at", { ascending: false });
    setClients((data as FhirClient[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createClientCred = async () => {
    if (!displayName.trim() || !profile?.organization_id) return;
    const clientId = `fhir_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const secret = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const hash = await sha256(secret);
    const { error } = await supabase.from("fhir_clients").insert({
      organization_id: profile.organization_id,
      client_id: clientId,
      client_secret_hash: hash,
      display_name: displayName.trim(),
      scopes: "system/*.read",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewSecret({ client_id: clientId, secret });
    setDisplayName("");
    load();
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("fhir_clients").update({ is_active: false }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else load();
  };

  const copy = (s: string) => {
    navigator.clipboard.writeText(s);
    toast({ title: t("fhir.copied" as any, "Copied") });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("fhir.title" as any, "FHIR R4 Server")}
        description={t("fhir.description" as any, "SMART-on-FHIR read-only endpoints for external EHR integrations")}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>{t("fhir.endpoints" as any, "Endpoints")}</CardTitle>
          </div>
          <CardDescription>{t("fhir.endpointsDesc" as any, "Public capability statement and token endpoint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { label: t("fhir.smartConfig" as any, "SMART configuration"), url: `${baseUrl}/.well-known/smart-configuration` },
            { label: t("fhir.metadata" as any, "Capability statement"), url: `${baseUrl}/metadata` },
            { label: t("fhir.token" as any, "Token endpoint"), url: `${baseUrl}/token` },
            { label: "Patient", url: `${baseUrl}/Patient` },
            { label: "Appointment", url: `${baseUrl}/Appointment?patient={id}` },
            { label: "Observation (vitals)", url: `${baseUrl}/Observation?patient={id}` },
            { label: "MedicationRequest", url: `${baseUrl}/MedicationRequest?patient={id}` },
            { label: "Immunization", url: `${baseUrl}/Immunization?patient={id}` },
            { label: "DiagnosticReport", url: `${baseUrl}/DiagnosticReport?patient={id}` },
          ].map((e) => (
            <div key={e.url} className="flex items-center justify-between gap-3 rounded border bg-muted/30 px-3 py-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{e.label}</div>
                <div className="text-xs text-muted-foreground truncate">{e.url}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => copy(e.url)}><Copy className="h-4 w-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("fhir.clients" as any, "Client Credentials")}</CardTitle>
          <CardDescription>
            {t("fhir.clientsDesc" as any, "Issue client_id / client_secret pairs for system-scope integrations. Secrets are shown once at creation and stored hashed.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>{t("fhir.displayName" as any, "Display name")}</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Hospital EHR Bridge" />
            </div>
            <div className="flex items-end">
              <Button onClick={createClientCred} disabled={!displayName.trim()}>
                <Plus className="h-4 w-4 mr-1" /> {t("fhir.create" as any, "Create")}
              </Button>
            </div>
          </div>

          {newSecret && (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div className="font-medium">{t("fhir.secretWarn" as any, "Copy the secret now — it will not be shown again.")}</div>
              </div>
              <div className="grid grid-cols-[100px_1fr_auto] gap-2 items-center">
                <span className="text-muted-foreground">client_id</span>
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">{newSecret.client_id}</code>
                <Button size="icon" variant="ghost" onClick={() => copy(newSecret.client_id)}><Copy className="h-3 w-3" /></Button>
                <span className="text-muted-foreground">client_secret</span>
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">{newSecret.secret}</code>
                <Button size="icon" variant="ghost" onClick={() => copy(newSecret.secret)}><Copy className="h-3 w-3" /></Button>
              </div>
              <Button size="sm" variant="outline" onClick={() => setNewSecret(null)}>{t("common.close" as any, "Close")}</Button>
            </div>
          )}

          <div className="divide-y border rounded-lg">
            {loading && <div className="p-3 text-sm text-muted-foreground">{t("common.loading" as any, "Loading...")}</div>}
            {!loading && clients.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">{t("fhir.empty" as any, "No clients yet")}</div>
            )}
            {clients.map((c) => (
              <div key={c.id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.display_name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {c.client_id} · {c.scopes} · {c.last_used_at ? `${t("fhir.lastUsed" as any, "Last used")} ${new Date(c.last_used_at).toLocaleString()}` : t("fhir.neverUsed" as any, "Never used")}
                  </div>
                </div>
                <Badge variant={c.is_active ? "default" : "secondary"}>
                  {c.is_active ? t("fhir.active" as any, "Active") : t("fhir.revoked" as any, "Revoked")}
                </Badge>
                {c.is_active && (
                  <Button size="icon" variant="ghost" onClick={() => revoke(c.id)} title={t("fhir.revoke" as any, "Revoke")}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
