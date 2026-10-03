import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useThalList, patientName, today } from "@/hooks/useThalassemia";
import { useThalT } from "@/lib/thalassemia/i18n";

export default function ThalassemiaDashboard() {
  const { t, rtl } = useThalT();
  const profiles = useThalList("thalassemia_profiles").data || [];
  const visits = useThalList("thalassemia_visits").data || [];
  const monitoring = useThalList("thalassemia_monitoring").data || [];

  const td = today();
  const month = td.slice(0, 7);
  const active = profiles.filter((p: any) => p.status === "active");
  const due = active.filter((p: any) => p.next_due_date && p.next_due_date <= td);
  const dueToday = due.filter((p: any) => p.next_due_date === td);
  const overdue = due.filter((p: any) => p.next_due_date < td);

  const latestFerritin = new Map<string, any>();
  monitoring.forEach((m: any) => {
    if (m.ferritin == null) return;
    const cur = latestFerritin.get(m.patient_id);
    if (!cur || m.reading_date > cur.reading_date) latestFerritin.set(m.patient_id, m);
  });
  const ironAlerts = [...latestFerritin.values()].filter((m) => m.ferritin > 1000).sort((a, b) => b.ferritin - a.ferritin);

  const mVisits = visits.filter((v: any) => v.visit_date?.startsWith(month) && v.status === "completed");
  const units = mVisits.reduce((s: number, v: any) => s + (v.units_given || 0), 0);
  const sponsored = mVisits.reduce((s: number, v: any) => s + Number(v.sponsor_covered || 0), 0);

  // per-patient report
  const perPatient = new Map<string, { patient: any; units: number; charge: number; covered: number; visits: number }>();
  visits.filter((v: any) => v.status === "completed").forEach((v: any) => {
    const r = perPatient.get(v.patient_id) || { patient: v.patient, units: 0, charge: 0, covered: 0, visits: 0 };
    r.units += v.units_given || 0; r.charge += Number(v.charge_amount || 0); r.covered += Number(v.sponsor_covered || 0); r.visits += 1;
    perPatient.set(v.patient_id, r);
  });

  const stats = [
    [t("activePatients"), active.length], [t("dueToday"), dueToday.length], [t("overdue"), overdue.length],
    [t("highFerritin"), ironAlerts.filter((a) => a.ferritin > 2500).length], [t("visitsMonth"), mVisits.length],
    [t("unitsMonth"), units], [t("sponsoredMonth"), sponsored.toLocaleString()],
  ];

  return (
    <div className="space-y-6" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={t("dashboard")} description={t("subtitle")}
        actions={<Button asChild><Link to="/app/thalassemia/registry">{t("registry")}</Link></Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map(([l, v]) => (
          <Card key={String(l)}><CardContent className="p-4 text-start">
            <p className="text-xs text-muted-foreground">{l}</p><p className="text-2xl font-bold">{v}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base text-start">{t("dueList")}</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead className="text-start">{t("patient")}</TableHead><TableHead className="text-start">{t("nextDue")}</TableHead><TableHead />
            </TableRow></TableHeader><TableBody>
              {due.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t("noData")}</TableCell></TableRow>}
              {due.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-start">{patientName(p.patient)}<div className="text-xs text-muted-foreground">{p.patient?.patient_number}</div></TableCell>
                  <TableCell className="text-start">
                    <Badge variant={p.next_due_date < td ? "destructive" : "secondary"}>{p.next_due_date}</Badge>
                  </TableCell>
                  <TableCell className="text-end"><Button size="sm" variant="outline" asChild><Link to={`/app/thalassemia/patients/${p.patient_id}`}>{t("open")}</Link></Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base text-start">{t("ironAlerts")}</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow>
              <TableHead className="text-start">{t("patient")}</TableHead><TableHead className="text-start">{t("ferritin")}</TableHead><TableHead className="text-start">{t("date")}</TableHead>
            </TableRow></TableHeader><TableBody>
              {ironAlerts.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t("noData")}</TableCell></TableRow>}
              {ironAlerts.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="text-start"><Link className="underline" to={`/app/thalassemia/patients/${m.patient_id}`}>{patientName(m.patient)}</Link></TableCell>
                  <TableCell className="text-start"><Badge variant={m.ferritin > 2500 ? "destructive" : "secondary"}>{m.ferritin}</Badge></TableCell>
                  <TableCell className="text-start">{m.reading_date}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base text-start">{t("reports")}: {t("unitsPerPatient")} · {t("costVsFunding")}</CardTitle></CardHeader>
        <CardContent>
          <Table><TableHeader><TableRow>
            <TableHead className="text-start">{t("patient")}</TableHead><TableHead className="text-start">{t("visits")}</TableHead>
            <TableHead className="text-start">{t("units")}</TableHead><TableHead className="text-start">{t("totalCharge")}</TableHead>
            <TableHead className="text-start">{t("covered")}</TableHead><TableHead className="text-start">{t("patientPays")}</TableHead>
          </TableRow></TableHeader><TableBody>
            {perPatient.size === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("noData")}</TableCell></TableRow>}
            {[...perPatient.entries()].map(([id, r]) => (
              <TableRow key={id}>
                <TableCell className="text-start">{patientName(r.patient)}</TableCell><TableCell className="text-start">{r.visits}</TableCell>
                <TableCell className="text-start">{r.units}</TableCell><TableCell className="text-start">{r.charge.toLocaleString()}</TableCell>
                <TableCell className="text-start">{r.covered.toLocaleString()}</TableCell><TableCell className="text-start">{(r.charge - r.covered).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody></Table>
        </CardContent>
      </Card>
    </div>
  );
}
