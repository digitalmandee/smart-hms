import { PageHeader } from "@/components/PageHeader";
import { ModernStatsCard } from "@/components/ModernStatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTranslation } from "@/lib/i18n";
import { Droplets, Package, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  LineChart, Line, Legend, ResponsiveContainer, Tooltip,
} from "recharts";

// Seed data — replace with real queries from useBloodBank hooks later
const SEED_DATA = {
  monthly: [
    { month: "Mar", collected: 120, consumed: 98 },
    { month: "Apr", collected: 135, consumed: 110 },
    { month: "May", collected: 115, consumed: 105 },
    { month: "Jun", collected: 142, consumed: 118 },
    { month: "Jul", collected: 128, consumed: 122 },
    { month: "Aug", collected: 150, consumed: 130 },
    { month: "Sep", collected: 138, consumed: 115 },
    { month: "Oct", collected: 160, consumed: 140 },
    { month: "Nov", collected: 145, consumed: 125 },
    { month: "Dec", collected: 132, consumed: 120 },
    { month: "Jan", collected: 155, consumed: 128 },
    { month: "Feb", collected: 147, consumed: 112 },
  ],
  bloodGroups: [
    { name: "O+", value: 350, color: "hsl(0, 72%, 51%)" },
    { name: "A+", value: 250, color: "hsl(217, 91%, 60%)" },
    { name: "B+", value: 200, color: "hsl(142, 71%, 45%)" },
    { name: "AB+", value: 80, color: "hsl(270, 70%, 60%)" },
    { name: "O-", value: 60, color: "hsl(0, 84%, 60%)" },
    { name: "A-", value: 35, color: "hsl(217, 70%, 50%)" },
    { name: "B-", value: 25, color: "hsl(142, 50%, 40%)" },
    { name: "AB-", value: 15, color: "hsl(270, 50%, 50%)" },
  ],
  trends: [
    { month: "Mar", completed: 110, rejected: 10 },
    { month: "Apr", completed: 125, rejected: 10 },
    { month: "May", completed: 100, rejected: 15 },
    { month: "Jun", completed: 130, rejected: 12 },
    { month: "Jul", completed: 118, rejected: 10 },
    { month: "Aug", completed: 140, rejected: 10 },
    { month: "Sep", completed: 128, rejected: 10 },
    { month: "Oct", completed: 148, rejected: 12 },
    { month: "Nov", completed: 135, rejected: 10 },
    { month: "Dec", completed: 122, rejected: 10 },
    { month: "Jan", completed: 145, rejected: 10 },
    { month: "Feb", completed: 138, rejected: 9 },
  ],
  components: [
    { name: "Whole Blood", volume: 420 },
    { name: "Packed RBC", volume: 310 },
    { name: "FFP", volume: 185 },
    { name: "Platelets", volume: 120 },
    { name: "Cryo", volume: 55 },
  ],
};

const barChartConfig = {
  collected: { label: "Collected", color: "hsl(142, 71%, 45%)" },
  consumed: { label: "Consumed", color: "hsl(0, 72%, 51%)" },
};

const lineChartConfig = {
  completed: { label: "Completed", color: "hsl(142, 71%, 45%)" },
  rejected: { label: "Rejected", color: "hsl(0, 72%, 51%)" },
};

const componentChartConfig = {
  volume: { label: "Volume (units)", color: "hsl(var(--primary))" },
};

export default function BloodBankAnalyticsPage() {
  const { t } = useTranslation();

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
          value={147}
          icon={Package}
          variant="success"
          trend={{ value: 12, isPositive: true }}
          description="vs last month"
        />
        <ModernStatsCard
          title={t("bb.totalConsumed")}
          value={112}
          icon={Droplets}
          variant="destructive"
          trend={{ value: 5, isPositive: true }}
        />
        <ModernStatsCard
          title={t("bb.collectionRate")}
          value="+12%"
          icon={TrendingUp}
          variant="primary"
        />
        <ModernStatsCard
          title={t("bb.wastageRate")}
          value="3.2%"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection vs Consumption */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("bb.monthlyCollectionVsConsumption")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <BarChart data={SEED_DATA.monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("bb.bloodGroupDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SEED_DATA.bloodGroups}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {SEED_DATA.bloodGroups.map((entry, index) => (
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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("bb.donationTrends")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[300px] w-full">
              <LineChart data={SEED_DATA.trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

        {/* Component Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("bb.componentBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={componentChartConfig} className="h-[300px] w-full">
              <BarChart data={SEED_DATA.components} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="volume" fill="var(--color-volume)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
