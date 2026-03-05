import { useTranslation } from "@/lib/i18n";
import { usePatientInsurance } from "@/hooks/useInsurance";
import { EligibilityCheckButton } from "@/components/insurance/EligibilityCheckButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldCheck, ShieldX, AlertTriangle, Wallet } from "lucide-react";
import { useState } from "react";

interface AppointmentInsuranceCheckProps {
  patientId: string | undefined;
}

interface EligibilityResult {
  eligible: boolean;
  status: string;
  coverage_start?: string;
  coverage_end?: string;
  plan_name?: string;
  copay?: number;
  deductible?: number;
}

export function AppointmentInsuranceCheck({ patientId }: AppointmentInsuranceCheckProps) {
  const { t } = useTranslation();
  const { data: insurances, isLoading } = usePatientInsurance(patientId);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

  if (!patientId) return null;
  if (isLoading) return null;

  const primaryInsurance = insurances?.find((ins) => ins.is_primary) || insurances?.[0];

  // No insurance — self-pay badge
  if (!primaryInsurance) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("apptInsurance.noInsurance", "No active insurance found")}
            </span>
            <Badge variant="secondary" className="ms-auto">
              {t("apptInsurance.selfPay", "Self-Pay")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const company = primaryInsurance.insurance_plan?.insurance_company;
  const plan = primaryInsurance.insurance_plan;
  const lastChecked = (primaryInsurance as any)?.nphies_last_checked;
  const lastEligible = (primaryInsurance as any)?.nphies_eligible;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t("apptInsurance.patientInsurance", "Patient Insurance")}
          {lastEligible === true && (
            <Badge variant="default" className="ms-auto text-xs">
              <ShieldCheck className="h-3 w-3 me-1" />
              {t("apptInsurance.verified", "Verified")}
            </Badge>
          )}
          {lastEligible === false && (
            <Badge variant="destructive" className="ms-auto text-xs">
              <ShieldX className="h-3 w-3 me-1" />
              {t("apptInsurance.notVerified", "Not Verified")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Policy details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">{t("apptInsurance.company", "Company")}</p>
            <p className="font-medium">{company?.name || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("apptInsurance.plan", "Plan")}</p>
            <p className="font-medium">{plan?.name || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("insurance.policyNumber", "Policy")}</p>
            <p className="font-medium">{primaryInsurance.policy_number}</p>
          </div>
          {primaryInsurance.member_id && (
            <div>
              <p className="text-muted-foreground">{t("insurance.memberId", "Member ID")}</p>
              <p className="font-medium">{primaryInsurance.member_id}</p>
            </div>
          )}
        </div>

        {/* Last check info */}
        {lastChecked && (
          <p className="text-xs text-muted-foreground">
            {t("apptInsurance.lastChecked", "Last checked")}: {new Date(lastChecked).toLocaleDateString()}
          </p>
        )}

        {/* Eligibility result inline */}
        {eligibilityResult && (
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-2">
              {eligibilityResult.eligible ? (
                <ShieldCheck className="h-4 w-4 text-green-600" />
              ) : (
                <ShieldX className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {eligibilityResult.eligible
                  ? t("nphies.eligible", "Eligible")
                  : t("nphies.notEligible", "Not Eligible")}
              </span>
            </div>
            {eligibilityResult.copay !== undefined && (
              <p className="text-xs text-muted-foreground">
                {t("nphies.copay", "Copay")}: {eligibilityResult.copay}%
              </p>
            )}
          </div>
        )}

        {/* Not eligible warning */}
        {eligibilityResult && !eligibilityResult.eligible && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t("apptInsurance.coverageWarning", "Patient insurance is not eligible. You may still proceed with the appointment.")}
            </AlertDescription>
          </Alert>
        )}

        {/* Verify button */}
        <div className="flex justify-end">
          <EligibilityCheckButton
            patientId={patientId}
            insurancePolicyNumber={primaryInsurance.policy_number}
            insuranceCompanyId={company?.id}
            memberId={primaryInsurance.member_id || undefined}
            patientInsuranceId={primaryInsurance.id}
            compact
            onResult={(result) => setEligibilityResult(result)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
