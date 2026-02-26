import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Edit, Phone, Mail, MapPin, CreditCard, FilePlus, CalendarClock, User, Building2, TrendingUp } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFinancialDonor, useFinancialDonations, useRecurringSchedules } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

const DONOR_TYPE_ICON: Record<string, typeof User> = {
  individual: User,
  corporate: Building2,
  foundation: Heart,
  government: Building2,
  anonymous: User,
};

export default function DonorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: donor, isLoading } = useFinancialDonor(id!);
  const { data: donations } = useFinancialDonations(id);
  const { data: schedules } = useRecurringSchedules();
  const donorSchedules = schedules?.filter((s) => s.donor_id === id);

  if (isLoading) return <div className="space-y-4 p-6">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  if (!donor) return <div className="p-6 text-muted-foreground">Donor not found</div>;

  const initials = donor.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  const TypeIcon = DONOR_TYPE_ICON[donor.donor_type] || User;
  const avgDonation = donor.total_donations_count > 0 ? Number(donor.total_donated) / donor.total_donations_count : 0;
  const lastDonation = donations?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={donor.name}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.donors"), href: "/app/donations/donors" },
          { label: donor.name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/app/donations/record?donor=${id}`)} variant="outline">
              <FilePlus className="h-4 w-4 mr-2" /> {t("donations.recordDonation")}
            </Button>
            <Button onClick={() => navigate(`/app/donations/donors/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
            </Button>
          </div>
        }
      />

      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{donor.name}</h2>
                {donor.name_ar && <span dir="rtl" className="text-lg text-muted-foreground">{donor.name_ar}</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <TypeIcon className="h-3 w-3" />
                  {t(`donations.donorType.${donor.donor_type}` as any)}
                </Badge>
                <Badge variant={donor.is_active ? "default" : "outline"}>
                  {donor.is_active ? t("donations.active") : t("donations.inactive")}
                </Badge>
                <span className="text-sm text-muted-foreground">{donor.donor_number}</span>
              </div>
              {donor.contact_person && (
                <p className="text-sm text-muted-foreground">{t("donations.contactPerson")}: {donor.contact_person}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("donations.donorSince")}: {format(new Date(donor.created_at), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">PKR {Number(donor.total_donated).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("donations.totalDonated")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{donor.total_donations_count}</p>
            <p className="text-xs text-muted-foreground">{t("donations.totalDonationsCount")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">PKR {Math.round(avgDonation).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t("donations.averageDonation")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{lastDonation ? format(new Date(lastDonation.donation_date), "dd MMM yy") : "—"}</p>
            <p className="text-xs text-muted-foreground">{t("donations.lastDonation")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader><CardTitle>{t("donations.contactDetails")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {donor.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{donor.phone}</div>}
            {donor.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{donor.email}</div>}
            {donor.cnic_passport && <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" />{donor.cnic_passport}</div>}
            {(donor.address || donor.city) && (
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{[donor.address, donor.city, donor.country].filter(Boolean).join(", ")}</div>
            )}
            {!donor.phone && !donor.email && !donor.cnic_passport && !donor.address && (
              <p className="text-muted-foreground">No contact information available</p>
            )}
            {donor.notes && <p className="text-muted-foreground border-t pt-2 mt-2">{donor.notes}</p>}
          </CardContent>
        </Card>

        {/* Recurring Schedules */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>{t("donations.recurringSchedules")}</CardTitle></CardHeader>
          <CardContent>
            {!donorSchedules?.length ? (
              <p className="text-muted-foreground text-sm">{t("donations.noRecurringSchedules")}</p>
            ) : (
              <div className="space-y-3">
                {donorSchedules.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      <div>
                        <span className="font-medium">PKR {Number(s.amount).toLocaleString()}/{t(`donations.frequency.${s.frequency}` as any)}</span>
                        {s.purpose && <span className="text-sm text-muted-foreground ml-2">· {t(`donations.purpose.${s.purpose}` as any)}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? t("donations.active") : t("donations.inactive")}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("donations.nextDue")}: {format(new Date(s.next_due_date), "dd MMM yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donation Timeline */}
      <Card>
        <CardHeader><CardTitle>{t("donations.donationHistory")}</CardTitle></CardHeader>
        <CardContent>
          {!donations?.length ? (
            <p className="text-muted-foreground text-center py-8">{t("donations.noDonationsYet")}</p>
          ) : (
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
              {donations.map((d) => (
                <div key={d.id} className="relative flex items-start gap-4 cursor-pointer hover:bg-muted/50 p-3 rounded-lg -ml-6 pl-6"
                  onClick={() => navigate(`/app/donations/receipt/${d.id}`)}>
                  <div className="absolute left-0 top-5 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary" />
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{d.donation_number}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="text-sm text-muted-foreground">{format(new Date(d.donation_date), "dd MMM yyyy")}</span>
                        <Badge variant="outline" className="text-xs">{t(`donations.purpose.${d.purpose}` as any)}</Badge>
                        <Badge variant="outline" className="text-xs">{t(`donations.paymentMethod.${d.payment_method}` as any)}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">PKR {Number(d.amount).toLocaleString()}</p>
                      <Badge variant={d.status === "received" ? "default" : "secondary"} className="text-xs">
                        {t(`donations.status.${d.status}` as any)}
                      </Badge>
                    </div>
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
