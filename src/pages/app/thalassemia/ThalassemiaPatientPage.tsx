import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { useThalList, useThalSave, bumpNextDue, useLabThalReadings, today, type PatientLite } from "@/hooks/useThalassemia";
import { useThalT, type ThalKey } from "@/lib/thalassemia/i18n";

type Field = { k: string; label: ThalKey; type?: "number" | "date" | "text"; options?: ThalKey[] };

function SimpleForm({ fields, initial, onSave, busy }: { fields: Field[]; initial: Record<string, any>; onSave: (v: Record<string, any>) => void; busy?: boolean }) {
  const { t } = useThalT();
  const [v, setV] = useState<Record<string, any>>(initial);
  useEffect(() => setV(initial), [JSON.stringify(initial)]);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fields.map((f) => (
          <div key={f.k} className="space-y-1">
            <Label className="block text-start">{t(f.label)}</Label>
            {f.options ? (
              <Select value={v[f.k] ?? "__none__"} onValueChange={(x) => setV({ ...v, [f.k]: x === "__none__" ? "" : x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{t(o)}</SelectItem>)}</SelectContent>
              </Select>
            ) : (
              <Input type={f.type || "text"} value={v[f.k] ?? ""} onChange={(e) => setV({ ...v, [f.k]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
      <Button disabled={busy} onClick={() => onSave(v)}>{t("save")}</Button>
    </div>
  );
}

function RecordTable({ rows, cols }: { rows: any[]; cols: { k: string; label: ThalKey; render?: (r: any) => any }[] }) {
  const { t } = useThalT();
  return (
    <Table><TableHeader><TableRow>{cols.map((c) => <TableHead key={c.k} className="text-start">{t(c.label)}</TableHead>)}</TableRow></TableHeader>
      <TableBody>
        {rows.length === 0 && <TableRow><TableCell colSpan={cols.length} className="text-center text-muted-foreground">{t("noData")}</TableCell></TableRow>}
        {rows.map((r) => <TableRow key={r.id}>{cols.map((c) => <TableCell key={c.k} className="text-start">{c.render ? c.render(r) : r[c.k] ?? "—"}</TableCell>)}</TableRow>)}
      </TableBody></Table>
  );
}

export default function ThalassemiaPatientPage() {
  const { patientId = "" } = useParams();
  const { t, rtl } = useThalT();
  const { data: patient } = useQuery({
    queryKey: ["thal-patient", patientId],
    queryFn: async () => (await supabase.from("patients").select("id, first_name, last_name, patient_number").eq("id", patientId).maybeSingle()).data as PatientLite | null,
  });
  const profile = (useThalList("thalassemia_profiles", patientId).data || [])[0] as any;
  const visits = useThalList("thalassemia_visits", patientId).data || [];
  const chelation = useThalList("chelation_records", patientId).data || [];
  const manualMon = useThalList("thalassemia_monitoring", patientId).data || [];
  const labMon = useLabThalReadings(patientId).data || [];
  const monitoring = [
    ...manualMon.map((m: any) => ({ ...m, source: "manual" })),
    ...labMon.filter((l) => !manualMon.some((m: any) => m.reading_date === l.reading_date && (m.ferritin === l.ferritin || l.ferritin == null) && (m.hb === l.hb || l.hb == null))),
  ].sort((a: any, b: any) => b.reading_date.localeCompare(a.reading_date));
  const sponsors = useThalList("patient_sponsorships", patientId).data || [];
  const saveProfile = useThalSave("thalassemia_profiles");
  const saveVisit = useThalSave("thalassemia_visits");
  const saveChel = useThalSave("chelation_records");
  const saveMon = useThalSave("thalassemia_monitoring");
  const saveSpon = useThalSave("patient_sponsorships");

  const activeSponsor = sponsors.find((s: any) => s.is_active) as any;
  const latestFerritin = [...monitoring].filter((m: any) => m.ferritin != null).sort((a: any, b: any) => b.reading_date.localeCompare(a.reading_date))[0] as any;
  const chartData = [...monitoring].sort((a: any, b: any) => a.reading_date.localeCompare(b.reading_date))
    .map((m: any) => ({ date: m.reading_date, ferritin: m.ferritin, hb: m.hb }));
  const hbData = [...visits].sort((a: any, b: any) => a.visit_date.localeCompare(b.visit_date))
    .map((v: any) => ({ date: v.visit_date, pre: v.pre_hb, post: v.post_hb }));

  const onSaveVisit = async (v: Record<string, any>) => {
    const weight = Number(v.weight_kg || profile?.weight_kg || 0);
    const vol = Number(v.volume_ml || 0);
    const charge = Number(v.charge_amount || 0);
    const covered = activeSponsor ? Math.round((charge * (activeSponsor.coverage_pct || 0)) / 100) : 0;
    await saveVisit.mutateAsync({
      ...v, patient_id: patientId, branch_id: profile?.branch_id ?? null,
      ml_per_kg: weight && vol ? +(vol / weight).toFixed(1) : null,
      sponsor_covered: covered, sponsorship_id: activeSponsor?.id ?? null,
    });
    if (v.status === "completed") await bumpNextDue(profile, v.visit_date || today());
  };

  const pName = patient ? `${patient.first_name} ${patient.last_name || ""}` : "";

  return (
    <div className="space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <PageHeader title={`${t("title")} — ${pName}`} description={`${t("mrn")}: ${patient?.patient_number || "—"} · ${t("nextDue")}: ${profile?.next_due_date || "—"}`} />

      {latestFerritin?.ferritin > 1000 && (
        <Alert variant={latestFerritin.ferritin > 2500 ? "destructive" : "default"}>
          <AlertDescription className="text-start">{latestFerritin.ferritin > 2500 ? t("alertFerritin") : t("alertFerritinWarn")} ({latestFerritin.ferritin} · {latestFerritin.reading_date})</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" dir={rtl ? "rtl" : "ltr"}>
        <TabsList className="flex-wrap h-auto">
          {(["profile", "visits", "chelation", "monitoring", "sponsorship"] as ThalKey[]).map((k) => <TabsTrigger key={k} value={k}>{t(k)}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="profile"><Card><CardContent className="pt-6">
          <SimpleForm busy={saveProfile.isPending} initial={profile || { diagnosis_type: "major", status: "active", transfusion_interval_days: 21 }}
            onSave={(v) => saveProfile.mutate({ ...v, id: profile?.id, patient_id: patientId, splenectomy: v.splenectomy === true || v.splenectomy === "yes" })}
            fields={[
              { k: "diagnosis_type", label: "diagnosis", options: ["major", "intermedia", "hbe", "other"] },
              { k: "diagnosis_date", label: "date", type: "date" },
              { k: "blood_group", label: "bloodGroup" }, { k: "phenotype", label: "phenotype" },
              { k: "baseline_hb", label: "baselineHb", type: "number" }, { k: "target_pre_hb", label: "targetHb", type: "number" },
              { k: "weight_kg", label: "weight", type: "number" }, { k: "transfusion_interval_days", label: "interval", type: "number" },
              { k: "chelation_drug", label: "chelationDrug" }, { k: "next_due_date", label: "nextDue", type: "date" },
              { k: "status", label: "status", options: ["active", "inactive"] }, { k: "notes", label: "notes" },
            ]} />
          <p className="text-sm text-muted-foreground mt-3 text-start">{t("splenectomy")}: {profile?.splenectomy ? t("yes") : t("no")}
            <Button variant="link" size="sm" onClick={() => saveProfile.mutate({ id: profile?.id, patient_id: patientId, splenectomy: !profile?.splenectomy })}>⇄</Button></p>
        </CardContent></Card></TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card><CardHeader><CardTitle className="text-base text-start">{t("newVisit")}</CardTitle></CardHeader><CardContent>
            <SimpleForm busy={saveVisit.isPending} initial={{ visit_date: today(), status: "completed", weight_kg: profile?.weight_kg ?? "" }} onSave={onSaveVisit}
              fields={[
                { k: "visit_date", label: "visitDate", type: "date" }, { k: "chair_no", label: "chair" },
                { k: "status", label: "status", options: ["scheduled", "in_progress", "completed", "cancelled"] },
                { k: "pre_hb", label: "preHb", type: "number" }, { k: "post_hb", label: "postHb", type: "number" },
                { k: "units_given", label: "units", type: "number" }, { k: "volume_ml", label: "volume", type: "number" },
                { k: "weight_kg", label: "weight", type: "number" }, { k: "reaction", label: "reaction" },
                { k: "charge_amount", label: "charge", type: "number" }, { k: "notes", label: "notes" },
              ]} />
            {activeSponsor && <p className="text-xs text-muted-foreground mt-2 text-start">{t("sponsor")}: {activeSponsor.sponsor_name} · {activeSponsor.coverage_pct}%</p>}
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <RecordTable rows={visits} cols={[
              { k: "visit_date", label: "visitDate" }, { k: "chair_no", label: "chair" },
              { k: "status", label: "status", render: (r) => <Badge variant="secondary">{t(r.status)}</Badge> },
              { k: "pre_hb", label: "preHb" }, { k: "post_hb", label: "postHb" }, { k: "units_given", label: "units" },
              { k: "ml_per_kg", label: "mlKg" }, { k: "reaction", label: "reaction" },
              { k: "charge_amount", label: "charge" }, { k: "sponsor_covered", label: "covered" },
            ]} />
          </CardContent></Card>
          {hbData.length > 1 && <Card><CardHeader><CardTitle className="text-base text-start">Hb {t("trend")}</CardTitle></CardHeader><CardContent className="h-64" dir="ltr">
            <ResponsiveContainer><LineChart data={hbData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis />
              <Tooltip /><ReferenceLine y={Number(profile?.target_pre_hb || 9.5)} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
              <Line dataKey="pre" name={t("preHb")} stroke="hsl(var(--primary))" /><Line dataKey="post" name={t("postHb")} stroke="hsl(var(--muted-foreground))" />
            </LineChart></ResponsiveContainer></CardContent></Card>}
        </TabsContent>

        <TabsContent value="chelation" className="space-y-4">
          <Card><CardContent className="pt-6">
            <SimpleForm busy={saveChel.isPending} initial={{ record_date: today(), drug: profile?.chelation_drug ?? "" }}
              onSave={(v) => saveChel.mutate({ ...v, patient_id: patientId })}
              fields={[{ k: "record_date", label: "date", type: "date" }, { k: "drug", label: "drug" }, { k: "dose", label: "dose" },
                { k: "compliance_pct", label: "compliance", type: "number" }, { k: "side_effects", label: "sideEffects" }, { k: "notes", label: "notes" }]} />
          </CardContent></Card>
          <Card><CardContent className="pt-6"><RecordTable rows={chelation} cols={[
            { k: "record_date", label: "date" }, { k: "drug", label: "drug" }, { k: "dose", label: "dose" },
            { k: "compliance_pct", label: "compliance", render: (r) => r.compliance_pct == null ? "—" : <Badge variant={r.compliance_pct < 80 ? "destructive" : "default"}>{r.compliance_pct}%</Badge> },
            { k: "side_effects", label: "sideEffects" }]} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card><CardContent className="pt-6">
            <SimpleForm busy={saveMon.isPending} initial={{ reading_date: today() }} onSave={(v) => saveMon.mutate({ ...v, patient_id: patientId })}
              fields={[{ k: "reading_date", label: "date", type: "date" }, { k: "ferritin", label: "ferritin", type: "number" }, { k: "hb", label: "hb", type: "number" },
                { k: "alt", label: "alt", type: "number" }, { k: "creatinine", label: "creatinine", type: "number" }, { k: "notes", label: "notes" }]} />
          </CardContent></Card>
          {chartData.length > 0 && <Card><CardHeader><CardTitle className="text-base text-start">{t("ferritin")} {t("trend")}</CardTitle></CardHeader><CardContent className="h-64" dir="ltr">
            <ResponsiveContainer><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis />
              <Tooltip /><ReferenceLine y={2500} stroke="hsl(var(--destructive))" strokeDasharray="4 4" /><ReferenceLine y={1000} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
              <Line dataKey="ferritin" name={t("ferritin")} stroke="hsl(var(--primary))" />
            </LineChart></ResponsiveContainer></CardContent></Card>}
          <p className="text-sm text-muted-foreground text-start">{t("labSynced")}</p>
          <Card><CardContent className="pt-6"><RecordTable rows={monitoring} cols={[
            { k: "reading_date", label: "date" },
            { k: "source", label: "source", render: (r) => <Badge variant={r.source === "lab" ? "default" : "outline"}>{t(r.source === "lab" ? "fromLab" : "manual")}</Badge> }, { k: "ferritin", label: "ferritin" }, { k: "hb", label: "hb" }, { k: "alt", label: "alt" }, { k: "creatinine", label: "creatinine" }]} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="sponsorship" className="space-y-4">
          <Card><CardContent className="pt-6">
            <SimpleForm busy={saveSpon.isPending} initial={{ fund_type: "zakat", coverage_pct: 100, start_date: today() }}
              onSave={(v) => saveSpon.mutate({ ...v, patient_id: patientId, is_active: true })}
              fields={[{ k: "sponsor_name", label: "sponsor" }, { k: "fund_type", label: "fundType", options: ["zakat", "sadaqah", "corporate", "individual"] },
                { k: "coverage_pct", label: "coverage", type: "number" }, { k: "monthly_cap", label: "monthlyCap", type: "number" },
                { k: "start_date", label: "start", type: "date" }, { k: "end_date", label: "end", type: "date" }, { k: "notes", label: "notes" }]} />
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base text-start">{t("sponsorStatement")}</CardTitle></CardHeader><CardContent>
            <RecordTable rows={sponsors} cols={[
              { k: "sponsor_name", label: "sponsor" }, { k: "fund_type", label: "fundType", render: (r) => t(r.fund_type) },
              { k: "coverage_pct", label: "coverage", render: (r) => `${r.coverage_pct}%` }, { k: "start_date", label: "start" },
              { k: "is_active", label: "status", render: (r) => <Button size="sm" variant="outline" onClick={() => saveSpon.mutate({ id: r.id, is_active: !r.is_active })}>{r.is_active ? t("active") : t("inactive")}</Button> },
              { k: "total", label: "totalCovered", render: (r) => visits.filter((v: any) => v.sponsorship_id === r.id).reduce((s: number, v: any) => s + Number(v.sponsor_covered || 0), 0).toLocaleString() },
            ]} />
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
