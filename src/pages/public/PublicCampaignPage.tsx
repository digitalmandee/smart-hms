import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Users, CalendarDays, Target } from "lucide-react";
import { differenceInDays, format } from "date-fns";

export default function PublicCampaignPage() {
  const { orgSlug, campaignNumber } = useParams<{ orgSlug: string; campaignNumber: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-campaign", orgSlug, campaignNumber],
    queryFn: async () => {
      // Get org by slug
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .select("id, name, logo_url, phone, email, address")
        .eq("slug", orgSlug!)
        .single();
      if (orgErr) throw orgErr;

      // Get campaign
      const { data: campaign, error: campErr } = await supabase
        .from("donation_campaigns" as any)
        .select("*")
        .eq("organization_id", org.id)
        .eq("campaign_number", campaignNumber!)
        .single();
      if (campErr) throw campErr;

      return { org, campaign: campaign as any };
    },
    enabled: !!orgSlug && !!campaignNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold">Campaign not found</h1>
          <p className="text-muted-foreground">This campaign may have ended or the link is invalid.</p>
        </div>
      </div>
    );
  }

  const { org, campaign } = data;
  const pct = campaign.goal_amount > 0
    ? Math.min(100, (Number(campaign.collected_amount) / Number(campaign.goal_amount)) * 100)
    : 0;
  const daysRemaining = campaign.end_date
    ? Math.max(0, differenceInDays(new Date(campaign.end_date), new Date()))
    : null;

  const categoryLabels: Record<string, string> = {
    general: "General",
    building: "Building",
    equipment: "Equipment",
    patient_welfare: "Patient Welfare",
    zakat: "Zakat",
    emergency: "Emergency",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Org Header */}
      <div className="bg-card border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="h-10 w-10 rounded-md object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{org.name}</p>
            <p className="text-xs text-muted-foreground">Fundraising Campaign</p>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{categoryLabels[campaign.category] || campaign.category}</Badge>
            {campaign.status !== "active" && (
              <Badge variant="secondary">{campaign.status}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          {campaign.title_ar && (
            <p className="text-lg text-muted-foreground font-medium" dir="rtl">{campaign.title_ar}</p>
          )}
          {campaign.description && (
            <p className="text-muted-foreground">{campaign.description}</p>
          )}
        </div>

        {/* Progress Card */}
        <div className="bg-card rounded-xl border p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-bold text-primary">{pct.toFixed(1)}%</span>
            </div>
            <Progress value={pct} className="h-4" />
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-primary">PKR {Number(campaign.collected_amount).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">raised of PKR {Number(campaign.goal_amount).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-lg border p-3 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{campaign.donor_count}</p>
            <p className="text-xs text-muted-foreground">Donors</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <CalendarDays className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">{daysRemaining !== null ? daysRemaining : "∞"}</p>
            <p className="text-xs text-muted-foreground">Days Left</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <Target className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold">PKR {Number(campaign.goal_amount).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Goal</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-card rounded-lg border p-4 text-sm text-muted-foreground">
          <p>Started: {format(new Date(campaign.start_date), "dd MMM yyyy")}</p>
          {campaign.end_date && <p>Ends: {format(new Date(campaign.end_date), "dd MMM yyyy")}</p>}
        </div>

        {/* Support message */}
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">Your contribution makes a difference ❤️</p>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-muted-foreground space-y-1">
          <p>{org.name}</p>
          {org.phone && <p>{org.phone}</p>}
          {org.email && <p>{org.email}</p>}
        </div>
      </div>
    </div>
  );
}
