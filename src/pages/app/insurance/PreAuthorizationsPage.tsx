import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";

interface PreAuthClaim {
  id: string;
  claim_number: string;
  total_amount: number;
  pre_auth_number: string | null;
  pre_auth_status: string | null;
  pre_auth_date: string | null;
  patient_insurance: {
    patients: { first_name: string; last_name: string } | null;
    insurance_companies: { name: string } | null;
  } | null;
}

export default function PreAuthorizationsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { formatCurrency } = useCurrencyFormatter();
  const navigate = useNavigate();
  const orgId = profile?.organization_id;

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["pre-auth-claims", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_claims")
        .select(`
          id, claim_number, total_amount, pre_auth_number, pre_auth_status, pre_auth_date,
          patient_insurance:patient_insurance_id(
            patients:patient_id(first_name, last_name),
            insurance_companies:company_id(name)
          )
        `)
        .eq("organization_id", orgId!)
        .or("pre_auth_number.neq.null,pre_auth_status.neq.null")
        .order("pre_auth_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []) as unknown as PreAuthClaim[];
    },
    enabled: !!orgId,
  });

  const getStatusType = (status: string | null): string => {
    switch (status?.toLowerCase()) {
      case "approved": return "success";
      case "denied": return "suspended";
      case "pending": return "pending";
      default: return "info";
    }
  };

  const columns: ColumnDef<PreAuthClaim, unknown>[] = [
    {
      accessorKey: "claim_number",
      header: t("preAuth.claimNumber"),
    },
    {
      accessorKey: "patient",
      header: t("preAuth.patient"),
      cell: ({ row }) => {
        const p = row.original.patient_insurance?.patients;
        return p ? `${p.first_name} ${p.last_name}` : "—";
      },
    },
    {
      accessorKey: "pre_auth_number",
      header: t("preAuth.preAuthNumber"),
      cell: ({ row }) => row.original.pre_auth_number || "—",
    },
    {
      accessorKey: "pre_auth_status",
      header: t("preAuth.preAuthStatus"),
      cell: ({ row }) => {
        const status = row.original.pre_auth_status;
        if (!status) return "—";
        return <StatusBadge status={getStatusType(status)} label={status} />;
      },
    },
    {
      accessorKey: "total_amount",
      header: t("preAuth.amount"),
      cell: ({ row }) => formatCurrency(row.original.total_amount),
    },
    {
      accessorKey: "pre_auth_date",
      header: t("preAuth.date"),
      cell: ({ row }) => {
        const d = row.original.pre_auth_date;
        return d ? format(new Date(d), "dd MMM yyyy") : "—";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("preAuth.title")}
        description={t("preAuth.description")}
        breadcrumbs={[
          { label: t("nav.insurance"), href: "/app/insurance/claims" },
          { label: t("nav.nphies"), href: "/app/insurance/nphies/settings" },
          { label: t("preAuth.title") },
        ]}
      />
      <DataTable
        columns={columns}
        data={claims}
        isLoading={isLoading}
        searchKey="claim_number"
        searchPlaceholder={t("common.search")}
        onRowClick={(row) => navigate(`/app/insurance/claims/${row.id}`)}
      />
    </div>
  );
}
