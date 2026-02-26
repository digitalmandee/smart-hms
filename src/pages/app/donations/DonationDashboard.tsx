import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, CalendarClock, TrendingUp, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDonationStats, useFinancialDonations } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { useMemo } from "react";

export default function DonationDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useDonationStats();
  const { data: recentDonations, isLoading: donationsLoading } = useFinancialDonations();

  // Purpose breakdown chart data
  const purposeData = useMemo(() => {
    if (!recentDonations) return [];
    const map: Record<string, number> = {};
    recentDonations.filter(d => d.status === "received").forEach(d => {
      const key = d.purpose || "general";
      map[key] = (map[key] || 0) + Number(d.amount);
    });
    return Object.entries(map).map(([purpose, amount]) => ({
      purpose: t(`donations.purpose.${purpose}` as any),
      amount,
    })).sort((a, b) => b.amount - a.amount);
  }, [recentDonations, t]);

  // Monthly trend chart data
  const monthlyData = useMemo(() => {
    if (!recentDonations) return [];
    const map: Record<string, number> = {};
    recentDonations.filter(d => d.status === "received").forEach(d => {
      const month = format(new Date(d.donation_date), "yyyy-MM");
      map[month] = (map[month] || 0) + Number(d.amount);
    });
    return Object.entries(map).sort().slice(-12).map(([month, amount]) => ({
      month: format(new Date(month + "-01"), "MMM yy"),
      amount,
    }));
  }, [recentDonations]);

  const cards = [
    { label: t("donations.totalReceived"), value: `PKR ${(stats?.totalReceived || 0).toLocaleString()}`, icon: Heart, color: "text-green-600" },
    { label: t("donations.thisMonth"), value: `PKR ${(stats?.thisMonth || 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-600" },
    { label: t("donations.pendingPledges"), value: `PKR ${(stats?.pendingPledges || 0).toLocaleString()}`, icon: FilePlus, color: "text-amber-600" },
    { label: t("donations.activeRecurring"), value: stats?.activeRecurring || 0, icon: CalendarClock, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.dashboard")}
        description={t("donations.dashboardDesc")}
        breadcrumbs={[{ label: t("donations.title") }, { label: t("nav.dashboard") }]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate("/app/donations/donors/new")} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              {t("donations.addDonor")}
            </Button>
            <Button onClick={() => navigate("/app/donations/record")}>
              <FilePlus className="h-4 w-4 mr-2" />
              {t("donations.recordDonation")}
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Purpose Breakdown */}
        <Card>
          <CardHeader><CardTitle>{t("donations.purposeBreakdown")}</CardTitle></CardHeader>
          <CardContent>
            {!purposeData.length ? (
              <p className="text-muted-foreground text-center py-8">{t("donations.noDonationsYet")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={purposeData}>
                  <XAxis dataKey="purpose" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`PKR ${v.toLocaleString()}`, t("donations.amount")]} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader><CardTitle>{t("donations.monthlyTrend")}</CardTitle></CardHeader>
          <CardContent>
            {!monthlyData.length ? (
              <p className="text-muted-foreground text-center py-8">{t("donations.noDonationsYet")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`PKR ${v.toLocaleString()}`, t("donations.amount")]} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>{t("donations.recentDonations")}</CardTitle>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !recentDonations?.length ? (
            <p className="text-muted-foreground text-center py-8">{t("donations.noDonationsYet")}</p>
          ) : (
            <div className="space-y-3">
              {recentDonations.slice(0, 10).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/app/donations/receipt/${d.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{d.financial_donors?.name || "Anonymous"}</p>
                      <p className="text-sm text-muted-foreground">{d.donation_number} · {format(new Date(d.donation_date), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">PKR {Number(d.amount).toLocaleString()}</p>
                    <Badge variant={d.status === "received" ? "default" : d.status === "pledged" ? "secondary" : "outline"} className="text-xs">
                      {t(`donations.status.${d.status}` as any)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
