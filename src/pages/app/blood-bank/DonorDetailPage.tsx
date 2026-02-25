import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Edit, Droplets, User, Phone, Mail, MapPin,
  Calendar, Clock, CheckCircle, AlertTriangle, Printer
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { useBloodDonor, useBloodDonations, type DonorStatus } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";

const statusConfig: Record<DonorStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  deferred: { label: "Deferred", variant: "secondary" },
  permanently_deferred: { label: "Permanently Deferred", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

const MIN_DONATION_GAP_DAYS = 56;

export default function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: donor, isLoading } = useBloodDonor(id || "");
  const { data: donations } = useBloodDonations({ donorId: id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Donor Profile" />
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
        <PageHeader title="Donor Profile" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Donor not found</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/app/blood-bank/donors")}>
              Back to Donors
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={donorName}
        description={`Donor #${donor.donor_number}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/app/blood-bank/donors")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={() => navigate(`/app/blood-bank/donors/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Link to="/app/blood-bank/donor-cards">
              <Button variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print Card
              </Button>
            </Link>
            {isEligible && (
              <Button onClick={() => navigate("/app/blood-bank/donations/new")}>
                <Droplets className="h-4 w-4 mr-2" />
                Start Donation
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
                  Donor Information
                </CardTitle>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <BloodGroupBadge group={donor.blood_group} size="lg" showIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{donor.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{format(parseISO(donor.date_of_birth), "MMMM dd, yyyy")}</p>
                </div>
                {donor.weight_kg && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{donor.weight_kg} kg</p>
                  </div>
                )}
                {donor.hemoglobin_level && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Hemoglobin</p>
                    <p className="font-medium">{donor.hemoglobin_level} g/dL</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="font-medium">{donor.total_donations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
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

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Donation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations && donations.length > 0 ? (
                <div className="space-y-3">
                  {donations.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/app/blood-bank/donations/${d.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Droplets className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{d.donation_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(d.donation_date), "MMM dd, yyyy")}
                            {d.volume_collected_ml ? ` • ${d.volume_collected_ml} ml` : ""}
                          </p>
                        </div>
                      </div>
                      <DonationStatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No donations recorded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEligible ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Eligible to Donate</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {donor.status !== "active" ? statusInfo.label : "Not Yet Eligible"}
                  </span>
                </div>
              )}

              {donor.last_donation_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Donation</p>
                  <p className="font-medium">{format(parseISO(donor.last_donation_date), "MMM dd, yyyy")}</p>
                  <p className="text-xs text-muted-foreground">{daysSinceLastDonation} days ago</p>
                </div>
              )}

              {donor.deferral_reason && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deferral Reason</p>
                  <p className="text-sm">{donor.deferral_reason}</p>
                </div>
              )}

              {donor.deferral_until && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Deferred Until</p>
                  <p className="font-medium">{format(parseISO(donor.deferral_until), "MMM dd, yyyy")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Donations</span>
                <span className="font-bold text-lg">{donor.total_donations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Consent</span>
                <Badge variant={donor.consent_given ? "default" : "destructive"}>
                  {donor.consent_given ? "Given" : "Not Given"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Registered</span>
                <span className="text-sm">{format(parseISO(donor.created_at), "MMM yyyy")}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
