import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Plus, Search, Star, ChevronRight, X, RotateCcw, Trash2 } from "lucide-react";
import { SurfaceKey, SURFACE_KEYS, isPosterior, isUpperTooth } from "@/lib/dental/constants";
import { useDentalT } from "@/lib/dental/i18n";
import type { ChartFinding, FindingDef } from "@/hooks/useDentalWorkspace";

export const FINDING_STATUSES = ["finding", "planned", "in_progress", "completed", "existing", "watch"];

interface Props {
  catalog: FindingDef[];
  selectedTeeth: number[];
  activeSurfaces: SurfaceKey[];
  toggleSurface: (s: SurfaceKey) => void;
  toothFindings: ChartFinding[];
  onChart: (finding: FindingDef, status: string, notes: string) => void;
  onRepeat: () => void;
  lastFinding?: FindingDef | null;
  onCloseFinding: (f: ChartFinding) => void;
  onReopenFinding: (f: ChartFinding) => void;
  onDeleteFinding: (f: ChartFinding) => void;
}

function surfaceLetter(k: SurfaceKey, tooth?: number) {
  if (!tooth) return k;
  if (k === "O") return isPosterior(tooth) ? "O" : "I";
  if (k === "B") return isPosterior(tooth) ? "B" : "F";
  if (k === "L") return isUpperTooth(tooth) ? "P" : "L";
  return k;
}

export default function FindingPanel({
  catalog,
  selectedTeeth,
  activeSurfaces,
  toggleSurface,
  toothFindings,
  onChart,
  onRepeat,
  lastFinding,
  onCloseFinding,
  onReopenFinding,
  onDeleteFinding,
}: Props) {
  const { dt, language } = useDentalT();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<FindingDef | null>(null);
  const [status, setStatus] = useState("finding");
  const [notes, setNotes] = useState("");
  const [allOpen, setAllOpen] = useState(false);

  const label = (f: FindingDef) =>
    (language === "ar" && f.name_ar) || (language === "ur" && f.name_ur) || f.name;

  const favourites = useMemo(() => catalog.filter((f) => f.is_favourite), [catalog]);
  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((f) => label(f).toLowerCase().includes(q) || (f.cdt_code || "").toLowerCase().includes(q))
      .slice(0, 12);
  }, [search, catalog, language]);

  const grouped = useMemo(() => {
    const g: Record<string, FindingDef[]> = {};
    catalog.forEach((f) => {
      g[f.category] = g[f.category] || [];
      g[f.category].push(f);
    });
    return g;
  }, [catalog]);

  const primaryTooth = selectedTeeth[0];
  const disabled = !selectedTeeth.length || !picked;

  const chip = (f: FindingDef) => (
    <button
      key={f.id}
      type="button"
      onClick={() => setPicked(f)}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-all",
        picked?.id === f.id ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:bg-accent"
      )}
    >
      <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: f.color }} />
      {label(f)}
      {f.cdt_code && <span className="text-[9px] text-muted-foreground">{f.cdt_code}</span>}
    </button>
  );

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {selectedTeeth.length
            ? `${dt("dental.tooth")} ${selectedTeeth.join(", ")}`
            : dt("dw.selectTooth")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{dt("dw.surfaces")}</p>
          <div className="flex gap-1.5">
            {SURFACE_KEYS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSurface(s)}
                className={cn(
                  "w-8 h-8 rounded-full border text-xs font-semibold transition-all",
                  activeSurfaces.includes(s)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {surfaceLetter(s, primaryTooth)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-muted-foreground">{dt("dw.finding")}</p>
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onRepeat} disabled={!lastFinding}>
              {dt("dw.repeat")}
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dt("dw.searchFindings")}
              className="pl-8"
            />
          </div>
          {!!results.length && (
            <div className="mt-2 flex flex-wrap gap-1.5">{results.map(chip)}</div>
          )}
        </div>

        <div>
          <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
            <Star className="h-3 w-3" /> {dt("dw.favourites")}
          </p>
          <div className="flex flex-wrap gap-1.5">{favourites.map(chip)}</div>
        </div>

        <Collapsible open={allOpen} onOpenChange={setAllOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", allOpen && "rotate-90")} />
            {dt("dw.allFindings")} ({catalog.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{cat.replace(/_/g, " ")}</p>
                <div className="flex flex-wrap gap-1.5">{items.map(chip)}</div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{dt("dw.status")}</p>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FINDING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{dt(`dw.status.${s}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{dt("dw.notes")}</p>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <Button
          className="w-full gap-1.5"
          disabled={disabled}
          onClick={() => {
            if (!picked) return;
            onChart(picked, status, notes);
            setNotes("");
          }}
        >
          <Plus className="h-4 w-4" /> {dt("dw.chart")}
        </Button>

        {!!selectedTeeth.length && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">{dt("dw.chartedFindings")}</p>
            {!toothFindings.length ? (
              <p className="text-xs text-muted-foreground">{dt("dw.noFindings")}</p>
            ) : (
              <div className="space-y-1.5">
                {toothFindings.map((f) => (
                  <div
                    key={f.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border text-xs",
                      f.closed_at && "opacity-60"
                    )}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color || "#dc2626" }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {f.finding_name || f.finding_key}
                        {f.surface ? ` · ${surfaceLetter(f.surface as SurfaceKey, f.tooth_number)}` : ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.tooth_number} · {dt(`dw.status.${f.status}`)} · {new Date(f.charted_at).toLocaleDateString()}
                      </p>
                    </div>
                    {f.closed_at ? (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onReopenFinding(f)}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCloseFinding(f)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDeleteFinding(f)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {picked && (
          <Badge variant="outline" className="gap-1.5 font-normal">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: picked.color }} />
            {label(picked)} {picked.cdt_code}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
