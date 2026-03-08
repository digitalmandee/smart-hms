import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Fingerprint, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface NafathVerifyButtonProps {
  patientId: string;
  nationalId: string;
  isVerified?: boolean;
  onVerified?: () => void;
  disabled?: boolean;
}

export function NafathVerifyButton({
  patientId,
  nationalId,
  isVerified,
  onVerified,
  disabled,
}: NafathVerifyButtonProps) {
  const { t } = useTranslation();
  const { country_code } = useCountryConfig();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "verified" | "error">("idle");
  const [randomNumber, setRandomNumber] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Poll for verification status
  useEffect(() => {
    if (!polling || !requestId) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("nafath-gateway", {
          body: {
            action: "check_status",
            request_id: requestId,
            national_id: nationalId,
            patient_id: patientId,
          },
        });

        if (error) throw error;

        if (data.verified) {
          setStatus("verified");
          setPolling(false);
          onVerified?.();
          toast.success(t("nafath.success" as any, "Identity verified via Nafath"));
        }
      } catch {
        // Continue polling
      }
    }, 3000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => {
      setPolling(false);
      setStatus((prev) => prev === "pending" ? "error" : prev);
      if (status === "pending") {
        toast.error(t("nafath.timeout" as any, "Verification timed out"));
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [polling, requestId, nationalId, patientId, onVerified, status, t]);

  if (country_code !== "SA") return null;

  if (isVerified) {
    return (
      <Badge variant="outline" className="gap-1 border-green-300 text-green-600">
        <CheckCircle2 className="h-3 w-3" />
        {t("nafath.verified" as any, "Nafath Verified")}
      </Badge>
    );
  }

  const initiateVerification = async () => {
    if (!nationalId) {
      toast.error(t("nafath.noNationalId" as any, "National ID is required for Nafath verification"));
      return;
    }

    setStatus("pending");
    try {
      const { data, error } = await supabase.functions.invoke("nafath-gateway", {
        body: {
          action: "initiate_verification",
          national_id: nationalId,
          patient_id: patientId,
        },
      });

      if (error) throw error;

      if (data.status === "pending") {
        setRandomNumber(data.random_number);
        setRequestId(data.request_id);
        setPolling(true);
      } else {
        setStatus("error");
        toast.error(data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Nafath error:", err);
      setStatus("error");
      toast.error(t("nafath.error" as any, "Failed to initiate Nafath verification"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <Fingerprint className="h-4 w-4" />
          {t("nafath.verify" as any, "Verify via Nafath")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            {t("nafath.title" as any, "Nafath Identity Verification")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          {status === "idle" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                {t("nafath.instructions" as any, "This will send a verification request to the patient's Nafath app.")}
              </p>
              <p className="text-sm font-medium">
                {t("nafath.nationalIdLabel" as any, "National ID")}: {nationalId}
              </p>
              <Button onClick={initiateVerification} className="gap-2">
                <Fingerprint className="h-4 w-4" />
                {t("nafath.startVerification" as any, "Start Verification")}
              </Button>
            </>
          )}

          {status === "pending" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              {randomNumber && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("nafath.selectNumber" as any, "Ask patient to select this number in Nafath app:")}
                  </p>
                  <span className="text-4xl font-bold text-primary">{randomNumber}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground animate-pulse">
                {t("nafath.waiting" as any, "Waiting for patient to approve...")}
              </p>
            </>
          )}

          {status === "verified" && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-green-600">
                {t("nafath.identityVerified" as any, "Identity Verified")}
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-sm text-destructive">
                {t("nafath.failed" as any, "Verification failed or timed out")}
              </p>
              <Button variant="outline" onClick={() => { setStatus("idle"); setPolling(false); }}>
                {t("common.tryAgain" as any, "Try Again")}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
