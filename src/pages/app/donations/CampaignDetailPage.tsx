import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Users, TrendingUp, CalendarDays, Edit, Pause, CheckCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDonationCampaign, useCampaignDonations, useUpdateCampaign } from "@/hooks/useCampaigns";
import { useTranslation } from "@/lib/i18n";
import { format, differenceInDays } from "date-fns";

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: campaign, isLoading } = useDonationCampaign(id!);
  const { data: donations, isLoading: donationsLoading } = useCampaignDonations(id!);
  const updateCampaign = useUpdateCampaign();

  if (isLoading) return <div className="space-y-4 p-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  if (!campaign) return <p className="p-6 text-muted-foreground">Campaign not found</p>;

  const pct = campaign.goal_amount > 0 ? Math.min(100, (Number(campaign.collected_amount) / Number(campaign.goal_amount)) * 100) : 0;
  const daysRemaining = campaign.end_date ? Math.max(0, differenceInDays(new Date(campaign.end_date), new Date())) : null;
  const avgDonation = donations?.length ? Number(campaign.collected_amount) / donations.filter(d => d.status === 'received').length : 0;

  const handleStatusChange = (status: string) => {
    updateCampaign.mutate({ id: campaign.id, status });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={campaign.title}
        description={campaign.description || ""}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.campaigns"), href: "/app/donations/campaigns" },
          { label: campaign.title },
        ]}
        actions={
          <div className="flex gap-2">
            {campaign.status === "active" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("paused")}>
                <Pause className="h-4 w-4 mr-1" /> {t("donations.campaignStatus.paused")}
              </Button>
            )}
            {campaign.status === "paused" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("active")}>
                <CheckCircle className="h-4 w-4 mr-1" /> {t("donations.campaignStatus.active")}
              </Button>
            )}
            {campaign.status === "active" && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange("completed")}>
                <CheckCircle className="h-4 w-4 mr-1" /> {t("donations.campaignStatus.completed")}
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/app/donations/campaigns/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-1" /> {t("common.edit")}
            </Button>
          </div>
        }
      />

      {/* Progress */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
              {t(`donations.campaignStatus.${campaign.status}` as any)}
            </Badge>
            <Badge variant="outline">
              {t(`donations.campaignCategory.${campaign.category}` as any)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("donations.campaignProgress")}</span>
              <span className="font-bold">{pct.toFixed(1)}%</span>
            </div>
            <Progress value={pct} className="h-4" />
            <div className="flex justify-between">
              <span className="text-xl font-bold text-primary">PKR {Number(campaign.collected_amount).toLocaleString()}</span>
              <span className="text-muted-foreground">{t("donations.campaignGoal")}: PKR {Number(campaign.goal_amount).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: t("donations.donors"), value: campaign.donor_count, icon: Users },
          { label: t("donations.averageDonation"), value: `PKR ${Math.round(avgDonation).toLocaleString()}`, icon: TrendingUp },
          { label: t("donations.campaignDaysLeft"), value: daysRemaining !== null ? `${daysRemaining} ${t("common.left")}` : "∞", icon: CalendarDays },
          { label: t("donations.totalDonationsCount"), value: donations?.filter(d => d.status === 'received').length || 0, icon: Heart },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donations List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("donations.donationHistory")}</CardTitle>
          <Button size="sm" onClick={() => navigate("/app/donations/record")}>
            <Heart className="h-4 w-4 mr-1" /> {t("donations.recordDonation")}
          </Button>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !donations?.length ? (
            <p className="text-center text-muted-foreground py-8">{t("donations.noDonationsYet")}</p>
          ) : (
            <div className="space-y-3">
              {donations.map((d) => (
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
                    <Badge variant={d.status === "received" ? "default" : "secondary"} className="text-xs">
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
