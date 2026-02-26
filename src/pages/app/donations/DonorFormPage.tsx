import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDonor, useUpdateDonor, useFinancialDonor } from "@/hooks/useDonations";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";

const DONOR_TYPES = ["individual", "corporate", "foundation", "government", "anonymous"];

export default function DonorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const isEdit = !!id;
  const { data: existing } = useFinancialDonor(id || "");
  const createDonor = useCreateDonor();
  const updateDonor = useUpdateDonor();

  const [form, setForm] = useState({
    name: "", name_ar: "", donor_type: "individual", contact_person: "",
    phone: "", email: "", cnic_passport: "", address: "", city: "", country: "Pakistan", notes: "",
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name || "", name_ar: existing.name_ar || "", donor_type: existing.donor_type,
        contact_person: existing.contact_person || "", phone: existing.phone || "", email: existing.email || "",
        cnic_passport: existing.cnic_passport || "", address: existing.address || "", city: existing.city || "",
        country: existing.country || "Pakistan", notes: existing.notes || "",
      });
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form, organization_id: profile?.organization_id, branch_id: profile?.branch_id || null };
    if (isEdit) {
      await updateDonor.mutateAsync({ id, ...payload });
    } else {
      await createDonor.mutateAsync(payload);
    }
    navigate("/app/donations/donors");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? t("donations.editDonor") : t("donations.addDonor")}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.donors"), href: "/app/donations/donors" },
          { label: isEdit ? t("common.edit") : t("donations.addDonor") },
        ]}
      />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("donations.donorName")} *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.donorNameAr")}</Label>
                <Input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.donorTypeLabel")}</Label>
                <Select value={form.donor_type} onValueChange={(v) => setForm({ ...form, donor_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DONOR_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t(`donations.donorType.${type}` as any)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.donor_type === "corporate" && (
                <div className="space-y-2">
                  <Label>{t("donations.contactPerson")}</Label>
                  <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                </div>
              )}
              <div className="space-y-2">
                <Label>{t("common.phone")}</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.email")}</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.cnicPassport")}</Label>
                <Input value={form.cnic_passport} onChange={(e) => setForm({ ...form, cnic_passport: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("donations.city")}</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("common.address")}</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("common.notes")}</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>{t("common.cancel")}</Button>
              <Button type="submit" disabled={createDonor.isPending || updateDonor.isPending}>{t("common.save")}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
