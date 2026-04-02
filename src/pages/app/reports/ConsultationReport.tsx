import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTable, Column } from "@/components/reports/ReportTable";
import { ReportExportButton } from "@/components/reports/ReportExportButton";
import { useTranslation } from "@/lib/i18n";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Stethoscope, Users, CalendarCheck, Activity } from "lucide-react";

interface ConsultationRow {
  id: string;
  date: string;
  patient_name: string;
  patient_id: string;
  doctor_name: string;
  diagnosis: string;
  chief_complaint: string;
  symptoms: string;
  follow_up_date: string | null;
  branch_name: string;
}

export default function ConsultationReport() {
  const { organization } = useOrganization();
  const { t } = useTranslation();
  const orgId = organization?.id;

  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  // Fetch consultations
  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ["consultation-report", orgId, dateFrom, dateTo],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("consultations")
        .select(`
          id, diagnosis, chief_complaint, symptoms, follow_up_date, created_at,
          patients!inner(id, first_name, last_name),
          doctors!inner(id, profiles(full_name)),
          branches!inner(id, name)
        `)
        .gte("created_at", dateFrom)
        .lte("created_at", dateTo + "T23:59:59")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Consultation report error:", error);
        return [];
      }
      return (data || []).map((c: any) => ({
        id: c.id,
        date: format(parseISO(c.created_at), "dd MMM yyyy"),
        patient_name: `${c.patients?.first_name || ""} ${c.patients?.last_name || ""}`.trim(),
        patient_id: c.patients?.id || "",
        doctor_name: c.doctors?.profiles?.full_name || "—",
        diagnosis: c.diagnosis || "—",
        chief_complaint: c.chief_complaint || "—",
        symptoms: c.symptoms || "—",
        follow_up_date: c.follow_up_date ? format(parseISO(c.follow_up_date), "dd MMM yyyy") : null,
        branch_name: c.branches?.name || "—",
        _doctor_id: c.doctors?.id,
        _branch_id: c.branches?.id,
      }));
    },
    enabled: !!orgId,
  });

  // Fetch doctors for filter
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from("doctors")
        .select("id, profiles(full_name)")
        .eq("organization_id", orgId)
        .eq("is_active", true);
      return (data || []).map((d: any) => ({ id: d.id, name: d.profiles?.full_name || "Unknown" }));
    },
    enabled: !!orgId,
  });

  // Fetch branches for filter
  const { data: branches = [] } = useQuery({
    queryKey: ["branches-list", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase.from("branches").select("id, name").eq("organization_id", orgId);
      return data || [];
    },
    enabled: !!orgId,
  });

  // Apply filters
  const filtered = useMemo(() => {
    let result = consultations;
    if (doctorFilter !== "all") result = result.filter((r: any) => r._doctor_id === doctorFilter);
    if (branchFilter !== "all") result = result.filter((r: any) => r._branch_id === branchFilter);
    return result;
  }, [consultations, doctorFilter, branchFilter]);

  // Summary stats
  const totalConsultations = filtered.length;
  const withDiagnosis = filtered.filter((r) => r.diagnosis !== "—").length;
  const withFollowUp = filtered.filter((r) => r.follow_up_date).length;
  const uniqueDoctors = new Set(filtered.map((r: any) => r._doctor_id)).size;

  const columns: Column<ConsultationRow>[] = [
    { key: "date", header: t("consultation.date"), sortable: true },
    { key: "patient_name", header: t("consultation.patient"), sortable: true },
    { key: "doctor_name", header: t("consultation.doctor"), sortable: true },
    { key: "chief_complaint", header: t("consultation.chiefComplaint") },
    { key: "diagnosis", header: t("consultation.diagnosis"), sortable: true },
    { key: "symptoms", header: t("consultation.symptoms") },
    {
      key: "follow_up_date",
      header: t("consultation.followUp"),
      cell: (row) => row.follow_up_date || "—",
    },
    { key: "branch_name", header: t("consultation.branch") },
  ];

  const exportColumns = [
    { key: "date", header: "Date" },
    { key: "patient_name", header: "Patient" },
    { key: "doctor_name", header: "Doctor" },
    { key: "chief_complaint", header: "Chief Complaint" },
    { key: "diagnosis", header: "Diagnosis" },
    { key: "symptoms", header: "Symptoms" },
    { key: "follow_up_date", header: "Follow Up", format: (v: any) => v || "—" },
    { key: "branch_name", header: "Branch" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("consultation.reportTitle")}</h1>
          <p className="text-muted-foreground">{t("consultation.reportDescription")}</p>
        </div>
        <ReportExportButton
          data={filtered}
          filename="consultation-report"
          columns={exportColumns}
          title="Consultation Report"
          pdfOptions={{
            title: "Consultation Report",
            subtitle: `${dateFrom} to ${dateTo}`,
            orientation: "landscape",
          }}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>{t("common.from")}</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>{t("common.to")}</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <Label>{t("consultation.doctor")}</Label>
              <Select value={doctorFilter} onValueChange={setDoctorFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {doctors.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("consultation.branch")}</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {branches.map((b: any) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalConsultations}</p>
              <p className="text-sm text-muted-foreground">{t("consultation.total")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withDiagnosis}</p>
              <p className="text-sm text-muted-foreground">{t("consultation.withDiagnosis")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <CalendarCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withFollowUp}</p>
              <p className="text-sm text-muted-foreground">{t("consultation.withFollowUp")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueDoctors}</p>
              <p className="text-sm text-muted-foreground">{t("consultation.uniqueDoctors")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <ReportTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        pageSize={20}
        searchPlaceholder={t("consultation.searchPlaceholder")}
        emptyMessage={t("consultation.noData")}
      />
    </div>
  );
}
