import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDonationCampaign, useCreateCampaign, useUpdateCampaign } from "@/hooks/useCampaigns";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";

const CATEGORIES = ["general", "building", "equipment", "patient_welfare", "zakat", "emergency"];

export default function CampaignFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const isEdit = !!id;
  const { data: existing } = useDonationCampaign(id || "");
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const [form, setForm] = useState({
    title: "", title_ar: "", description: "", goal_amount: "",
    category: "general", start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    if (existing && isEdit) {
      setForm({
        title: existing.title, title_ar: existing.title_ar || "",
        description: existing.description || "", goal_amount: String(existing.goal_amount),
        category: existing.category, start_date: existing.start_date,
        end_date: existing.end_date || "",
      });
    }
  }, [existing, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.goal_amount) return;
    const payload = {
      ...form,
      goal_amount: parseFloat(form.goal_amount),
      end_date: form.end_date || null,
      title_ar: form.title_ar || null,
      organization_id: profile?.organization_id,
      created_by: profile?.id,
    };
    if (isEdit) {
      await updateCampaign.mutateAsync({ id: id!, ...payload });
    } else {
      await createCampaign.mutateAsync(payload as any);
    }
    navigate("/app/donations/campaigns");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? t("donations.editCampaign") : t("donations.createCampaign")}
        description={t("donations.campaignFormDesc")}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.campaigns"), href: "/app/donations/campaigns" },
          { label: isEdit ? t("donations.editCampaign") : t("donations.createCampaign") },
        ]}
      />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("donations.campaignTitle")} *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.campaignTitleAr")}</Label>
                <Input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} dir="rtl" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("donations.campaignDescription")}</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.campaignGoal")} (PKR) *</Label>
                <Input type="number" min="1" step="0.01" value={form.goal_amount} onChange={(e) => setForm({ ...form, goal_amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.campaignCategoryLabel")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{t(`donations.campaignCategory.${c}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("donations.startDate")} *</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.endDate")}</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createCampaign.isPending || updateCampaign.isPending}>
                {isEdit ? t("common.save") : t("donations.createCampaign")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
