import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { GatewayProvider } from "./PaymentMethodPicker";

export interface GatewayCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: GatewayProvider;
  amount: number;
  currency?: string;
  invoiceId?: string;
  patientId?: string;
  branchId?: string;
  customer?: { name?: string; email?: string; phone?: string };
  onSuccess?: (txId: string) => void;
}

type Phase = "idle" | "creating" | "awaiting" | "success" | "failed";

export function GatewayCheckoutDialog(props: GatewayCheckoutDialogProps) {
  const { open, onOpenChange, provider, amount, currency = "SAR", invoiceId, patientId, branchId, customer, onSuccess } = props;
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("idle");
  const [txId, setTxId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setTxId(null);
      setCheckoutUrl(null);
      setErrorMsg(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [open]);

  const startCheckout = async () => {
    setPhase("creating");
    setErrorMsg(null);
    if (provider === "stcpay" && !phone) {
      setPhase("idle");
      toast.error(t("payments.checkout.phone_required"));
      return;
    }

    const { data, error } = await supabase.functions.invoke("payment-create", {
      body: {
        provider,
        invoice_id: invoiceId,
        patient_id: patientId,
        branch_id: branchId,
        amount,
        currency,
        customer: { ...customer, phone: phone || customer?.phone },
        return_url: window.location.href,
      },
    });
    if (error || (data as any)?.error) {
      setPhase("failed");
      setErrorMsg(error?.message ?? (data as any)?.error ?? "Failed");
      return;
    }
    setTxId((data as any).tx_id);
    setCheckoutUrl((data as any).checkout_url ?? null);
    setPhase("awaiting");

    // Open external page for hyperpay/tap
    if ((data as any).checkout_url && provider !== "hyperpay") {
      window.open((data as any).checkout_url, "_blank", "noopener");
    }
    // Start polling
    pollRef.current = setInterval(async () => {
      const { data: poll } = await supabase.functions.invoke("payment-status", {
        body: { tx_id: (data as any).tx_id },
      });
      const status = (poll as any)?.status;
      if (status === "succeeded") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("success");
        onSuccess?.((data as any).tx_id);
      } else if (["failed", "expired"].includes(status)) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("failed");
        setErrorMsg(status);
      }
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(`payments.method.${provider}` as any)}</DialogTitle>
          <DialogDescription>
            {t("payments.checkout.amount")}: <span className="font-mono font-semibold">{amount.toFixed(2)} {currency}</span>
          </DialogDescription>
        </DialogHeader>

        {phase === "idle" && provider === "stcpay" && (
          <div className="space-y-2">
            <Label>{t("payments.checkout.phone_required")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5XXXXXXXX" inputMode="tel" />
          </div>
        )}

        {phase === "creating" && (
          <div className="flex items-center gap-2 py-6"><Loader2 className="h-4 w-4 animate-spin" /> {t("payments.checkout.processing")}</div>
        )}

        {phase === "awaiting" && (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("payments.checkout.waiting")}
            </div>
            {provider === "hyperpay" && checkoutUrl && (
              <iframe src={checkoutUrl} title="HyperPay" className="w-full h-96 border rounded-md" />
            )}
            {provider !== "hyperpay" && checkoutUrl && (
              <Button variant="outline" onClick={() => window.open(checkoutUrl, "_blank", "noopener")}>
                {t("payments.checkout.open_gateway")}
              </Button>
            )}
          </div>
        )}

        {phase === "success" && (
          <div className="flex items-center gap-2 py-6 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" /> {t("payments.checkout.success")}
          </div>
        )}

        {phase === "failed" && (
          <div className="space-y-2 py-2">
            <div className="flex items-center gap-2 text-rose-600">
              <XCircle className="h-5 w-5" /> {t("payments.checkout.failed")}
            </div>
            {errorMsg && <div className="text-xs text-muted-foreground">{errorMsg}</div>}
          </div>
        )}

        <DialogFooter className="gap-2">
          {phase === "idle" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("payments.checkout.cancel")}</Button>
              <Button onClick={startCheckout}>{t("payments.checkout.open_gateway")}</Button>
            </>
          )}
          {phase === "failed" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t("payments.checkout.cancel")}</Button>
              <Button onClick={startCheckout}>{t("payments.checkout.retry")}</Button>
            </>
          )}
          {phase === "success" && <Button onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>}
          {(phase === "creating" || phase === "awaiting") && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("payments.checkout.cancel")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
