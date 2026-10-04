import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { KeyRound, Copy, MessageCircle, Loader2, ShieldOff, ShieldCheck, UserPlus } from "lucide-react";

interface Props {
  patientId: string;
  defaultEmail?: string | null;
  phone?: string | null;
}

type Status = { exists: boolean; is_active?: boolean; last_login_at?: string | null; email?: string | null };

export function PortalAccessCard({ patientId, defaultEmail, phone }: Props) {
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const allowed = hasRole("org_admin" as any) || hasRole("super_admin" as any) || hasRole("receptionist" as any);
  const [email, setEmail] = useState(defaultEmail || "");
  const [busy, setBusy] = useState<string | null>(null);
  const [cred, setCred] = useState<{ email: string; password: string } | null>(null);

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("portal-account-manage", {
      body: { action, patient_id: patientId, ...extra },
    });
    if (error) {
      let msg = error.message;
      try { msg = (await (error as any).context?.json())?.error || msg; } catch { /* keep message */ }
      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const { data: status, isLoading } = useQuery({
    queryKey: ["portal-access", patientId],
    enabled: allowed,
    queryFn: () => call("status") as Promise<Status>,
  });

  if (!allowed) return null;

  const run = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(action);
    try {
      const res = await call(action, extra);
      if (res?.password) setCred({ email: res.email, password: res.password });
      qc.invalidateQueries({ queryKey: ["portal-access", patientId] });
      toast.success(t("portal.access.title" as any));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const loginUrl = `${window.location.origin}/portal/login`;
  const waText = cred ? `${t("portal.access.wa_msg" as any)}\n${loginUrl}\n${cred.email}\n${cred.password}` : "";
  const sendWa = () => {
    const digits = (phone || "").replace(/[^\d]/g, "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(waText)}`, "_blank");
  };

  return (
    <Card dir={rtl ? "rtl" : "ltr"} className={cn(rtl && "text-end")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn("text-lg flex items-center justify-between gap-2", rtl && "flex-row-reverse")}>
          <span className={cn("flex items-center gap-2", rtl && "flex-row-reverse")}>
            <KeyRound className="h-5 w-5" /> {t("portal.access.title" as any)}
          </span>
          {status?.exists && (
            <Badge variant={status.is_active ? "default" : "secondary"}>
              {status.is_active ? t("portal.access.active" as any) : t("portal.access.disabled" as any)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("portal.access.desc" as any)}</p>

        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !status?.exists ? (
          <div className={cn("flex flex-col sm:flex-row gap-3 sm:items-end", rtl && "sm:flex-row-reverse")}>
            <div className="flex-1 space-y-1">
              <Label>{t("portal.access.email" as any)}</Label>
              <Input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button onClick={() => run("create", { email })} disabled={!!busy || !email}>
              {busy === "create" ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <UserPlus className="h-4 w-4 me-2" />}
              {t("portal.access.create" as any)}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">{t("portal.access.email" as any)}</p>
                <p className="font-medium" dir="ltr">{status.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("portal.access.last_login" as any)}</p>
                <p className="font-medium">
                  {status.last_login_at ? format(new Date(status.last_login_at), "MMM d, yyyy h:mm a") : t("portal.access.never" as any)}
                </p>
              </div>
            </div>
            <div className={cn("flex flex-wrap gap-2", rtl && "flex-row-reverse")}>
              <Button variant="outline" onClick={() => run("reset")} disabled={!!busy}>
                {busy === "reset" ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <KeyRound className="h-4 w-4 me-2" />}
                {t("portal.access.reset" as any)}
              </Button>
              {status.is_active ? (
                <Button variant="outline" onClick={() => run("disable")} disabled={!!busy}>
                  <ShieldOff className="h-4 w-4 me-2" />{t("portal.access.disable" as any)}
                </Button>
              ) : (
                <Button variant="outline" onClick={() => run("enable")} disabled={!!busy}>
                  <ShieldCheck className="h-4 w-4 me-2" />{t("portal.access.enable" as any)}
                </Button>
              )}
            </div>
          </>
        )}

        {cred && (
          <div className="rounded-md border bg-muted/50 p-3 space-y-2">
            <p className="text-xs text-muted-foreground">{t("portal.access.temp_password" as any)}</p>
            <p className="font-mono text-sm" dir="ltr">{cred.email}</p>
            <p className="font-mono text-lg font-bold" dir="ltr">{cred.password}</p>
            <div className={cn("flex flex-wrap gap-2", rtl && "flex-row-reverse")}>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(waText); toast.success(t("portal.access.copy" as any)); }}>
                <Copy className="h-4 w-4 me-2" />{t("portal.access.copy" as any)}
              </Button>
              <Button size="sm" onClick={sendWa}>
                <MessageCircle className="h-4 w-4 me-2" />{t("portal.access.send_wa" as any)}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
