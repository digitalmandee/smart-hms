import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Droplets, CheckCircle, XCircle, ExternalLink, Beaker } from "lucide-react";
import { format } from "date-fns";
import { useBloodDonations, useUpdateDonation, type DonationStatus, type BloodComponentType } from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { DonationStatusBadge } from "@/components/blood-bank/DonationStatusBadge";
import { useBBT } from "@/lib/blood-bank/i18n";

const statusWorkflow: DonationStatus[] = ["screening", "collecting", "processing", "completed"];
const COMPONENTS: BloodComponentType[] = ["whole_blood", "packed_rbc", "fresh_frozen_plasma", "platelet_concentrate", "cryoprecipitate"] as BloodComponentType[];

export default function DonationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tt, rtl } = useBBT();
  const { data: donations, isLoading } = useBloodDonations();
  const updateDonation = useUpdateDonation();
  const [components, setComponents] = useState<BloodComponentType[]>(["packed_rbc", "fresh_frozen_plasma"] as BloodComponentType[]);
  const donation: any = donations?.find((d) => d.id === id);
  const row = rtl ? "flex-row-reverse" : "";

  if (isLoading) return <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;
  if (!donation) {
    return (
      <Card><CardContent className="p-6 text-center">
        <p className="text-muted-foreground">{tt("notFound")}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/app/blood-bank/donations")}>{tt("backToDonations")}</Button>
      </CardContent></Card>
    );
  }

  const idx = statusWorkflow.indexOf(donation.status);
  const nextStatus = idx >= 0 && idx < statusWorkflow.length - 1 ? statusWorkflow[idx + 1] : null;
  const donorName = donation.donor ? `${donation.donor.first_name} ${donation.donor.last_name || ""}` : "-";
  const move = (status: DonationStatus) =>
    updateDonation.mutateAsync({ id: donation.id, status, ...(status === "completed" ? { components } : {}) } as any);
  const info = (label: string, value: React.ReactNode) => (
    <div className={`space-y-1 ${rtl ? "text-end" : ""}`}><p className="text-sm text-muted-foreground">{label}</p><div className="font-medium">{value}</div></div>
  );

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={donation.donation_number} description={donorName}
        actions={<Button variant="outline" onClick={() => navigate("/app/blood-bank/donations")}><ArrowLeft className="h-4 w-4 me-2" />{tt("back")}</Button>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><div className={`flex items-center justify-between ${row}`}><CardTitle>{tt("donationDetails")}</CardTitle><DonationStatusBadge status={donation.status} /></div></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {info(tt("bloodGroup"), donation.donor?.blood_group ? <BloodGroupBadge group={donation.donor.blood_group} size="lg" showIcon /> : "-")}
              {info(tt("donationType"), donation.donation_type ? tt(`t_${donation.donation_type}`) : "-")}
              {info(tt("donationDate"), format(new Date(donation.donation_date), "dd MMM yyyy"))}
              {info(tt("donationTime"), donation.donation_time || "-")}
              {donation.hemoglobin_level != null && info(tt("hb"), donation.hemoglobin_level)}
              {donation.bag_number && info(tt("bagNumber"), donation.bag_number)}
              {donation.volume_ml != null && info(tt("volume"), donation.volume_ml)}
              {info(tt("eligibility"), donation.eligibility_passed === false
                ? <Badge variant="destructive">{tt("failed")}</Badge>
                : <Badge><CheckCircle className="h-3 w-3 me-1" />{tt("passed")}</Badge>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className={`flex items-center gap-2 ${row}`}><Beaker className="h-5 w-5" />{tt("workflow")}</CardTitle></CardHeader>
            <CardContent>
              <div className={`flex items-center justify-between ${row}`}>
                {statusWorkflow.map((s, i) => {
                  const done = i < idx || donation.status === "completed";
                  const cur = s === donation.status;
                  return (
                    <div key={s} className="flex flex-col items-center flex-1">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-primary text-primary-foreground" : cur ? "bg-primary/20 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"}`}>
                        {done ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <p className={`text-xs mt-1 ${cur ? "font-medium" : "text-muted-foreground"}`}>{tt(`s_${s}`)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {nextStatus === "completed" && (
            <Card>
              <CardHeader><CardTitle className={rtl ? "text-end" : ""}>{tt("prepareComponents")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-sm text-muted-foreground ${rtl ? "text-end" : ""}`}>{tt("prepareDesc")}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {COMPONENTS.map((c) => (
                    <label key={c} className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer ${row}`}>
                      <Checkbox checked={components.includes(c)}
                        onCheckedChange={(v) => setComponents((cs) => v !== true ? cs.filter((x) => x !== c) : c === "whole_blood" ? [c] : [...cs.filter((x) => x !== "whole_blood" && x !== c), c])} />
                      <span className="text-sm">{tt(`c_${c}`)}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className={`flex items-center gap-2 ${row}`}><User className="h-5 w-5" />{tt("donor")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center gap-3 ${row}`}>
                {donation.donor?.blood_group && <BloodGroupBadge group={donation.donor.blood_group} size="lg" />}
                <div className={rtl ? "text-end" : ""}><p className="font-medium">{donorName}</p><p className="text-sm text-muted-foreground">{donation.donor?.donor_number}</p></div>
              </div>
              <Link to={`/app/blood-bank/donors/${donation.donor_id}`}><Button variant="outline" size="sm" className="w-full"><ExternalLink className="h-3 w-3 me-2" />{tt("viewDonor")}</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className={rtl ? "text-end" : ""}>{tt("actions")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {nextStatus && (
                <Button className="w-full" onClick={() => move(nextStatus)} disabled={updateDonation.isPending || (nextStatus === "completed" && components.length === 0)}>
                  <Droplets className="h-4 w-4 me-2" />{nextStatus === "completed" ? tt("completeAndSplit") : `${tt("moveTo")} ${tt(`s_${nextStatus}`)}`}
                </Button>
              )}
              {donation.status !== "completed" && donation.status !== "rejected" && (
                <Button variant="destructive" className="w-full" onClick={() => move("rejected" as DonationStatus)} disabled={updateDonation.isPending}>
                  <XCircle className="h-4 w-4 me-2" />{tt("reject")}
                </Button>
              )}
              {donation.status === "completed" && (
                <Link to="/app/blood-bank/inventory" className="block"><Button variant="outline" className="w-full"><Droplets className="h-4 w-4 me-2" />{tt("viewInventory")}</Button></Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
