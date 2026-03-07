import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/lib/i18n";
import { usePatientInsurance } from "@/hooks/useInsurance";
import { EligibilityCheckButton } from "@/components/insurance/EligibilityCheckButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, ShieldCheck, ShieldX, Wallet, Building2, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export interface BillingSplit {
  totalAmount: number;
  insuranceAmount: number;
  patientCopay: number;
  deductible: number;
  patientResponsibility: number;
  isSelfPay: boolean;
  insurancePolicyNumber?: string;
  insuranceCompanyName?: string;
  patientInsuranceId?: string;
}

interface InsuranceBillingSplitProps {
  patientId: string;
  totalAmount: number;
  onSplitCalculated: (split: BillingSplit) => void;
  showHeader?: boolean;
}

interface EligibilityResult {
  eligible: boolean;
  status: string;
  copay?: number;
  deductible?: number;
  coverage_start?: string;
  coverage_end?: string;
  plan_name?: string;
}

export function InsuranceBillingSplit({
  patientId,
  totalAmount,
  onSplitCalculated,
  showHeader = true,
}: InsuranceBillingSplitProps) {
  const { t } = useTranslation();
  const { data: insurances, isLoading } = usePatientInsurance(patientId);
  const [isSelfPay, setIsSelfPay] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);

  const primaryInsurance = insurances?.find((ins) => ins.is_primary) || insurances?.[0];

  const calculateSplit = useCallback(() => {
    if (!primaryInsurance || isSelfPay || !primaryInsurance.insurance_plan) {
      const selfPaySplit: BillingSplit = {
        totalAmount,
        insuranceAmount: 0,
        patientCopay: 0,
        deductible: 0,
        patientResponsibility: totalAmount,
        isSelfPay: true,
      };
      onSplitCalculated(selfPaySplit);
      return;
    }

    const plan = primaryInsurance.insurance_plan;
    const company = plan.insurance_company;

    // Use eligibility result copay/deductible if available, otherwise use plan defaults
    const copayPercent = eligibilityResult?.copay ?? plan.copay_percentage ?? 0;
    const deductibleAmount = eligibilityResult?.deductible ?? plan.deductible_amount ?? 0;
    const coveragePercent = plan.coverage_percentage ?? 100;
    const maxCoverage = plan.max_coverage_amount;

    // Calculate insurance coverage
    let insuranceAmount = (totalAmount * coveragePercent) / 100;
    if (maxCoverage && insuranceAmount > maxCoverage) {
      insuranceAmount = maxCoverage;
    }

    // Calculate patient copay
    const patientCopay = plan.copay_amount > 0
      ? plan.copay_amount
      : (totalAmount * copayPercent) / 100;

    // Final patient responsibility
    const patientResponsibility = totalAmount - insuranceAmount + deductibleAmount;

    const split: BillingSplit = {
      totalAmount,
      insuranceAmount: Math.max(0, insuranceAmount),
      patientCopay: Math.max(0, patientCopay),
      deductible: deductibleAmount,
      patientResponsibility: Math.max(0, patientResponsibility),
      isSelfPay: false,
      insurancePolicyNumber: primaryInsurance.policy_number,
      insuranceCompanyName: company?.name,
      patientInsuranceId: primaryInsurance.id,
    };

    onSplitCalculated(split);
  }, [primaryInsurance, isSelfPay, totalAmount, eligibilityResult, onSplitCalculated]);

  useEffect(() => {
    if (!isLoading) {
      if (!primaryInsurance) {
        setIsSelfPay(true);
      }
      calculateSplit();
    }
  }, [isLoading, primaryInsurance, calculateSplit]);

  if (isLoading) return null;

  // No insurance found
  if (!primaryInsurance) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t("insBilling.noInsurance", "No active insurance — Self-Pay")}
            </span>
            <Badge variant="secondary" className="ms-auto">
              {t("apptInsurance.selfPay", "Self-Pay")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = primaryInsurance.insurance_plan;
  const company = plan?.insurance_company;
  const lastEligible = (primaryInsurance as any)?.nphies_eligible;

  // Calculate display values
  const copayPercent = eligibilityResult?.copay ?? plan?.copay_percentage ?? 0;
  const coveragePercent = plan?.coverage_percentage ?? 100;
  let insuranceAmount = (totalAmount * coveragePercent) / 100;
  if (plan?.max_coverage_amount && insuranceAmount > plan.max_coverage_amount) {
    insuranceAmount = plan.max_coverage_amount;
  }
  const deductible = eligibilityResult?.deductible ?? plan?.deductible_amount ?? 0;
  const patientCopay = plan?.copay_amount > 0
    ? plan.copay_amount
    : (totalAmount * copayPercent) / 100;
  const patientResponsibility = isSelfPay ? totalAmount : Math.max(0, totalAmount - insuranceAmount + deductible);

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("insBilling.insuranceSplit", "Insurance Billing Split")}
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
      )}
      <CardContent className="space-y-4">
        {/* Insurance Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">{t("apptInsurance.company", "Company")}</p>
            <p className="font-medium flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {company?.name || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("apptInsurance.plan", "Plan")}</p>
            <p className="font-medium">{plan?.name || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("insurance.policyNumber", "Policy")}</p>
            <p className="font-medium">{primaryInsurance.policy_number}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("insBilling.coverage", "Coverage")}</p>
            <p className="font-medium">{coveragePercent}%</p>
          </div>
        </div>

        {/* Eligibility Check */}
        <div className="flex items-center justify-between">
          <EligibilityCheckButton
            patientId={patientId}
            insurancePolicyNumber={primaryInsurance.policy_number}
            insuranceCompanyId={company?.id}
            memberId={primaryInsurance.member_id || undefined}
            patientInsuranceId={primaryInsurance.id}
            compact
            onResult={(result) => setEligibilityResult(result)}
          />
          <div className="flex items-center gap-2">
            <Switch
              id="self-pay-toggle"
              checked={isSelfPay}
              onCheckedChange={(checked) => {
                setIsSelfPay(checked);
              }}
            />
            <Label htmlFor="self-pay-toggle" className="text-sm">
              {t("insBilling.billAsSelfPay", "Bill as Self-Pay")}
            </Label>
          </div>
        </div>

        <Separator />

        {/* Billing Split Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("insBilling.totalBill", "Total Bill")}</span>
            <span className="font-medium">{formatCurrency(totalAmount)}</span>
          </div>

          {!isSelfPay && (
            <>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {t("insBilling.insuranceCovers", "Insurance Covers")} ({coveragePercent}%)
                </span>
                <span className="font-medium">- {formatCurrency(insuranceAmount)}</span>
              </div>

              {deductible > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("nphies.deductible", "Deductible")}</span>
                  <span>+ {formatCurrency(deductible)}</span>
                </div>
              )}

              {patientCopay > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("nphies.copay", "Copay")} {copayPercent > 0 ? `(${copayPercent}%)` : ""}</span>
                  <span>{formatCurrency(patientCopay)}</span>
                </div>
              )}
            </>
          )}

          <Separator />

          <div className="flex justify-between font-bold text-base">
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              {t("insBilling.patientPays", "Patient Pays")}
            </span>
            <span className={patientResponsibility > 0 ? "text-destructive" : "text-green-600"}>
              {formatCurrency(patientResponsibility)}
            </span>
          </div>

          {isSelfPay && primaryInsurance && (
            <p className="text-xs text-muted-foreground italic">
              {t("insBilling.selfPayOverride", "Insurance available but billing as self-pay")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
