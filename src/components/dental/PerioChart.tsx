import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dentition, getAllTeeth, PERIO_SITES } from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";
import { usePerioChart, useUpsertPerioSite } from "@/hooks/useDentalCharting";

interface Props {
  patientId: string;
  dentition: Dentition;
}

export default function PerioChart({ patientId, dentition }: Props) {
  const { dt } = useDentalT();
  const { data: rows } = usePerioChart(patientId);
  const upsert = useUpsertPerioSite();
  const teeth = getAllTeeth(dentition);

  const map = useMemo(() => {
    const m: Record<string, any> = {};
    (rows || []).forEach((r) => { m[`${r.tooth_number}-${r.site}`] = r; });
    return m;
  }, [rows]);

  const stats = useMemo(() => {
    const list = rows || [];
    const depths = list.map((r) => r.pocket_depth).filter((d: any) => typeof d === "number");
    const avg = depths.length ? depths.reduce((a: number, b: number) => a + b, 0) / depths.length : 0;
    const total = teeth.length * PERIO_SITES.length;
    const bleeding = list.filter((r) => r.bleeding).length;
    const plaque = list.filter((r) => r.plaque).length;
    return {
      avg: avg.toFixed(1),
      bleedingPct: total ? Math.round((bleeding / total) * 100) : 0,
      plaquePct: total ? Math.round((plaque / total) * 100) : 0,
    };
  }, [rows, teeth.length]);

  const save = (tooth: number, site: string, patch: any) => {
    const existing = map[`${tooth}-${site}`] || {};
    upsert.mutate({
      patient_id: patientId,
      tooth_number: tooth,
      site,
      pocket_depth: existing.pocket_depth ?? null,
      recession: existing.recession ?? null,
      bleeding: !!existing.bleeding,
      suppuration: !!existing.suppuration,
      plaque: !!existing.plaque,
      ...patch,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex flex-wrap items-center gap-4">
          <span>{dt("dental.perioChart")}</span>
          <span className="text-xs font-normal text-muted-foreground">{dt("dental.avgPocket")}: {stats.avg} mm</span>
          <span className="text-xs font-normal text-muted-foreground">{dt("dental.bleedingIndex")}: {stats.bleedingPct}%</span>
          <span className="text-xs font-normal text-muted-foreground">{dt("dental.plaqueIndex")}: {stats.plaquePct}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-1 text-start sticky start-0 bg-background">{dt("dental.tooth")}</th>
              {PERIO_SITES.map((s) => (
                <th key={s} className="p-1 text-center min-w-[70px]">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teeth.map((n) => (
              <tr key={n} className="border-b hover:bg-muted/40">
                <td className="p-1 font-semibold sticky start-0 bg-background">{n}</td>
                {PERIO_SITES.map((s) => {
                  const r = map[`${n}-${s}`] || {};
                  const deep = (r.pocket_depth ?? 0) >= 4;
                  return (
                    <td key={s} className="p-1 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Input
                          type="number"
                          min={0}
                          max={15}
                          defaultValue={r.pocket_depth ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value === "" ? null : Number(e.target.value);
                            if (v !== (r.pocket_depth ?? null)) save(n, s, { pocket_depth: v });
                          }}
                          className={`h-7 w-11 px-1 text-center text-xs ${deep ? "text-red-600 font-bold" : ""}`}
                        />
                        <Checkbox
                          checked={!!r.bleeding}
                          onCheckedChange={(c) => save(n, s, { bleeding: !!c })}
                          title={dt("dental.bleeding")}
                          className="h-3.5 w-3.5 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
