import { PageHeader } from "@/components/PageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useBloodBankAnalytics } from "@/hooks/useBloodBank";
import { Droplets, Package, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  LineChart, Line, Legend, ResponsiveContainer, Tooltip,
} from "recharts";

const barChartConfig = {
  collected: { label: "Collected", color: "hsl(142, 71%, 45%)" },
  consumed: { label: "Consumed", color: "hsl(0, 72%, 51%)" },
};

const lineChartConfig = {
  completed: { label: "Completed", color: "hsl(142, 71%, 45%)" },
  rejected: { label: "Rejected", color: "hsl(0, 72%, 51%)" },
};

const componentChartConfig = {
  volume: { label: "Units", color: "hsl(var(--primary))" },
};

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-48" /></CardHeader>
      <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
    </Card>
  );
}

export default function BloodBankAnalyticsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useBloodBankAnalytics();

  const noData = !isLoading && (!data || data.bloodGroups.length === 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bb.analytics")}
        breadcrumbs={[
          { label: "Blood Bank", href: "/app/blood-bank" },
          { label: t("bb.analytics") },
        ]}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernStatsCard
          title={t("bb.totalCollections")}
          value={isLoading ? "..." : data?.stats.totalCollections ?? 0}
          icon={Package}
          variant="success"
          trend={data?.stats.collectionTrend ? { value: Math.abs(data.stats.collectionTrend), isPositive: data.stats.collectionTrend > 0 } : undefined}
          description={t("bb.vsLastMonth")}
          loading={isLoading}
        />
        <ModernStatsCard
          title={t("bb.totalConsumed")}
          value={isLoading ? "..." : data?.stats.totalConsumed ?? 0}
          icon={Droplets}
          variant="destructive"
          loading={isLoading}
        />
        <ModernStatsCard
          title={t("bb.collectionRate")}
          value={isLoading ? "..." : `${data?.stats.collectionTrend ?? 0}%`}
          icon={TrendingUp}
          variant="primary"
          loading={isLoading}
        />
        <ModernStatsCard
          title={t("bb.wastageRate")}
          value={isLoading ? "..." : `${data?.stats.wastageRate ?? 0}%`}
          icon={AlertTriangle}
          variant="warning"
          loading={isLoading}
        />
      </div>

      {noData && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("bb.noAnalyticsData")}
          </CardContent>
        </Card>
      )}

      {!noData && (
        <>
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? <ChartSkeleton /> : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("bb.monthlyCollectionVsConsumption")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                    <BarChart data={data!.monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="collected" fill="var(--color-collected)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="consumed" fill="var(--color-consumed)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {isLoading ? <ChartSkeleton /> : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("bb.bloodGroupDistribution")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data!.bloodGroups}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data!.bloodGroups.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? <ChartSkeleton /> : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("bb.donationTrends")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
                    <LineChart data={data!.trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="rejected" stroke="var(--color-rejected)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {isLoading ? <ChartSkeleton /> : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("bb.componentBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={componentChartConfig} className="h-[300px] w-full">
                    <BarChart data={data!.components} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="volume" fill="var(--color-volume)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
