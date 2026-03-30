import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialysisSessions } from "@/hooks/useDialysis";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceStatusBadge } from "@/components/billing/InvoiceStatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  in_progress: "secondary",
  scheduled: "outline",
  cancelled: "destructive",
};

export default function DialysisSessionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useDialysisSessions();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (sessions || []).filter((s: any) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<any>[] = [
    { key: "session_number", header: "Session #", sortable: true, cell: (r) => (r as any).session_number || "–" },
    { key: "session_date", header: t("common.date" as any), sortable: true },
    { key: "patient", header: t("common.name" as any), sortable: true, cell: (r) => `${r.dialysis_patients?.patients?.first_name || ""} ${r.dialysis_patients?.patients?.last_name || ""}`.trim() },
    { key: "chair_number", header: t("dialysis.chairNumber" as any), cell: (r) => r.chair_number || "–" },
    { key: "machine", header: t("dialysis.machine" as any), cell: (r) => r.dialysis_machines?.machine_number || "–" },
    { key: "pre_weight_kg", header: t("dialysis.preWeight" as any), sortable: true, cell: (r) => r.pre_weight_kg != null ? `${r.pre_weight_kg}` : "–" },
    { key: "post_weight_kg", header: t("dialysis.postWeight" as any), cell: (r) => r.post_weight_kg != null ? `${r.post_weight_kg}` : "–" },
    { key: "actual_uf_ml", header: "UF (ml)", cell: (r) => r.actual_uf_ml ?? r.target_uf_ml ?? "–" },
    { key: "duration_minutes", header: t("dialysis.duration" as any), cell: (r) => r.duration_minutes ? `${r.duration_minutes}m` : "–" },
    { key: "status", header: t("common.status" as any), sortable: true, cell: (r) => <Badge variant={statusColors[r.status] || "outline"}>{r.status}</Badge> },
    { key: "invoice", header: t("dialysis.billing" as any), cell: (r) => (r as any).invoice_id ? <InvoiceStatusBadge status="pending" /> : <span className="text-muted-foreground text-xs">—</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("dialysis.sessions" as any)}
        description="All hemodialysis session records"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: t("dialysis.sessions" as any) }]}
        actions={<Button asChild><Link to="/app/dialysis/sessions/new"><Plus className="h-4 w-4 mr-2" />{t("dialysis.newSession" as any)}</Link></Button>}
      />
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ReportTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by patient, session..."
        emptyMessage="No sessions found."
        onRowClick={(r) => navigate(`/app/dialysis/sessions/${r.id}`)}
      />
    </div>
  );
}
