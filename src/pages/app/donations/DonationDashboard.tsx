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

export default function DonationDashboard() {
  const navigate = useNavigate();
  const t = useTranslation();
  const { data: stats, isLoading: statsLoading } = useDonationStats();
  const { data: recentDonations, isLoading: donationsLoading } = useFinancialDonations();

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
      >
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
      </PageHeader>

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
