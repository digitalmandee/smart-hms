import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialDonors, useCreateDonation } from "@/hooks/useDonations";
import { useDonationCampaigns } from "@/hooks/useCampaigns";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

const PURPOSES = ["general", "building_fund", "equipment", "patient_welfare", "zakat", "sadaqah", "fitrana", "other"];
const PAYMENT_METHODS = ["cash", "bank_transfer", "cheque", "online", "mobile_wallet"];
const DONATION_TYPES = ["one_time", "recurring", "pledge", "in_kind"];

export default function RecordDonationPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { data: donors } = useFinancialDonors();
  const { data: campaigns } = useDonationCampaigns();
  const createDonation = useCreateDonation();

  const [form, setForm] = useState({
    donor_id: "", amount: "", donation_date: new Date().toISOString().split("T")[0],
    donation_type: "one_time", payment_method: "cash", payment_reference: "",
    purpose: "general", purpose_detail: "", notes: "", status: "received",
    campaign_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.donor_id || !form.amount) return;
    const donation = await createDonation.mutateAsync({
      ...form,
      amount: parseFloat(form.amount),
      campaign_id: form.campaign_id || null,
      organization_id: profile?.organization_id,
      branch_id: profile?.branch_id || null,
      created_by: profile?.id,
    });
    navigate(`/app/donations/receipt/${(donation as any).id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.recordDonation")}
        description={t("donations.recordDonationDesc")}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.recordDonation") },
        ]}
      />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("donations.selectDonor")} *</Label>
                <Select value={form.donor_id} onValueChange={(v) => setForm({ ...form, donor_id: v })}>
                  <SelectTrigger><SelectValue placeholder={t("donations.selectDonor")} /></SelectTrigger>
                  <SelectContent>
                    {donors?.filter(d => d.is_active).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.donor_number})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.amount")} (PKR) *</Label>
                <Input type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("common.date")} *</Label>
                <Input type="date" value={form.donation_date} onChange={(e) => setForm({ ...form, donation_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.donationType")}</Label>
                <Select value={form.donation_type} onValueChange={(v) => setForm({ ...form, donation_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DONATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t(`donations.type.${type}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("donations.paymentMethodLabel")}</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>{t(`donations.paymentMethod.${m}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("donations.paymentReference")}</Label>
                <Input value={form.payment_reference} onChange={(e) => setForm({ ...form, payment_reference: e.target.value })} placeholder={t("donations.paymentReferencePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.purposeLabel")}</Label>
                <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((p) => (
                      <SelectItem key={p} value={p}>{t(`donations.purpose.${p}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("donations.campaignLabel")}</Label>
                <Select value={form.campaign_id} onValueChange={(v) => setForm({ ...form, campaign_id: v })}>
                  <SelectTrigger><SelectValue placeholder={t("donations.selectCampaign")} /></SelectTrigger>
                  <SelectContent>
                    {campaigns?.filter(c => c.status === "active").map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title} ({Math.round((Number(c.collected_amount)/Number(c.goal_amount))*100)}%)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("common.status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">{t("donations.status.received")}</SelectItem>
                    <SelectItem value="pledged">{t("donations.status.pledged")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("common.notes")}</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createDonation.isPending}>{t("donations.recordDonation")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
