import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMFA } from "@/hooks/useMFA";
import { useRedeemRecoveryCode } from "@/hooks/useMfaAdmin";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { ShieldCheck, Loader2, LogOut, KeyRound, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MFAVerifyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { factorId, challengeAndVerify } = useMFA();
  const redeemCode = useRedeemRecoveryCode();
  const [mode, setMode] = useState<"totp" | "recovery">("totp");
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
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

  const handleRedeem = async () => {
    setIsLoading(true);
    try {
      await redeemCode.mutateAsync(recoveryCode);
      toast.success(t("mfa.recovery.redeemed") as string);
      await supabase.auth.signOut();
      navigate("/auth/login", { replace: true });
    } catch (err: any) {
      toast.error(err.message || (t("mfa.recovery.invalid") as string));
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
          <CardDescription>
            {mode === "totp" ? t("mfa.verify_desc") : t("mfa.recovery.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {mode === "totp" ? (
            <>
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
              <Button variant="ghost" onClick={() => setMode("recovery")} className="w-full text-muted-foreground">
                <KeyRound className="h-4 w-4 mr-2" />
                {t("mfa.recovery.use_code")}
              </Button>
            </>
          ) : (
            <>
              <Input
                placeholder={t("mfa.recovery.code_placeholder") as string}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                className="font-mono text-center"
                autoFocus
              />
              <Button onClick={handleRedeem} disabled={isLoading || recoveryCode.length < 11} className="w-full">
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("mfa.recovery.redeem")}
              </Button>
              <Button variant="ghost" onClick={() => setMode("totp")} className="w-full text-muted-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("mfa.verify_button")}
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={handleSignOut} className="w-full text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            {t("mfa.sign_out_instead")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
