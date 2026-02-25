import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Edit, Droplets, User, Phone, Mail, MapPin,
  Calendar, CheckCircle, AlertTriangle, Printer, TrendingUp, Clock
} from "lucide-react";
import { format, parseISO, differenceInDays, differenceInMonths } from "date-fns";
import { useBloodDonor, useBloodDonations, type DonorStatus, type BloodDonation } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const statusConfig: Record<DonorStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  deferred: { label: "Deferred", variant: "secondary" },
  permanently_deferred: { label: "Permanently Deferred", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

const MIN_DONATION_GAP_DAYS = 56;

function getEligibilityColor(days: number): string {
  if (days >= 49) return "bg-green-500";
  if (days >= 28) return "bg-amber-500";
  return "bg-red-500";
}

function getTimelineDotColor(status: string): string {
  if (status === "completed") return "bg-green-500 border-green-200";
  if (status === "rejected") return "bg-red-500 border-red-200";
  return "bg-blue-500 border-blue-200";
}

export default function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: donor, isLoading } = useBloodDonor(id || "");
  const { data: donations } = useBloodDonations({ donorId: id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("bb.donorProfile", "Donor Profile")} />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("bb.donorProfile", "Donor Profile")} />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{t("bb.donorNotFound", "Donor not found")}</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/app/blood-bank/donors")}>
              {t("common.back", "Back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const donorName = `${donor.first_name} ${donor.last_name || ""}`.trim();
  const statusInfo = statusConfig[donor.status];
  const daysSinceLastDonation = donor.last_donation_date
    ? differenceInDays(new Date(), parseISO(donor.last_donation_date))
    : null;
  const isEligible = donor.status === "active" && (daysSinceLastDonation === null || daysSinceLastDonation >= MIN_DONATION_GAP_DAYS);

  // Donation stats
  const completedDonations = donations?.filter((d) => d.status === "completed") || [];
  const avgVolume = completedDonations.length > 0
    ? Math.round(completedDonations.reduce((sum, d) => sum + (d.volume_collected_ml || 0), 0) / completedDonations.length)
    : 0;
  const successRate = donations && donations.length > 0
    ? Math.round((completedDonations.length / donations.length) * 100)
    : 0;
  const tenureMonths = donations && donations.length > 0
    ? differenceInMonths(new Date(), parseISO(donations[donations.length - 1].donation_date))
    : 0;
  const donationTypes = completedDonations.map((d) => d.donation_type);
  const typeCounts: Record<string, number> = {};
  donationTypes.forEach((t) => { typeCounts[t] = (typeCounts[t] || 0) + 1; });
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const eligibilityProgress = daysSinceLastDonation !== null
    ? Math.min((daysSinceLastDonation / MIN_DONATION_GAP_DAYS) * 100, 100)
    : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title={donorName}
        description={`${t("bb.donorNumber", "Donor #")}${donor.donor_number}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/blood-bank/donors")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back", "Back")}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/app/blood-bank/donors/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit", "Edit")}
            </Button>
            <Link to="/app/blood-bank/donor-cards">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                {t("common.print", "Print")}
              </Button>
            </Link>
            {isEligible && (
              <Button onClick={() => navigate("/app/blood-bank/donations/new")}>
                <Droplets className="h-4 w-4 mr-2" />
                {t("bb.startDonation", "Start Donation")}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("bb.donorInfo", "Donor Information")}
                </CardTitle>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("bb.bloodGroup", "Blood Group")}</p>
                  <BloodGroupBadge group={donor.blood_group} size="lg" showIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("patient.gender", "Gender")}</p>
                  <p className="font-medium capitalize">{donor.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("patient.dateOfBirth", "Date of Birth")}</p>
                  <p className="font-medium">{format(parseISO(donor.date_of_birth), "MMMM dd, yyyy")}</p>
                </div>
                {donor.weight_kg && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("bb.weight", "Weight")}</p>
                    <p className="font-medium">{donor.weight_kg} kg</p>
                  </div>
                )}
                {donor.hemoglobin_level && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("bb.hemoglobin", "Hemoglobin")}</p>
                    <p className="font-medium">{donor.hemoglobin_level} g/dL</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("bb.totalDonations", "Total Donations")}</p>
                  <p className="font-medium">{donor.total_donations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bb.contactDetails", "Contact Details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{donor.phone}</span>
                </div>
                {donor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{donor.email}</span>
                  </div>
                )}
                {(donor.address || donor.city) && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{[donor.address, donor.city].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donation Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                {t("bb.donationTimeline", "Donation Timeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <div className="relative">
                  {donations.map((d, idx) => {
                    const isLast = idx === donations.length - 1;
                    const prevDonation = donations[idx + 1];
                    const dayGap = prevDonation
                      ? differenceInDays(parseISO(d.donation_date), parseISO(prevDonation.donation_date))
                      : null;

                    return (
                      <div key={d.id} className="relative flex gap-4">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full border-2 z-10 shrink-0",
                              getTimelineDotColor(d.status)
                            )}
                          />
                          {!isLast && (
                            <div className="w-0.5 bg-border flex-1 min-h-[2rem]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-6 flex-1">
                          <div
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/app/blood-bank/donations/${d.id}`)}
                          >
                            <div>
                              <p className="font-medium text-sm">{d.donation_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(d.donation_date), "MMM dd, yyyy")}
                                {d.volume_collected_ml ? ` • ${d.volume_collected_ml} ml` : ""}
                              </p>
                            </div>
                            <DonationStatusBadge status={d.status} />
                          </div>
                          {dayGap !== null && (
                            <p className="text-xs text-muted-foreground mt-1 ms-3">
                              ↕ {dayGap} {t("bb.daysGap", "days gap")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("bb.noDonations", "No donations recorded yet")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eligibility with Progress Bar */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bb.eligibilityStatus", "Eligibility Status")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEligible ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{t("bb.eligibleToDonate", "Eligible to Donate")}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {donor.status !== "active" ? statusInfo.label : t("bb.notYetEligible", "Not Yet Eligible")}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              {daysSinceLastDonation !== null && donor.status === "active" && (
                <div className="space-y-2">
                  <div className="relative">
                    <Progress
                      value={eligibilityProgress}
                      className="h-3"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 h-3 rounded-full transition-all",
                        getEligibilityColor(daysSinceLastDonation)
                      )}
                      style={{ width: `${eligibilityProgress}%`, opacity: 0.8 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {daysSinceLastDonation >= MIN_DONATION_GAP_DAYS
                      ? `✅ ${t("bb.eligibleDaysAgo", "Eligible!")} ${daysSinceLastDonation} ${t("bb.daysSinceLastDonation", "days since last donation")}`
                      : `${daysSinceLastDonation} ${t("bb.ofDaysCompleted", `of ${MIN_DONATION_GAP_DAYS} days completed`)}`}
                  </p>
                </div>
              )}

              {donor.last_donation_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("bb.lastDonation", "Last Donation")}</p>
                  <p className="font-medium">{format(parseISO(donor.last_donation_date), "MMM dd, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{daysSinceLastDonation} {t("bb.daysAgo", "days ago")}</p>
                </div>
              )}

              {donor.deferral_reason && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("bb.deferralReason", "Deferral Reason")}</p>
                  <p className="text-sm">{donor.deferral_reason}</p>
                </div>
              )}

              {donor.deferral_until && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("bb.deferredUntil", "Deferred Until")}</p>
                  <p className="font-medium">{format(parseISO(donor.deferral_until), "MMM dd, yyyy")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("bb.donationStats", "Donation Stats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.avgVolume", "Avg Volume")}</span>
                <span className="font-bold">{avgVolume > 0 ? `${avgVolume} ml` : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.commonType", "Common Type")}</span>
                <span className="font-medium capitalize">{mostCommonType.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.tenure", "Tenure")}</span>
                <span className="font-medium">{tenureMonths > 0 ? `${tenureMonths} ${t("bb.months", "months")}` : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.successRate", "Success Rate")}</span>
                <span className="font-bold text-green-600">{successRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bb.quickStats", "Quick Stats")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.totalDonations", "Total Donations")}</span>
                <span className="font-bold text-lg">{donor.total_donations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.consent", "Consent")}</span>
                <Badge variant={donor.consent_given ? "default" : "destructive"}>
                  {donor.consent_given ? t("bb.given", "Given") : t("bb.notGiven", "Not Given")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("bb.registered", "Registered")}</span>
                <span className="text-sm">{format(parseISO(donor.created_at), "MMM yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
