import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMFA } from "@/hooks/useMFA";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { ShieldCheck, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MFAVerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { factorId, challengeAndVerify } = useMFA();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setIsLoading(true);
    try {
      await challengeAndVerify(factorId, code);
      toast.success(t("mfa.verified"));
      navigate("/app", { replace: true });
    } catch (err: any) {
      toast.error(err.message || t("mfa.verify_error"));
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldCheck className="h-12 w-12 mx-auto mb-2 text-primary" />
          <CardTitle>{t("mfa.verify_title")}</CardTitle>
          <CardDescription>{t("mfa.verify_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} disabled={isLoading || code.length !== 6} className="w-full">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("mfa.verify_button")}
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="w-full text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            {t("mfa.sign_out_instead")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
