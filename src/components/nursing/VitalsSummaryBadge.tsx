import { Heart, Thermometer, Activity } from 'lucide-react';

interface VitalsSummaryBadgeProps {
  vitals: any;
}

export function VitalsSummaryBadge({ vitals }: VitalsSummaryBadgeProps) {
  if (!vitals) return null;

  const bp = vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
    ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`
    : null;
  const pulse = vitals.pulse;
  const temp = vitals.temperature;

  return (
    <div className="flex flex-col gap-1 text-xs">
      {bp && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Activity className="h-3 w-3 text-red-500" />
          <span>{bp}</span>
        </div>
      )}
      {pulse && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Heart className="h-3 w-3 text-pink-500" />
          <span>{pulse} bpm</span>
        </div>
      )}
      {temp && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Thermometer className="h-3 w-3 text-orange-500" />
          <span>{temp}°F</span>
        </div>
      )}
    </div>
  );
}
