import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { Printer, ExternalLink, Loader2 } from "lucide-react";
import { useRef } from "react";

const accessTypeLabels: Record<string, string> = {
  av_fistula: "AV Fistula", av_graft: "AV Graft",
  temporary_catheter: "Temp Catheter", permanent_catheter: "Perm Catheter",
};

export default function DialysisPatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const { data: dp, isLoading } = useQuery({
    queryKey: ["dialysis-patient-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_patients")
        .select("*, patients(id, first_name, last_name, patient_number, phone, date_of_birth, gender)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: sessions } = useQuery({
    queryKey: ["dialysis-patient-sessions", dp?.patient_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dialysis_sessions")
        .select("*, dialysis_machines(machine_number)")
        .eq("dialysis_patient_id", id!)
        .order("session_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Dialysis Card</title><style>
      body{font-family:Arial,sans-serif;padding:20px}
      .card{border:2px solid #333;padding:20px;max-width:400px;border-radius:8px}
      .header{font-size:18px;font-weight:bold;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:12px}
      .row{display:flex;justify-content:space-between;padding:4px 0}
      .label{font-weight:600;color:#555} .value{font-weight:500}
      .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;margin-right:4px}
      .badge-danger{background:#fee;color:#c00;border:1px solid #fcc}
      .badge-safe{background:#efe;color:#060;border:1px solid #cfc}
    </style></head><body>${printContent.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  const sessionColumns: Column<any>[] = [
    { key: "session_date", header: t("common.date" as any), sortable: true },
    { key: "status", header: t("common.status" as any), cell: (r) => <Badge variant={r.status === "completed" ? "default" : "outline"}>{r.status}</Badge> },
    { key: "pre_weight_kg", header: "Pre-Wt", cell: (r) => r.pre_weight_kg ?? "–" },
    { key: "post_weight_kg", header: "Post-Wt", cell: (r) => r.post_weight_kg ?? "–" },
    { key: "actual_uf_ml", header: "UF (ml)", cell: (r) => r.actual_uf_ml ?? r.target_uf_ml ?? "–" },
    { key: "duration_minutes", header: "Duration", cell: (r) => r.duration_minutes ? `${r.duration_minutes}m` : "–" },
    { key: "machine", header: "Machine", cell: (r) => r.dialysis_machines?.machine_number || "–" },
  ];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!dp) return <div className="text-center py-12 text-muted-foreground">Patient not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dp.patients?.first_name} ${dp.patients?.last_name}`}
        description={`MRN: ${dp.patients?.patient_number || "–"}`}
        breadcrumbs={[
          { label: "Dialysis", href: "/app/dialysis" },
          { label: t("dialysis.patients" as any), href: "/app/dialysis/patients" },
          { label: `${dp.patients?.first_name} ${dp.patients?.last_name}` },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-2" />{t("dialysis.printCard" as any)}</Button>
            <Button variant="outline" asChild><Link to={`/app/patients/${dp.patient_id}`}><ExternalLink className="h-4 w-4 mr-2" />{t("dialysis.viewProfile" as any)}</Link></Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{t("dialysis.vascularAccess" as any)}</p>
          <p className="font-semibold">{accessTypeLabels[dp.vascular_access_type] || dp.vascular_access_type || "–"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{t("dialysis.dryWeight" as any)}</p>
          <p className="font-semibold">{dp.dry_weight_kg != null ? `${dp.dry_weight_kg} kg` : "–"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">{t("dialysis.schedulePattern" as any)}</p>
          <p className="font-semibold">{dp.schedule_pattern?.toUpperCase() || "–"} / {dp.shift_preference || "–"}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Hepatitis</p>
          <div className="flex gap-2 mt-1">
            <Badge variant={dp.hepatitis_b_status === "positive" ? "destructive" : "outline"}>HBV: {dp.hepatitis_b_status || "?"}</Badge>
            <Badge variant={dp.hepatitis_c_status === "positive" ? "destructive" : "outline"}>HCV: {dp.hepatitis_c_status || "?"}</Badge>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>{t("dialysis.sessionHistory" as any)}</CardTitle></CardHeader>
        <CardContent>
          <ReportTable
            data={sessions || []}
            columns={sessionColumns}
            pageSize={15}
            searchable={false}
            emptyMessage="No sessions recorded yet."
          />
        </CardContent>
      </Card>

      {/* Hidden printable card */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="card">
            <div className="header">DIALYSIS PATIENT CARD</div>
            <div className="row"><span className="label">Name:</span><span className="value">{dp.patients?.first_name} {dp.patients?.last_name}</span></div>
            <div className="row"><span className="label">MRN:</span><span className="value">{dp.patients?.patient_number}</span></div>
            <div className="row"><span className="label">Gender:</span><span className="value">{dp.patients?.gender || "–"}</span></div>
            <div className="row"><span className="label">DOB:</span><span className="value">{dp.patients?.date_of_birth || "–"}</span></div>
            <div className="row"><span className="label">Access:</span><span className="value">{accessTypeLabels[dp.vascular_access_type] || "–"}</span></div>
            <div className="row"><span className="label">Dry Weight:</span><span className="value">{dp.dry_weight_kg ?? "–"} kg</span></div>
            <div className="row"><span className="label">Schedule:</span><span className="value">{dp.schedule_pattern?.toUpperCase() || "–"} / {dp.shift_preference || "–"}</span></div>
            <div className="row">
              <span className="label">Hepatitis:</span>
              <span>
                <span className={`badge ${dp.hepatitis_b_status === "positive" ? "badge-danger" : "badge-safe"}`}>HBV: {dp.hepatitis_b_status || "?"}</span>
                <span className={`badge ${dp.hepatitis_c_status === "positive" ? "badge-danger" : "badge-safe"}`}>HCV: {dp.hepatitis_c_status || "?"}</span>
              </span>
            </div>
            <div className="row"><span className="label">Enrolled:</span><span className="value">{dp.created_at ? new Date(dp.created_at).toLocaleDateString() : "–"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
