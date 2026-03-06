import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNphiesStats, useNphiesConfig } from "@/hooks/useNphiesConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import {
  CloudUpload,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ArrowRight,
  Settings,
  Activity,
} from "lucide-react";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function NphiesDashboardCard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { data: nphiesConfig } = useNphiesConfig();
  const { data: stats, isLoading } = useNphiesStats(profile?.organization_id || undefined);

  if (!nphiesConfig?.nphies_enabled) return null;

  const chartData = stats
    ? [
        { name: t("nphies.claimAccepted" as any, "Approved"), value: stats.approved, fill: CHART_COLORS[0] },
        { name: t("nphies.claimRejected" as any, "Rejected"), value: stats.rejected, fill: CHART_COLORS[1] },
        { name: t("nphies.pendingReview" as any, "Pending"), value: stats.pending, fill: CHART_COLORS[2] },
        { name: t("nphies.partiallyApproved" as any, "Partial"), value: stats.partiallyApproved, fill: CHART_COLORS[3] },
      ].filter((d) => d.value > 0)
    : [];

  const chartConfig = {
    approved: { label: t("nphies.claimAccepted" as any, "Approved"), color: CHART_COLORS[0] },
    rejected: { label: t("nphies.claimRejected" as any, "Rejected"), color: CHART_COLORS[1] },
    pending: { label: t("nphies.pendingReview" as any, "Pending"), color: CHART_COLORS[2] },
    partial: { label: t("nphies.partiallyApproved" as any, "Partial"), color: CHART_COLORS[3] },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CloudUpload className="h-5 w-5 text-primary" />
          {t("nphies.dashboardTitle" as any, "NPHIES Insurance")}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/insurance/nphies/settings")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !stats ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            {t("common.loading")}
          </div>
        ) : stats.total === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            {t("nphies.noClaimsYet" as any, "No NPHIES claims submitted yet")}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <CheckCircle className="h-4 w-4 text-chart-1" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("nphies.claimAccepted" as any, "Approved")}</p>
                  <p className="font-semibold">{stats.approved}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <XCircle className="h-4 w-4 text-chart-2" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("nphies.claimRejected" as any, "Rejected")}</p>
                  <p className="font-semibold">{stats.rejected}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-chart-3" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("nphies.pendingReview" as any, "Pending")}</p>
                  <p className="font-semibold">{stats.pending}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Activity className="h-4 w-4 text-chart-4" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("nphies.eligibilityChecks" as any, "Eligibility (30d)")}</p>
                  <p className="font-semibold">{stats.eligibilityChecks}</p>
                </div>
              </div>
            </div>

            {/* Pie chart */}
            {chartData.length > 0 && (
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            )}

            {/* Total approved */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">{t("nphies.totalApproved" as any, "Total Approved")}</span>
              </div>
              <span className="font-bold text-primary">
                SAR {stats.totalApprovedAmount.toLocaleString()}
              </span>
            </div>
          </>
        )}

        {/* Quick actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate("/app/insurance/claims")}
          >
            {t("nphies.viewClaims" as any, "View Claims")}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate("/app/insurance/nphies/analytics")}
          >
            {t("nphiesAnalytics.viewAnalytics" as any, "Analytics")}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
