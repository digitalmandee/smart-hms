import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Vitals } from "@/hooks/useConsultations";
import { VitalsForm } from "./VitalsForm";
import { Activity, Edit } from "lucide-react";

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
  const [dialogOpen, setDialogOpen] = useState(false);

  const bp = vitals.blood_pressure;

  return (
    <>
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
            {!readOnly && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setDialogOpen(true)}>
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {bp && (bp.systolic || bp.diastolic) && (
              <VitalBadge label="BP" value={`${bp.systolic || '-'}/${bp.diastolic || '-'}`} unit="mmHg" color="text-red-600 border-red-200" />
            )}
            <VitalBadge label="P" value={vitals.pulse} unit="bpm" color="text-pink-600 border-pink-200" />
            <VitalBadge label="T" value={vitals.temperature} unit={`°${vitals.temperature_unit || 'F'}`} color="text-orange-600 border-orange-200" />
            <VitalBadge label="SpO₂" value={vitals.spo2} unit="%" color="text-blue-600 border-blue-200" />
            <VitalBadge label="RR" value={vitals.respiratory_rate} unit="/min" color="text-teal-600 border-teal-200" />
            <VitalBadge label="Wt" value={vitals.weight} unit="kg" color="text-green-600 border-green-200" />
            <VitalBadge label="Ht" value={vitals.height} unit="cm" color="text-purple-600 border-purple-200" />
            {vitals.bmi && (
              <VitalBadge label="BMI" value={vitals.bmi} unit="kg/m²" color="text-indigo-600 border-indigo-200" />
            )}
            {!bp && !vitals.pulse && !vitals.temperature && (
              <span className="text-xs text-muted-foreground italic">No vitals recorded</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Edit Vitals
            </DialogTitle>
          </DialogHeader>
          <VitalsForm vitals={vitals} onChange={onChange} embedded />
        </DialogContent>
      </Dialog>
    </>
  );
}