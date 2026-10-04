import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { Heart, Loader2 } from "lucide-react";

export default function PortalResetPasswordPage() {
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: t("portal.password" as any), description: "8+", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("portal.access.reset" as any) });
    navigate("/portal/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={rtl ? "rtl" : "ltr"}>
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 bg-card border rounded-lg p-6">
        <Heart className="h-10 w-10 mx-auto text-primary" />
        <h1 className="text-xl font-bold text-center">{t("portal.access.reset" as any)}</h1>
        <div className="space-y-2">
          <Label htmlFor="pw">{t("portal.password" as any)}</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
          {t("portal.access.reset" as any)}
        </Button>
      </form>
    </div>
  );
}
