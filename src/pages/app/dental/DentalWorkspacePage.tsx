import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Baby, User, Keyboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDentalT } from "@/lib/dental/i18n";
import { Dentition, SurfaceKey } from "@/lib/dental/constants";
import { Notation } from "@/lib/dental/notation";
import OdontogramArch from "@/components/dental/OdontogramArch";
import FindingPanel from "@/components/dental/FindingPanel";
import PerioChart from "@/components/dental/PerioChart";
import RecordSection from "@/components/dental/workspace/RecordSection";
import { RECORD_CONFIGS } from "@/components/dental/workspace/recordConfigs";
import PlanTab from "@/components/dental/workspace/PlanTab";
import ConsentTab from "@/components/dental/workspace/ConsentTab";
import LabOrdersTab from "@/components/dental/workspace/LabOrdersTab";
import ScansTab from "@/components/dental/workspace/ScansTab";
import BillingTab from "@/components/dental/workspace/BillingTab";
import {
  useFindingsCatalog,
  useChartFindings,
  useAddChartFinding,
  useUpdateChartFinding,
  useDeleteChartFinding,
  FindingDef,
} from "@/hooks/useDentalWorkspace";
import SEO from "@/components/SEO";

const RECORD_TABS = [
  "endodontics",
  "oral_surgery",
  "implantology",
  "orthodontics",
  "aligners",
  "ceph",
  "prosthodontics",
  "oral_medicine",
  "pediatric",
  "chairside",
  "postop",
] as const;

