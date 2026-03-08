import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface SehhatyPushButtonProps {
  syncType: "appointment" | "lab_result" | "sick_leave" | "medical_report";
  patientId: string;
  patientNationalId?: string;
  referenceId?: string;
  referenceType?: string;
  syncData?: Record<string, any>;
  disabled?: boolean;
  size?: "sm" | "default" | "lg" | "icon";
}

export function SehhatyPushButton({
  syncType,
  patientId,
  patientNationalId,
  referenceId,
  referenceType,
  syncData = {},
  disabled,
  size = "sm",
}: SehhatyPushButtonProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pushed, setPushed] = useState(false);

  if (country_code !== "SA") return null;

  const labelMap: Record<string, string> = {
    appointment: t("sehhaty.pushAppointment" as any, "Push to Sehhaty"),
    lab_result: t("sehhaty.pushLabResult" as any, "Send to Sehhaty"),
    sick_leave: t("sehhaty.pushSickLeave" as any, "Push e-Jaza"),
    medical_report: t("sehhaty.pushReport" as any, "Push Report"),
  };

  const handlePush = async () => {
    if (!profile?.organization_id) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("sehhaty-gateway", {
        body: {
          action: "push",
          sync_data: {
            sync_type: syncType,
            organization_id: profile.organization_id,
            patient_id: patientId,
            patient_national_id: patientNationalId || "",
            reference_id: referenceId,
            reference_type: referenceType,
            ...syncData,
          },
        },
      });

      if (error) throw error;

      setPushed(true);
      toast.success(t("sehhaty.pushed" as any, "Pushed to Sehhaty successfully"));
      setTimeout(() => setPushed(false), 3000);
    } catch (err) {
      console.error("Sehhaty push error:", err);
      toast.error(t("sehhaty.error" as any, "Failed to push to Sehhaty"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      className="gap-2"
      disabled={disabled || isSubmitting}
      onClick={handlePush}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : pushed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Smartphone className="h-4 w-4" />
      )}
      {pushed ? t("sehhaty.sent" as any, "Sent!") : labelMap[syncType]}
    </Button>
  );
}
