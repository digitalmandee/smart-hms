import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useThalList, useThalSave, usePatientSearch, patientName, today } from "@/hooks/useThalassemia";
import { useThalT } from "@/lib/thalassemia/i18n";

export default function ThalassemiaRegistry() {
  const { t, rtl } = useThalT();
  const nav = useNavigate();
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const profiles = useThalList("thalassemia_profiles").data || [];
  const search = usePatientSearch(term).data || [];
  const save = useThalSave("thalassemia_profiles");
  const enrolled = new Set(profiles.map((p: any) => p.patient_id));

  const rows = profiles.filter((p: any) => {
    const s = `${patientName(p.patient)} ${p.patient?.patient_number || ""}`.toLowerCase();
    return s.includes(filter.toLowerCase());
  });

  const enroll = async (patientId: string) => {
    await save.mutateAsync({ patient_id: patientId, next_due_date: today() });
    setOpen(false);
    nav(`/app/thalassemia/patients/${patientId}`);
  };

  return (
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={t("registry")} description={t("subtitle")} actions={<Button onClick={() => setOpen(true)}>{t("enroll")}</Button>} />
      <Input placeholder={t("search")} value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-sm" />
      <Card><CardContent className="p-0">
        <Table><TableHeader><TableRow>
          {["patient", "diagnosis", "bloodGroup", "interval", "chelationDrug", "nextDue", "status"].map((k) => <TableHead key={k} className="text-start">{t(k as any)}</TableHead>)}
          <TableHead />
        </TableRow></TableHeader><TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">{t("noData")}</TableCell></TableRow>}
          {rows.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell className="text-start">{patientName(p.patient)}<div className="text-xs text-muted-foreground">{p.patient?.patient_number}</div></TableCell>
              <TableCell className="text-start">{t(p.diagnosis_type)}</TableCell>
              <TableCell className="text-start">{p.blood_group || "—"}</TableCell>
              <TableCell className="text-start">{p.transfusion_interval_days} {t("days")}</TableCell>
              <TableCell className="text-start">{p.chelation_drug || "—"}</TableCell>
              <TableCell className="text-start">{p.next_due_date || "—"}</TableCell>
              <TableCell className="text-start"><Badge variant={p.status === "active" ? "default" : "secondary"}>{t(p.status)}</Badge></TableCell>
              <TableCell className="text-end"><Button size="sm" variant="outline" asChild><Link to={`/app/thalassemia/patients/${p.patient_id}`}>{t("open")}</Link></Button></TableCell>
            </TableRow>
          ))}
        </TableBody></Table>
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={rtl ? "rtl" : "ltr"}>
          <DialogHeader><DialogTitle className="text-start">{t("enroll")}</DialogTitle></DialogHeader>
          <Input autoFocus placeholder={t("search")} value={term} onChange={(e) => setTerm(e.target.value)} />
          <div className="space-y-2 max-h-72 overflow-auto">
            {search.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded border p-2">
                <span className="text-start">{patientName(p)} <span className="text-xs text-muted-foreground">{p.patient_number}</span></span>
                {enrolled.has(p.id)
                  ? <Button size="sm" variant="outline" asChild><Link to={`/app/thalassemia/patients/${p.id}`}>{t("open")}</Link></Button>
                  : <Button size="sm" disabled={save.isPending} onClick={() => enroll(p.id)}>{t("add")}</Button>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