export default function DentalWorkspacePage() {
  const { patientId = "" } = useParams();
  const { dt, isRTL } = useDentalT();
  const { profile } = useAuth();

  const [dentition, setDentition] = useState<Dentition>("permanent");
  const [notation, setNotation] = useState<Notation>("fdi");
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [activeSurfaces, setActiveSurfaces] = useState<SurfaceKey[]>([]);
  const [lastFinding, setLastFinding] = useState<FindingDef | null>(null);

  const { data: patient } = useQuery({
    queryKey: ["dental-ws-patient", patientId, profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, patient_number, first_name, last_name, gender, date_of_birth, phone, blood_group, allergies")
        .eq("id", patientId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  const { data: catalog = [] } = useFindingsCatalog();
  const { data: findings = [] } = useChartFindings(patientId);
  const addFinding = useAddChartFinding();
  const updateFinding = useUpdateChartFinding();
  const deleteFinding = useDeleteChartFinding();

  const favourites = useMemo(() => catalog.filter((f) => f.is_favourite), [catalog]);

  const toothFindings = useMemo(
    () => findings.filter((f) => selectedTeeth.includes(f.tooth_number)),
    [findings, selectedTeeth]
  );

  const age = useMemo(() => {
    if (!patient?.date_of_birth) return null;
    const dob = new Date(patient.date_of_birth);
    return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
  }, [patient?.date_of_birth]);

  useEffect(() => {
    if (age !== null && age < 6) setDentition("primary");
  }, [age]);

  const chart = (finding: FindingDef, status: string, notes: string) => {
    if (!selectedTeeth.length) return;
    const surfaceScoped = finding.scope !== "tooth" && activeSurfaces.length > 0;
    const rows = selectedTeeth.flatMap((tooth) =>
      surfaceScoped
        ? activeSurfaces.map((s) => ({
            patient_id: patientId,
            tooth_number: tooth,
            surface: s,
            dentition,
            finding_key: finding.key,
            finding_name: finding.name,
            cdt_code: finding.cdt_code,
            color: finding.color,
            status,
            notes: notes || null,
          }))
        : [{
            patient_id: patientId,
            tooth_number: tooth,
            surface: null,
            dentition,
            finding_key: finding.key,
            finding_name: finding.name,
            cdt_code: finding.cdt_code,
            color: finding.color,
            status,
            notes: notes || null,
          }]
    );
    addFinding.mutate(rows);
    setLastFinding(finding);
  };

  const toggleTooth = (tooth: number, additive: boolean) => {
    setSelectedTeeth((prev) =>
      additive ? (prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]) : [tooth]
    );
  };

  const handleSurfaceClick = (tooth: number, surface: SurfaceKey, additive: boolean) => {
    toggleTooth(tooth, additive);
    setActiveSurfaces((prev) => (prev.includes(surface) ? prev.filter((s) => s !== surface) : additive ? [...prev, surface] : [surface]));
  };

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.key === "Escape") {
        setSelectedTeeth([]);
        setActiveSurfaces([]);
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 6 && favourites[n - 1] && selectedTeeth.length) {
        chart(favourites[n - 1], "finding", "");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [favourites, selectedTeeth, activeSurfaces, dentition, patientId]);

  const name = patient ? `${patient.first_name} ${patient.last_name}` : "";

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={`Dental Workspace — ${name || "Patient"}`}
        description="Odontogram charting, specialty dental records, treatment plans and billing in one workspace."
        path={`/app/dental/workspace/${patientId}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link to="/app/dental/workspace">
            <ArrowLeft className="h-4 w-4" /> {dt("dw.patients")}
          </Link>
        </Button>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-xl font-semibold">{name || dt("dw.workspace")}</h1>
          <p className="text-xs text-muted-foreground">
            {patient?.patient_number}
            {age !== null ? ` · ${age}y` : ""}
            {patient?.gender ? ` · ${patient.gender}` : ""}
            {patient?.phone ? ` · ${patient.phone}` : ""}
          </p>
        </div>
        {patient?.allergies && <Badge variant="destructive">{patient.allergies}</Badge>}
        {patient?.blood_group && <Badge variant="outline">{patient.blood_group}</Badge>}
        <Select value={notation} onValueChange={(v) => setNotation(v as Notation)}>
          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fdi">FDI</SelectItem>
            <SelectItem value="universal">Universal</SelectItem>
            <SelectItem value="palmer">Palmer</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-md border overflow-hidden">
          <Button
            variant={dentition === "permanent" ? "default" : "ghost"}
            size="sm"
            className="rounded-none gap-1.5"
            onClick={() => setDentition("permanent")}
          >
            <User className="h-4 w-4" /> {dt("dental.adult")}
          </Button>
          <Button
            variant={dentition === "primary" ? "default" : "ghost"}
            size="sm"
            className="rounded-none gap-1.5"
            onClick={() => setDentition("primary")}
          >
            <Baby className="h-4 w-4" /> {dt("dental.child")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="odontogram">
        <TabsList className="flex flex-wrap h-auto justify-start">
          <TabsTrigger value="odontogram">{dt("dw.tab.odontogram")}</TabsTrigger>
          <TabsTrigger value="perio">{dt("dw.tab.perio")}</TabsTrigger>
          <TabsTrigger value="plan">{dt("dw.tab.plan")}</TabsTrigger>
          {RECORD_TABS.map((t) => (
            <TabsTrigger key={t} value={t}>{dt(`dw.tab.${t}`)}</TabsTrigger>
          ))}
          <TabsTrigger value="scans">{dt("dw.tab.scans")}</TabsTrigger>
          <TabsTrigger value="cbct">{dt("dw.tab.cbct")}</TabsTrigger>
          <TabsTrigger value="lab">{dt("dw.tab.lab")}</TabsTrigger>
          <TabsTrigger value="consent">{dt("dw.tab.consent")}</TabsTrigger>
          <TabsTrigger value="billing">{dt("dw.tab.billing")}</TabsTrigger>
        </TabsList>

        <TabsContent value="odontogram" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{dt("dw.tab.odontogram")}</CardTitle>
                <p className="text-xs text-muted-foreground">{dt("dw.chartHint")}</p>
              </CardHeader>
              <CardContent>
                <OdontogramArch
                  dentition={dentition}
                  notation={notation}
                  findings={findings}
                  selectedTeeth={selectedTeeth}
                  activeSurfaces={activeSurfaces}
                  onToothClick={toggleTooth}
                  onSurfaceClick={handleSurfaceClick}
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {catalog
                    .filter((f) => f.is_favourite)
                    .map((f) => (
                      <span key={f.id} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </span>
                    ))}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Keyboard className="h-3.5 w-3.5" /> {dt("dw.shortcutsHint")}
                </p>
              </CardContent>
            </Card>

            <FindingPanel
              catalog={catalog}
              selectedTeeth={selectedTeeth}
              activeSurfaces={activeSurfaces}
              toggleSurface={(s) =>
                setActiveSurfaces((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
              }
              toothFindings={toothFindings}
              onChart={chart}
              onRepeat={() => lastFinding && chart(lastFinding, "finding", "")}
              lastFinding={lastFinding}
              onCloseFinding={(f) =>
                updateFinding.mutate({ id: f.id, patient_id: patientId, closed_at: new Date().toISOString() })
              }
              onReopenFinding={(f) => updateFinding.mutate({ id: f.id, patient_id: patientId, closed_at: null })}
              onDeleteFinding={(f) => deleteFinding.mutate({ id: f.id, patient_id: patientId })}
            />
          </div>
        </TabsContent>

        <TabsContent value="perio" className="mt-4">
          <PerioChart patientId={patientId} dentition={dentition} />
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <PlanTab patientId={patientId} findings={findings} />
        </TabsContent>

        {RECORD_TABS.map((t) => {
          const cfg = RECORD_CONFIGS[t];
          return (
            <TabsContent key={t} value={t} className="mt-4">
              <RecordSection
                patientId={patientId}
                recordType={t}
                titleKey={cfg.titleKey}
                fields={cfg.fields}
                withTooth={cfg.withTooth}
                statuses={cfg.statuses}
              />
            </TabsContent>
          );
        })}

        <TabsContent value="scans" className="mt-4">
          <ScansTab patientId={patientId} titleKey="dw.tab.scans" />
        </TabsContent>
        <TabsContent value="cbct" className="mt-4">
          <ScansTab patientId={patientId} filter="cbct" titleKey="dw.tab.cbct" />
        </TabsContent>
        <TabsContent value="lab" className="mt-4">
          <LabOrdersTab patientId={patientId} />
        </TabsContent>
        <TabsContent value="consent" className="mt-4">
          <ConsentTab patientId={patientId} />
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingTab patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
