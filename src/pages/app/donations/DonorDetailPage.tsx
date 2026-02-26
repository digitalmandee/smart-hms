import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Edit, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useFinancialDonor, useFinancialDonations, useRecurringSchedules } from "@/hooks/useDonations";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={donor.name}
        description={`${donor.donor_number} · ${t(`donations.donorType.${donor.donor_type}` as any)}`}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.donors"), href: "/app/donations/donors" },
          { label: donor.name },
        ]}
        actions={
          <Button onClick={() => navigate(`/app/donations/donors/${id}/edit`)} variant="outline">
            <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Donor Info */}
        <Card>
          <CardHeader><CardTitle>{t("donations.donorInfo")}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {donor.name_ar && <p dir="rtl" className="text-lg font-semibold">{donor.name_ar}</p>}
            {donor.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{donor.phone}</div>}
            {donor.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{donor.email}</div>}
            {donor.cnic_passport && <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" />{donor.cnic_passport}</div>}
            {(donor.address || donor.city) && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{[donor.address, donor.city, donor.country].filter(Boolean).join(", ")}</div>}
            {donor.contact_person && <p>{t("donations.contactPerson")}: {donor.contact_person}</p>}
            {donor.notes && <p className="text-muted-foreground">{donor.notes}</p>}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader><CardTitle>{t("donations.summary")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">PKR {Number(donor.total_donated).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{t("donations.totalDonated")}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{donor.total_donations_count}</p>
              <p className="text-sm text-muted-foreground">{t("donations.totalDonationsCount")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Schedules */}
        <Card>
          <CardHeader><CardTitle>{t("donations.recurringSchedules")}</CardTitle></CardHeader>
          <CardContent>
            {!donorSchedules?.length ? (
              <p className="text-muted-foreground text-sm">{t("donations.noRecurringSchedules")}</p>
            ) : (
              <div className="space-y-3">
                {donorSchedules.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg border">
                    <div className="flex justify-between">
                      <span className="font-medium">PKR {Number(s.amount).toLocaleString()}/{t(`donations.frequency.${s.frequency}` as any)}</span>
                      <Badge variant={s.is_active ? "default" : "secondary"}>{s.is_active ? t("donations.active") : t("donations.inactive")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("donations.nextDue")}: {format(new Date(s.next_due_date), "dd MMM yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <Card>
        <CardHeader><CardTitle>{t("donations.donationHistory")}</CardTitle></CardHeader>
        <CardContent>
          {!donations?.length ? (
            <p className="text-muted-foreground text-center py-8">{t("donations.noDonationsYet")}</p>
          ) : (
            <div className="space-y-2">
              {donations.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/app/donations/receipt/${d.id}`)}>
                  <div className="flex items-center gap-3">
                    <Heart className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{d.donation_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(d.donation_date), "dd MMM yyyy")} · {t(`donations.purpose.${d.purpose}` as any)} · {t(`donations.paymentMethod.${d.payment_method}` as any)}
                      </p>
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
