import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDialysisPatients } from "@/hooks/useDialysis";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plus, Printer, ExternalLink } from "lucide-react";

const accessTypeLabels: Record<string, string> = {
  av_fistula: "AV Fistula",
  av_graft: "AV Graft",
  temporary_catheter: "Temp Catheter",
  permanent_catheter: "Perm Catheter",
};

const patternLabels: Record<string, string> = { mwf: "MWF", tts: "TTS", custom: "Custom" };

export default function DialysisPatientsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: patients, isLoading } = useDialysisPatients();
  const [accessFilter, setAccessFilter] = useState("all");
  const [hepFilter, setHepFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");

  const filtered = (patients || []).filter((dp: any) => {
    if (accessFilter !== "all" && dp.vascular_access_type !== accessFilter) return false;
    if (hepFilter === "hbv_pos" && dp.hepatitis_b_status !== "positive") return false;
    if (hepFilter === "hcv_pos" && dp.hepatitis_c_status !== "positive") return false;
    if (hepFilter === "negative" && (dp.hepatitis_b_status === "positive" || dp.hepatitis_c_status === "positive")) return false;
    if (patternFilter !== "all" && dp.schedule_pattern !== patternFilter) return false;
    return true;
  });

  const columns: Column<any>[] = [
    { key: "patients.patient_number", header: "MRN", sortable: true, cell: (r) => r.patients?.patient_number || "–" },
    { key: "patients.first_name", header: t("common.name" as any), sortable: true, cell: (r) => `${r.patients?.first_name || ""} ${r.patients?.last_name || ""}`.trim() },
    { key: "vascular_access_type", header: t("dialysis.vascularAccess" as any), sortable: true, cell: (r) => r.vascular_access_type ? <Badge variant="outline">{accessTypeLabels[r.vascular_access_type] || r.vascular_access_type}</Badge> : "–" },
    { key: "schedule_pattern", header: t("dialysis.schedulePattern" as any), sortable: true, cell: (r) => r.schedule_pattern ? <Badge variant="secondary">{patternLabels[r.schedule_pattern] || r.schedule_pattern}</Badge> : "–" },
    { key: "shift_preference", header: t("dialysis.shiftPreference" as any), sortable: true, cell: (r) => r.shift_preference || "–" },
    { key: "dry_weight_kg", header: t("dialysis.dryWeight" as any), sortable: true, cell: (r) => r.dry_weight_kg != null ? `${r.dry_weight_kg} kg` : "–" },
    { key: "hepatitis_b_status", header: "HBV", cell: (r) => <Badge variant={r.hepatitis_b_status === "positive" ? "destructive" : "outline"}>{r.hepatitis_b_status || "?"}</Badge> },
    { key: "hepatitis_c_status", header: "HCV", cell: (r) => <Badge variant={r.hepatitis_c_status === "positive" ? "destructive" : "outline"}>{r.hepatitis_c_status || "?"}</Badge> },
    { key: "created_at", header: t("dialysis.enrolledDate" as any), sortable: true, cell: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString() : "–" },
    {
      key: "actions", header: t("common.actions" as any), cell: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/app/dialysis/patients/${r.id}`)} title={t("dialysis.printCard" as any)}>
            <Printer className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" asChild title={t("dialysis.viewProfile" as any)}>
            <Link to={`/app/patients/${r.patient_id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("dialysis.patients" as any)}
        description={t("dialysis.enrollPatient" as any)}
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: t("dialysis.patients" as any) }]}
        actions={<Button asChild><Link to="/app/dialysis/patients/enroll"><Plus className="h-4 w-4 mr-2" />{t("dialysis.enrollPatient" as any)}</Link></Button>}
      />
      <div className="flex flex-wrap gap-2">
        <Select value={accessFilter} onValueChange={setAccessFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Access Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access Types</SelectItem>
            <SelectItem value="av_fistula">AV Fistula</SelectItem>
            <SelectItem value="av_graft">AV Graft</SelectItem>
            <SelectItem value="temporary_catheter">Temp Catheter</SelectItem>
            <SelectItem value="permanent_catheter">Perm Catheter</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hepFilter} onValueChange={setHepFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Hepatitis" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hepatitis</SelectItem>
            <SelectItem value="hbv_pos">HBV Positive</SelectItem>
            <SelectItem value="hcv_pos">HCV Positive</SelectItem>
            <SelectItem value="negative">All Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={patternFilter} onValueChange={setPatternFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Schedule" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patterns</SelectItem>
            <SelectItem value="mwf">MWF</SelectItem>
            <SelectItem value="tts">TTS</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ReportTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by name, MRN..."
        emptyMessage="No dialysis patients enrolled yet."
        onRowClick={(r) => navigate(`/app/dialysis/patients/${r.id}`)}
      />
    </div>
  );
}
