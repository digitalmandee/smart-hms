import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2, Fingerprint } from "lucide-react";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { useTranslation, useIsRTL } from "@/lib/i18n";

export default function PortalLoginPage() {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { country_code } = useCountryConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [nafathLoading, setNafathLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onNafath() {
    if (!/^[12]\d{9}$/.test(nationalId)) {
      toast({ title: t("nafath.noNationalId" as any), variant: "destructive" });
      return;
    }
    setNafathLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nafath-gateway", {
        body: { action: "initiate_verification", national_id: nationalId },
      });
      if (error) throw error;
      toast({
        title: t("nafath.waiting" as any),
        description: data?.random_number ? `${t("nafath.selectNumber" as any)} ${data.random_number}` : undefined,
      });
    } catch (err: any) {
      toast({ title: t("nafath.error" as any), description: String(err?.message ?? err), variant: "destructive" });
    } finally {
      setNafathLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: t("portal.login_failed" as any), description: error.message, variant: "destructive" });
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: acct } = await supabase.from("patient_portal_accounts").select("id").eq("user_id", user.id).maybeSingle();
        if (!acct) {
          toast({ title: t("portal.no_account_title" as any), description: t("portal.no_account_body" as any), variant: "destructive" });
          await supabase.auth.signOut();
          return;
        }
      }
      navigate("/portal/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Heart className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">{t("portal.login_title" as any)}</h1>
          <p className="text-muted-foreground text-sm">{t("portal.login_subtitle" as any)}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 bg-card border rounded-lg p-6">
          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email" as any)}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("portal.password" as any)}</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {t("portal.sign_in" as any)}
          </Button>
        </form>

        {country_code === "SA" && (
          <div className="space-y-3 bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Fingerprint className="h-4 w-4 text-primary" />
              {t("nafath.sso.title" as any)}
            </div>
            <p className="text-xs text-muted-foreground">{t("nafath.sso.description" as any)}</p>
            <div className="space-y-2">
              <Label htmlFor="nid">{t("nafath.sso.idLabel" as any)}</Label>
              <Input id="nid" inputMode="numeric" maxLength={10} value={nationalId} onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))} placeholder="1xxxxxxxxx" />
            </div>
            <Button type="button" variant="outline" className="w-full" disabled={nafathLoading} onClick={onNafath}>
              {nafathLoading ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Fingerprint className="h-4 w-4 me-2" />}
              {t("nafath.sso.continue" as any)}
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t("portal.need_account" as any)}{" "}
          <Link to="/" className="text-primary hover:underline">{t("portal.contact_clinic" as any)}</Link>
        </p>
      </div>
    </div>
  );
}
