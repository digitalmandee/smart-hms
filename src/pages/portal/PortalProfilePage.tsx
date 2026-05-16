import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { useAuth } from "@/contexts/AuthContext";

type Ctx = { patientId: string };

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-end">{value || "-"}</span>
    </div>
  );
}

export default function PortalProfilePage() {
  const { patientId } = useOutletContext<Ctx>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const rtl = useIsRTL();

  const { data: p } = useQuery({
    queryKey: ["portal-profile", patientId],
    queryFn: async () => {
      const { data } = await supabase
        .from("patients")
        .select("first_name,last_name,patient_number,date_of_birth,gender,phone,email,address,city,national_id,nafath_verified")
        .eq("id", patientId)
        .maybeSingle();
      return data;
    },
  });

  return (
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <h1 className="text-2xl font-bold">{t("portal.nav.profile" as any)}</h1>

      <div className="bg-card border rounded-lg p-6 space-y-1">
        <Row label={t("portal.profile.name" as any)} value={`${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim()} />
        <Row label={t("portal.mrn" as any)} value={p?.patient_number} />
        <Row label={t("portal.profile.dob" as any)} value={p?.date_of_birth} />
        <Row label={t("portal.profile.gender" as any)} value={p?.gender} />
        <Row label={t("common.phone" as any)} value={p?.phone} />
        <Row label={t("common.email" as any)} value={user?.email ?? p?.email} />
        <Row label={t("common.address" as any)} value={[p?.address, p?.city].filter(Boolean).join(", ")} />
        <Row label={t("portal.profile.national_id" as any)} value={p?.national_id} />
        <Row label={t("portal.profile.nafath_verified" as any)} value={p?.nafath_verified ? t("common.yes" as any) : t("common.no" as any)} />
      </div>

      <p className="text-xs text-muted-foreground">{t("portal.profile.contact_clinic_to_update" as any)}</p>
    </div>
  );
}
