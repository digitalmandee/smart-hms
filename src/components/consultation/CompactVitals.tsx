import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vitals } from "@/hooks/useConsultations";
import { VitalsForm } from "./VitalsForm";
import { Activity, ChevronDown, ChevronUp, Edit } from "lucide-react";

interface CompactVitalsProps {
  vitals: Vitals;
  nurseVitals?: Vitals;
  onChange: (vitals: Vitals) => void;
  readOnly?: boolean;
}

function VitalBadge({ label, value, unit, color }: { label: string; value?: number | string; unit?: string; color: string }) {
  if (!value) return null;
  return (
    <Badge variant="outline" className={`text-xs font-mono gap-1 ${color}`}>
      <span className="font-medium">{label}</span>
      <span className="font-bold">{value}</span>
      {unit && <span className="text-muted-foreground">{unit}</span>}
    </Badge>
  );
}

export function CompactVitals({ vitals, nurseVitals, onChange, readOnly = false }: CompactVitalsProps) {
  const hasNurseVitals = nurseVitals && Object.keys(nurseVitals).length > 0;
  const [expanded, setExpanded] = useState(false);

  const displayVitals = vitals;
  const bp = displayVitals.blood_pressure;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Vitals
            {hasNurseVitals && (
              <Badge variant="secondary" className="text-[10px]">Nurse Recorded</Badge>
            )}
          </CardTitle>
          {!expanded && !readOnly && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setExpanded(true)}>
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          )}
          {expanded && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setExpanded(false)}>
              <ChevronUp className="h-3 w-3" />
              Collapse
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Compact badge view */}
        {!expanded && (
          <div className="flex flex-wrap gap-2">
            {bp && (bp.systolic || bp.diastolic) && (
              <VitalBadge label="BP" value={`${bp.systolic || '-'}/${bp.diastolic || '-'}`} unit="mmHg" color="text-red-600 border-red-200" />
            )}
            <VitalBadge label="P" value={displayVitals.pulse} unit="bpm" color="text-pink-600 border-pink-200" />
            <VitalBadge label="T" value={displayVitals.temperature} unit={`°${displayVitals.temperature_unit || 'F'}`} color="text-orange-600 border-orange-200" />
            <VitalBadge label="SpO₂" value={displayVitals.spo2} unit="%" color="text-blue-600 border-blue-200" />
            <VitalBadge label="RR" value={displayVitals.respiratory_rate} unit="/min" color="text-teal-600 border-teal-200" />
            <VitalBadge label="Wt" value={displayVitals.weight} unit="kg" color="text-green-600 border-green-200" />
            <VitalBadge label="Ht" value={displayVitals.height} unit="cm" color="text-purple-600 border-purple-200" />
            {displayVitals.bmi && (
              <VitalBadge label="BMI" value={displayVitals.bmi} unit="kg/m²" color="text-indigo-600 border-indigo-200" />
            )}
            {!bp && !displayVitals.pulse && !displayVitals.temperature && (
              <span className="text-xs text-muted-foreground italic">No vitals recorded</span>
            )}
          </div>
        )}

        {/* Expanded full form */}
        {expanded && (
          <div className="mt-2">
            <VitalsForm vitals={vitals} onChange={onChange} readOnly={readOnly} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
