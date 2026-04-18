import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCFOMetrics } from "@/hooks/useCFOMetrics";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTranslation } from "@/lib/i18n";
import { Activity, Clock, Droplet, TrendingUp, Calendar, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiProps {
  title: string;
  value: string;
  helper?: string;
  icon: React.ElementType;
  status?: "good" | "warn" | "bad" | "neutral";
}

function KpiCard({ title, value, helper, icon: Icon, status = "neutral" }: KpiProps) {
  const colorMap = {
    good: "text-green-600 bg-green-500/10",
    warn: "text-amber-600 bg-amber-500/10",
    bad: "text-destructive bg-destructive/10",
    neutral: "text-primary bg-primary/10",
  };
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
          </div>
          <div className={cn("p-2 rounded-lg", colorMap[status])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CFOKPIWidget() {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatter();
  const { data, isLoading } = useCFOMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  if (!data) return null;

  // Health thresholds
  const dsoStatus = data.dso === 0 ? "neutral" : data.dso < 30 ? "good" : data.dso < 60 ? "warn" : "bad";
  const dpoStatus = data.dpo === 0 ? "neutral" : data.dpo > 45 ? "good" : data.dpo > 30 ? "warn" : "bad";
  const crStatus = data.currentRatio === 0 ? "neutral" : data.currentRatio >= 1.5 ? "good" : data.currentRatio >= 1 ? "warn" : "bad";
  const qrStatus = data.quickRatio === 0 ? "neutral" : data.quickRatio >= 1 ? "good" : data.quickRatio >= 0.7 ? "warn" : "bad";
  const gmStatus = data.grossMarginPct === 0 ? "neutral" : data.grossMarginPct >= 40 ? "good" : data.grossMarginPct >= 20 ? "warn" : "bad";
  const runwayStatus = data.cashRunwayMonths === 0 ? "neutral" : data.cashRunwayMonths >= 6 ? "good" : data.cashRunwayMonths >= 3 ? "warn" : "bad";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          {t("cfo.kpiTitle" as any, "CFO Liquidity & Efficiency KPIs")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            title={t("cfo.dso" as any, "DSO (Days)")}
            value={String(data.dso)}
            helper={t("cfo.dsoHelper" as any, "Days Sales Outstanding")}
            icon={Clock}
            status={dsoStatus}
          />
          <KpiCard
            title={t("cfo.dpo" as any, "DPO (Days)")}
            value={String(data.dpo)}
            helper={t("cfo.dpoHelper" as any, "Days Payable Outstanding")}
            icon={Calendar}
            status={dpoStatus}
          />
          <KpiCard
            title={t("cfo.currentRatio" as any, "Current Ratio")}
            value={data.currentRatio.toFixed(2)}
            helper={t("cfo.currentRatioHelper" as any, "Current Assets / Liab.")}
            icon={Droplet}
            status={crStatus}
          />
          <KpiCard
            title={t("cfo.quickRatio" as any, "Quick Ratio")}
            value={data.quickRatio.toFixed(2)}
            helper={t("cfo.quickRatioHelper" as any, "Acid-test ratio")}
            icon={Droplet}
            status={qrStatus}
          />
          <KpiCard
            title={t("cfo.grossMargin" as any, "Gross Margin")}
            value={`${data.grossMarginPct}%`}
            helper={t("cfo.grossMarginHelper" as any, "Last 90 days")}
            icon={TrendingUp}
            status={gmStatus}
          />
          <KpiCard
            title={t("cfo.runway" as any, "Cash Runway")}
            value={`${data.cashRunwayMonths} mo`}
            helper={t("cfo.runwayHelper" as any, `Burn ${formatCurrency(data.monthlyBurn)}/mo`)}
            icon={Wallet}
            status={runwayStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
}
