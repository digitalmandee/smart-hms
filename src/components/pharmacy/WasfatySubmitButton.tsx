import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle, XCircle, Clock } from "lucide-react";

interface WasfatySubmitButtonProps {
  prescriptionId: string;
  patientId: string;
  medications: Array<{
    drugCode?: string;
    drugName: string;
    dosage: string;
    frequency: string;
    duration: number;
    durationUnit: 'days' | 'weeks' | 'months';
    quantity: number;
    instructions?: string;
  }>;
  diagnosisCodes?: string[];
  onSuccess?: (wasfatyId: string) => void;
}

export function WasfatySubmitButton({
  prescriptionId,
  patientId,
  medications,
  diagnosisCodes,
  onSuccess,
}: WasfatySubmitButtonProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const [status, setStatus] = useState<'idle' | 'submitted' | 'failed'>('idle');

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.organization_id) throw new Error("No organization");

      // First, create the wasfaty_prescription record
      const { data: wasfatyRx, error: createError } = await supabase
        .from("wasfaty_prescriptions")
        .insert({
          organization_id: profile.organization_id,
          patient_id: patientId,
          prescription_id: prescriptionId,
          medications: medications,
          diagnosis_codes: diagnosisCodes || [],
        })
        .select()
        .single();

      if (createError) throw createError;

      // Then submit to Wasfaty
      const { data, error } = await supabase.functions.invoke("wasfaty-gateway", {
        body: {
          action: "submit",
          prescription_id: wasfatyRx.id,
          organization_id: profile.organization_id,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Submission failed");

      return data;
    },
    onSuccess: (data) => {
      setStatus('submitted');
      toast.success(t("wasfaty.submitted" as any, "Prescription sent to Wasfaty"));
      onSuccess?.(data.wasfaty_id);
    },
    onError: (err) => {
      setStatus('failed');
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    },
  });

  // Only show for KSA
  if (country_code !== 'SA') {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => submitMutation.mutate()}
        disabled={submitMutation.isPending || status === 'submitted'}
      >
        {submitMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {t("wasfaty.submit" as any, "Send to Wasfaty")}
      </Button>
      {status !== 'idle' && (
        <Badge variant={status === 'submitted' ? 'default' : 'destructive'}>
          {getStatusIcon()}
          <span className="ml-1">
            {status === 'submitted' 
              ? t("wasfaty.sentStatus" as any, "Sent")
              : t("wasfaty.failedStatus" as any, "Failed")}
          </span>
        </Badge>
      )}
    </div>
  );
}

interface WasfatyStatusBadgeProps {
  status: string;
  wasfatyId?: string;
}

export function WasfatyStatusBadge({ status, wasfatyId }: WasfatyStatusBadgeProps) {
  const { t } = useTranslation();

  const getVariant = () => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'dispensed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'expired':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-3 w-3" />;
      case 'dispensed':
        return <CheckCircle className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'draft':
        return t("wasfaty.status.draft" as any, "Draft");
      case 'submitted':
        return t("wasfaty.status.submitted" as any, "Submitted");
      case 'dispensed':
        return t("wasfaty.status.dispensed" as any, "Dispensed");
      case 'failed':
        return t("wasfaty.status.failed" as any, "Failed");
      case 'expired':
        return t("wasfaty.status.expired" as any, "Expired");
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()} className="gap-1">
      {getIcon()}
      {getLabel()}
    </Badge>
  );
}
