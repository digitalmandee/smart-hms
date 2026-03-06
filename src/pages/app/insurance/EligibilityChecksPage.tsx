import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";

interface EligibilityLog {
  id: string;
  patient_id: string | null;
  eligible: boolean | null;
  plan_name: string | null;
  status: string | null;
  checked_at: string | null;
  created_at: string | null;
  patients?: { first_name: string; last_name: string } | null;
}

export default function EligibilityChecksPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["nphies-eligibility-logs", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nphies_eligibility_logs")
        .select("id, patient_id, eligible, plan_name, status, checked_at, created_at, patients:patient_id(first_name, last_name)")
        .eq("organization_id", orgId!)
        .order("checked_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EligibilityLog[];
    },
    enabled: !!orgId,
  });

  const columns: ColumnDef<EligibilityLog, unknown>[] = [
    {
      accessorKey: "patients",
      header: t("eligibility.patient"),
      cell: ({ row }) => {
        const p = row.original.patients;
        return p ? `${p.first_name} ${p.last_name}` : "—";
      },
    },
    {
      accessorKey: "plan_name",
      header: t("eligibility.planName"),
      cell: ({ row }) => row.original.plan_name || "—",
    },
    {
      accessorKey: "eligible",
      header: t("eligibility.status"),
      cell: ({ row }) => {
        const eligible = row.original.eligible;
        if (eligible === null) return "—";
        return (
          <StatusBadge
            status={eligible ? "success" : "suspended"}
            label={eligible ? t("eligibility.eligible") : t("eligibility.ineligible")}
          />
        );
      },
    },
    {
      accessorKey: "checked_at",
      header: t("eligibility.checkedAt"),
      cell: ({ row }) => {
        const d = row.original.checked_at;
        return d ? format(new Date(d), "dd MMM yyyy HH:mm") : "—";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("eligibility.title")}
        description={t("eligibility.description")}
        breadcrumbs={[
          { label: t("nav.insurance"), href: "/app/insurance/claims" },
          { label: t("nav.nphies"), href: "/app/insurance/nphies/settings" },
          { label: t("eligibility.title") },
        ]}
      />
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        searchKey="plan_name"
        searchPlaceholder={t("common.search")}
      />
    </div>
  );
}
