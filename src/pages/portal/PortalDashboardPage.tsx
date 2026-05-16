import { useOutletContext, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, FlaskConical, Pill, FileText, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

type Ctx = { patientId: string };

export default function PortalDashboardPage() {
  const { patientId } = useOutletContext<Ctx>();
  const { t } = useTranslation();

  const { data: patient } = useQuery({
    queryKey: ["portal-patient", patientId],
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("first_name,last_name,patient_number").eq("id", patientId).maybeSingle();
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["portal-counts", patientId],
    queryFn: async () => {
      const today = new Date().toISOString();
      const [appts, labs, rx, inv] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", patientId).gte("appointment_date", today.slice(0, 10)),
        supabase.from("lab_orders").select("id", { count: "exact", head: true }).eq("patient_id", patientId),
        supabase.from("prescriptions").select("id", { count: "exact", head: true }).eq("patient_id", patientId),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("patient_id", patientId).neq("status", "paid"),
      ]);
      return {
        appointments: appts.count ?? 0,
        labs: labs.count ?? 0,
        rx: rx.count ?? 0,
        unpaid: inv.count ?? 0,
      };
    },
  });

  const cards = [
    { to: "/portal/appointments", icon: Calendar, label: t("portal.nav.appointments" as any), value: counts?.appointments ?? 0, sub: t("portal.upcoming" as any) },
    { to: "/portal/lab-results", icon: FlaskConical, label: t("portal.nav.lab_results" as any), value: counts?.labs ?? 0, sub: t("portal.total" as any) },
    { to: "/portal/prescriptions", icon: Pill, label: t("portal.nav.prescriptions" as any), value: counts?.rx ?? 0, sub: t("portal.total" as any) },
    { to: "/portal/invoices", icon: FileText, label: t("portal.nav.invoices" as any), value: counts?.unpaid ?? 0, sub: t("portal.unpaid" as any) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("portal.welcome" as any)}{patient ? `, ${patient.first_name ?? ""} ${patient.last_name ?? ""}` : ""}
        </h1>
        {patient?.patient_number && (
          <p className="text-sm text-muted-foreground">{t("portal.mrn" as any)}: {patient.patient_number}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ to, icon: Icon, label, value, sub }) => (
          <Link key={to} to={to} className="bg-card border rounded-lg p-4 hover:border-primary transition-colors group">
            <div className="flex items-center justify-between">
              <Icon className="h-5 w-5 text-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold">{value}</div>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
