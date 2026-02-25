import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "./BloodGroupBadge";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useExpiringUnits } from "@/hooks/useBloodBank";
import { useTranslation } from "@/lib/i18n";
import type { BloodGroupType } from "@/hooks/useBloodBank";

export function ExpiryAlertBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: expiringUnits, isLoading } = useExpiringUnits(3);

  if (isLoading || !expiringUnits || expiringUnits.length === 0) return null;

  // Group by blood group
  const groupCounts: Partial<Record<BloodGroupType, number>> = {};
  expiringUnits.forEach((unit) => {
    const bg = unit.blood_group as BloodGroupType;
    groupCounts[bg] = (groupCounts[bg] || 0) + 1;
  });

  const breakdown = Object.entries(groupCounts)
    .map(([group, count]) => ({ group: group as BloodGroupType, count: count! }))
    .sort((a, b) => b.count - a.count);

  return (
    <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="font-semibold">
        {t("bb.expiryAlertTitle", `⚠ ${expiringUnits.length} Blood Unit${expiringUnits.length > 1 ? "s" : ""} Expiring Within 3 Days`)}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {breakdown.map(({ group, count }) => (
            <span key={group} className="flex items-center gap-1">
              <span className="text-sm font-medium">{count}×</span>
              <BloodGroupBadge group={group} size="sm" />
            </span>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => navigate("/app/blood-bank/inventory?expiring=true")}
        >
          {t("bb.viewExpiringUnits", "View Expiring Units")}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
