import { useState } from "react";
import { useDialysisSchedules } from "@/hooks/useDialysis";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Plus, PlayCircle } from "lucide-react";

const patternLabels: Record<string, string> = { mwf: "Mon / Wed / Fri", tts: "Tue / Thu / Sat", custom: "Custom" };
const shiftLabels: Record<string, string> = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

export default function DialysisSchedulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: schedules, isLoading } = useDialysisSchedules();
  const [patternFilter, setPatternFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");

  const filtered = (schedules || []).filter((s: any) => {
    if (patternFilter !== "all" && s.pattern !== patternFilter) return false;
    if (shiftFilter !== "all" && s.shift !== shiftFilter) return false;
    return true;
  });

  const columns: Column<any>[] = [
    { key: "patient", header: t("common.name" as any), sortable: true, cell: (r) => `${r.dialysis_patients?.patients?.first_name || ""} ${r.dialysis_patients?.patients?.last_name || ""}`.trim() },
    { key: "pattern", header: t("dialysis.schedulePattern" as any), sortable: true, cell: (r) => <Badge variant="secondary">{patternLabels[r.pattern] || r.pattern}</Badge> },
    { key: "shift", header: t("dialysis.shiftPreference" as any), sortable: true, cell: (r) => <Badge variant="outline">{shiftLabels[r.shift] || r.shift}</Badge> },
    { key: "chair_number", header: t("dialysis.chairNumber" as any), cell: (r) => r.chair_number || "–" },
    { key: "machine", header: t("dialysis.machine" as any), cell: (r) => r.dialysis_machines?.machine_number || "–" },
    { key: "start_date", header: t("dialysis.startDate" as any), sortable: true, cell: (r) => r.start_date || "–" },
    { key: "end_date", header: "End Date", sortable: true, cell: (r) => r.end_date || "–" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={t("dialysis.schedule" as any)}
        description="Recurring patient-chair-shift assignments"
        breadcrumbs={[{ label: "Dialysis", href: "/app/dialysis" }, { label: t("dialysis.schedule" as any) }]}
        actions={<Button asChild><Link to="/app/dialysis/schedule/new"><Plus className="h-4 w-4 mr-2" />New Schedule</Link></Button>}
      />
      <div className="flex gap-2">
        <Select value={patternFilter} onValueChange={setPatternFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Pattern" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patterns</SelectItem>
            <SelectItem value="mwf">MWF</SelectItem>
            <SelectItem value="tts">TTS</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <Select value={shiftFilter} onValueChange={setShiftFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Shift" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ReportTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder="Search by patient..."
        emptyMessage="No schedules configured yet."
      />
    </div>
  );
}
