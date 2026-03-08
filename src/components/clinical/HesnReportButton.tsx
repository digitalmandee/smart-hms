import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface HesnReportButtonProps {
  patientId: string;
  patientName?: string;
  diagnosisCode?: string;
  diagnosisName?: string;
  disabled?: boolean;
}

export function HesnReportButton({
  patientId,
  patientName,
  diagnosisCode,
  diagnosisName,
  disabled,
}: HesnReportButtonProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { country_code } = useCountryConfig();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportType, setReportType] = useState<string>("communicable_disease");
  const [diseaseCode, setDiseaseCode] = useState(diagnosisCode || "");
  const [diseaseName, setDiseaseName] = useState(diagnosisName || "");
  const [diagnosisDate, setDiagnosisDate] = useState(new Date().toISOString().split("T")[0]);
  const [severity, setSeverity] = useState<string>("moderate");
  const [labConfirmed, setLabConfirmed] = useState(false);
  const [specimenType, setSpecimenType] = useState("");
  const [notes, setNotes] = useState("");

  if (country_code !== "SA") return null;

  const handleSubmit = async () => {
    if (!profile?.organization_id) return;
    setIsSubmitting(true);

    try {
      // Create report record
      const { data: report, error: insertError } = await supabase
        .from("hesn_reports")
        .insert({
          organization_id: profile.organization_id,
          patient_id: patientId,
          report_type: reportType,
          disease_code: diseaseCode,
          disease_name: diseaseName,
          diagnosis_date: diagnosisDate,
          severity,
          lab_confirmed: labConfirmed,
          specimen_type: specimenType || null,
          notes: notes || null,
          created_by: profile.id,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Submit to HESN gateway
      const { data: result, error: fnError } = await supabase.functions.invoke(
        "hesn-gateway",
        {
          body: {
            action: "submit_report",
            report_id: report.id,
            report_data: {
              report_type: reportType,
              disease_code: diseaseCode,
              disease_name: diseaseName,
              diagnosis_date: diagnosisDate,
              severity,
              lab_confirmed: labConfirmed,
              specimen_type: specimenType,
              patient_national_id: "", // Would be fetched from patient record
            },
          },
        }
      );

      if (fnError) throw fnError;

      toast.success(
        t("hesn.reportSubmitted" as any, "HESN report submitted successfully")
      );
      setOpen(false);
    } catch (err) {
      console.error("HESN submission error:", err);
      toast.error(t("hesn.reportError" as any, "Failed to submit HESN report"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <ShieldAlert className="h-4 w-4" />
          {t("hesn.reportButton" as any, "HESN Report")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {t("hesn.submitReport" as any, "Submit HESN Public Health Report")}
          </DialogTitle>
        </DialogHeader>

        {patientName && (
          <Badge variant="secondary">{patientName}</Badge>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("hesn.reportType" as any, "Report Type")}</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="communicable_disease">
                  {t("hesn.communicableDisease" as any, "Communicable Disease")}
                </SelectItem>
                <SelectItem value="immunization">
                  {t("hesn.immunization" as any, "Immunization")}
                </SelectItem>
                <SelectItem value="outbreak">
                  {t("hesn.outbreak" as any, "Outbreak")}
                </SelectItem>
                <SelectItem value="adverse_event">
                  {t("hesn.adverseEvent" as any, "Adverse Event")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("hesn.diseaseCode" as any, "Disease Code (ICD-10)")}</Label>
              <Input value={diseaseCode} onChange={(e) => setDiseaseCode(e.target.value)} placeholder="e.g. A09" />
            </div>
            <div className="space-y-2">
              <Label>{t("hesn.diseaseName" as any, "Disease Name")}</Label>
              <Input value={diseaseName} onChange={(e) => setDiseaseName(e.target.value)} placeholder="e.g. Gastroenteritis" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("hesn.diagnosisDate" as any, "Diagnosis Date")}</Label>
              <Input type="date" value={diagnosisDate} onChange={(e) => setDiagnosisDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("hesn.severity" as any, "Severity")}</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">{t("common.mild" as any, "Mild")}</SelectItem>
                  <SelectItem value="moderate">{t("common.moderate" as any, "Moderate")}</SelectItem>
                  <SelectItem value="severe">{t("common.severe" as any, "Severe")}</SelectItem>
                  <SelectItem value="critical">{t("common.critical" as any, "Critical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={labConfirmed} onCheckedChange={setLabConfirmed} />
            <Label>{t("hesn.labConfirmed" as any, "Lab Confirmed")}</Label>
          </div>

          {labConfirmed && (
            <div className="space-y-2">
              <Label>{t("hesn.specimenType" as any, "Specimen Type")}</Label>
              <Input value={specimenType} onChange={(e) => setSpecimenType(e.target.value)} placeholder="e.g. Blood, Stool, Swab" />
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("common.notes" as any, "Notes")}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting || !diseaseName} className="w-full gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("hesn.submit" as any, "Submit to HESN")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
