import { useTranslation } from "@/lib/i18n";
import { usePatientInsurance } from "@/hooks/useInsurance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { EligibilityCheckButton } from "@/components/insurance/EligibilityCheckButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  Building2,
  CreditCard,
  Hash,
  CalendarDays,
  History,
} from "lucide-react";
import { format } from "date-fns";

interface PatientInsuranceTabProps {
  patientId: string;
}

export function PatientInsuranceTab({ patientId }: PatientInsuranceTabProps) {
  const { t } = useTranslation();
  const { data: insurances, isLoading, refetch } = usePatientInsurance(patientId);

  // Fetch eligibility logs
  const { data: eligibilityLogs } = useQuery({
    queryKey: ["eligibility-logs", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nphies_eligibility_logs" as any)
        .select("*")
        .eq("patient_id", patientId)
        .order("checked_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!patientId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!insurances || insurances.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t("insurance.noInsurance", "No Insurance Policies")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("insurance.noInsuranceDesc", "This patient has no active insurance policies. Add insurance from the patient edit page.")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insurance Policies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("insurance.activePolicies", "Active Policies")}
        </h3>

        {insurances.map((ins) => {
          const plan = ins.insurance_plan;
          const company = plan?.insurance_company;
          const nphiesEligible = (ins as any).nphies_eligible;
          const nphiesLastChecked = (ins as any).nphies_last_checked;

          return (
            <Card key={ins.id}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Company & Plan */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {company?.name || t("common.unknown", "Unknown")}
                      </span>
                      {ins.is_primary && (
                        <Badge variant="default" className="text-xs">
                          {t("insurance.primary", "Primary")}
                        </Badge>
                      )}
                      <StatusBadge status={ins.is_active ? "active" : "inactive"} />
                    </div>

                    {plan && (
                      <p className="text-sm text-muted-foreground">
                        {plan.name}
                        {plan.plan_type && ` • ${plan.plan_type}`}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{t("insurance.policyNumber", "Policy")}:</span>
                        <span className="font-medium">{ins.policy_number}</span>
                      </div>
                      {ins.member_id && (
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{t("insurance.memberId", "Member ID")}:</span>
                          <span className="font-medium">{ins.member_id}</span>
                        </div>
                      )}
                      {ins.cchi_number && (
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">CCHI:</span>
                          <span className="font-medium">{ins.cchi_number}</span>
                        </div>
                      )}
                      {ins.start_date && (
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(ins.start_date), "MMM dd, yyyy")}
                            {ins.end_date && ` - ${format(new Date(ins.end_date), "MMM dd, yyyy")}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* NPHIES Status */}
                    {nphiesLastChecked && (
                      <div className="flex items-center gap-2 text-sm">
                        {nphiesEligible ? (
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                        ) : (
                          <ShieldX className="h-4 w-4 text-destructive" />
                        )}
                        <span className={nphiesEligible ? "text-green-600" : "text-destructive"}>
                          {nphiesEligible
                            ? t("nphies.eligible", "Eligible")
                            : t("nphies.notEligible", "Not Eligible")}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(nphiesLastChecked), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Eligibility Check Button */}
                  <div className="flex-shrink-0">
                    <EligibilityCheckButton
                      patientId={patientId}
                      insurancePolicyNumber={ins.policy_number}
                      insuranceCompanyId={company?.id}
                      memberId={ins.member_id || undefined}
                      patientInsuranceId={ins.id}
                      onResult={() => refetch()}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Eligibility History */}
      {eligibilityLogs && eligibilityLogs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("insurance.eligibilityHistory", "Eligibility Verification History")}
          </h3>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {eligibilityLogs.map((log: any) => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.eligible ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={log.eligible ? "default" : "destructive"} className="text-xs">
                            {log.eligible
                              ? t("nphies.eligible", "Eligible")
                              : t("nphies.notEligible", "Not Eligible")}
                          </Badge>
                          {log.plan_name && (
                            <span className="text-sm text-muted-foreground">{log.plan_name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {log.copay !== null && <span>{t("nphies.copay", "Copay")}: {log.copay}%</span>}
                          {log.deductible !== null && <span>{t("nphies.deductible", "Deductible")}: SAR {log.deductible}</span>}
                          {log.coverage_end && <span>{t("nphies.coverageEnd", "Coverage End")}: {log.coverage_end}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.checked_at && format(new Date(log.checked_at), "MMM dd, yyyy HH:mm")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
