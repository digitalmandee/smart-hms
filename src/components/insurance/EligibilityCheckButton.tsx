import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface EligibilityCheckButtonProps {
  patientId: string;
  insurancePolicyNumber?: string;
  insuranceCompanyId?: string;
  memberId?: string;
  compact?: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  status: string;
  coverage_start?: string;
  coverage_end?: string;
  plan_name?: string;
  copay?: number;
  deductible?: number;
  benefits?: Array<{
    type: string;
    allowed: boolean;
    remaining?: number;
  }>;
  raw_response?: unknown;
}

export function EligibilityCheckButton({
  patientId,
  insurancePolicyNumber,
  insuranceCompanyId,
  memberId,
  compact = false,
}: EligibilityCheckButtonProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleCheck = async () => {
    if (!profile?.organization_id) {
      toast.error("No organization configured");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nphies-gateway", {
        body: {
          action: "eligibility",
          organization_id: profile.organization_id,
          patient_id: patientId,
          insurance_policy_number: insurancePolicyNumber,
          insurance_company_id: insuranceCompanyId,
          member_id: memberId,
        },
      });

      if (error) throw error;

      setResult(data as EligibilityResult);
      setShowDialog(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Eligibility check failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = result?.eligible ? ShieldCheck : result?.status === "unknown" ? ShieldAlert : ShieldX;
  const statusColor = result?.eligible ? "text-green-600" : result?.status === "unknown" ? "text-yellow-600" : "text-destructive";

  return (
    <>
      <Button
        variant={compact ? "ghost" : "outline"}
        size={compact ? "sm" : "default"}
        onClick={handleCheck}
        disabled={loading || !insurancePolicyNumber}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin me-2" />
        ) : (
          <ShieldCheck className="h-4 w-4 me-2" />
        )}
        {compact
          ? t("nphies.checkEligibility", "Check")
          : t("nphies.checkEligibility", "Check Eligibility")}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              {t("nphies.eligibilityResult", "Eligibility Result")}
            </DialogTitle>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={result.eligible ? "default" : "destructive"}>
                  {result.eligible
                    ? t("nphies.eligible", "Eligible")
                    : t("nphies.notEligible", "Not Eligible")}
                </Badge>
                <span className="text-sm text-muted-foreground">{result.status}</span>
              </div>

              {result.plan_name && (
                <div>
                  <p className="text-sm text-muted-foreground">{t("nphies.planName", "Plan")}</p>
                  <p className="font-medium">{result.plan_name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {result.coverage_start && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("nphies.coverageStart", "Coverage Start")}</p>
                    <p className="font-medium">{result.coverage_start}</p>
                  </div>
                )}
                {result.coverage_end && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("nphies.coverageEnd", "Coverage End")}</p>
                    <p className="font-medium">{result.coverage_end}</p>
                  </div>
                )}
                {result.copay !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("nphies.copay", "Copay")}</p>
                    <p className="font-medium">{result.copay}%</p>
                  </div>
                )}
                {result.deductible !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{t("nphies.deductible", "Deductible")}</p>
                    <p className="font-medium">SAR {result.deductible}</p>
                  </div>
                )}
              </div>

              {result.benefits && result.benefits.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">{t("nphies.benefits", "Benefits")}</p>
                  <div className="space-y-1">
                    {result.benefits.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{b.type}</span>
                        <Badge variant={b.allowed ? "default" : "secondary"} className="text-xs">
                          {b.allowed ? "Covered" : "Not Covered"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
