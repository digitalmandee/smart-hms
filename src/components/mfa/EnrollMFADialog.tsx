import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMFA } from "@/hooks/useMFA";
import { useSyncMfaStatus, useGenerateRecoveryCodes } from "@/hooks/useMfaAdmin";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { Loader2, Copy, Check, ShieldCheck, KeyRound } from "lucide-react";
import { RecoveryCodesDialog } from "./RecoveryCodesDialog";

interface EnrollMFADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollMFADialog({ open, onOpenChange }: EnrollMFADialogProps) {
  const { t } = useTranslation();
  const { enroll, challengeAndVerify } = useMFA();
  const syncStatus = useSyncMfaStatus();
  const generateCodes = useGenerateRecoveryCodes();
  const [step, setStep] = useState<"init" | "qr" | "success">("init");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartEnroll = async () => {
    setIsLoading(true);
    try {
      const data = await enroll();
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("qr");
    } catch (err: any) {
      toast.error(err.message || t("mfa.enroll_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      await challengeAndVerify(factorId, code);
      setStep("success");
      toast.success(t("mfa.enabled_success"));
      // Sync server-side enrollment timestamp (best-effort)
      syncStatus.mutate("enrolled");
    } catch (err: any) {
      toast.error(err.message || t("mfa.verify_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecovery = async () => {
    setIsLoading(true);
    try {
      const res = await generateCodes.mutateAsync({});
      setRecoveryCodes(res.codes);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("init");
    setCode("");
    setQrCode("");
    setSecret("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("mfa.setup_title")}</DialogTitle>
          <DialogDescription>{t("mfa.setup_desc")}</DialogDescription>
        </DialogHeader>

        {step === "init" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{t("mfa.setup_instructions")}</p>
            <Button onClick={handleStartEnroll} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("mfa.generate_qr")}
            </Button>
          </div>
        )}

        {step === "qr" && (
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-lg border" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">{t("mfa.cant_scan")}</p>
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                <code className="text-xs flex-1 break-all font-mono">{secret}</code>
                <Button variant="ghost" size="icon" onClick={handleCopySecret} className="shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{t("mfa.enter_code")}</p>
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
            </div>
            <Button onClick={handleVerify} disabled={isLoading || code.length !== 6} className="w-full">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("mfa.verify_enable")}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 py-6 text-center">
            <ShieldCheck className="h-16 w-16 mx-auto text-green-500" />
            <p className="font-semibold text-lg">{t("mfa.enabled_success")}</p>
            <p className="text-sm text-muted-foreground">{t("mfa.enabled_desc")}</p>
            <Button onClick={handleGenerateRecovery} disabled={isLoading} variant="outline" className="w-full">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <KeyRound className="h-4 w-4 mr-2" />}
              {t("mfa.recovery.generate")}
            </Button>
            <Button onClick={handleClose} className="w-full">{t("common.close")}</Button>
          </div>
        )}
      </DialogContent>
      <RecoveryCodesDialog
        open={!!recoveryCodes}
        onOpenChange={(o) => !o && setRecoveryCodes(null)}
        codes={recoveryCodes ?? []}
      />
    </Dialog>
  );
}
