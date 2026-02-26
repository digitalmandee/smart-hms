import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDonationCampaigns } from "@/hooks/useCampaigns";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  completed: "secondary",
  paused: "outline",
  cancelled: "destructive",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  building: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  equipment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  patient_welfare: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  zakat: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  emergency: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function CampaignsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: campaigns, isLoading } = useDonationCampaigns();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.campaigns")}
        description={t("donations.campaignsDesc")}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.campaigns") },
        ]}
        actions={
          <Button onClick={() => navigate("/app/donations/campaigns/new")}>
            <Plus className="h-4 w-4 mr-2" />
            {t("donations.createCampaign")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : !campaigns?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("donations.noCampaigns")}</p>
            <p className="text-muted-foreground mb-4">{t("donations.noCampaignsDesc")}</p>
            <Button onClick={() => navigate("/app/donations/campaigns/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {t("donations.createCampaign")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = c.goal_amount > 0 ? Math.min(100, (Number(c.collected_amount) / Number(c.goal_amount)) * 100) : 0;
            return (
              <Card
                key={c.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/app/donations/campaigns/${c.id}`)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight">{c.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    </div>
                    <Badge variant={STATUS_COLORS[c.status] || "outline"} className="ml-2 shrink-0">
                      {t(`donations.campaignStatus.${c.status}` as any)}
                    </Badge>
                  </div>

                  <div>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[c.category] || CATEGORY_COLORS.general}`}>
                      {t(`donations.campaignCategory.${c.category}` as any)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("donations.campaignProgress")}</span>
                      <span className="font-medium">{pct.toFixed(0)}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">PKR {Number(c.collected_amount).toLocaleString()}</span>
                      <span className="text-muted-foreground">/ PKR {Number(c.goal_amount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {c.donor_count} {t("donations.donors").toLowerCase()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(c.start_date), "MMM dd, yyyy")}
                      {c.end_date && ` - ${format(new Date(c.end_date), "MMM dd, yyyy")}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
