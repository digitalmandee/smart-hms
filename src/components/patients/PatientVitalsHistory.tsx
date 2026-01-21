import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientVitalsHistory, isAbnormalVital, VitalsRecord } from "@/hooks/usePatientVitals";
import { format } from "date-fns";
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  AlertTriangle,
  Stethoscope,
  Bed,
  FileText,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

interface PatientVitalsHistoryProps {
  patientId: string;
}

const sourceConfig = {
  opd: { label: "OPD Check-in", icon: Stethoscope, variant: "default" as const },
  consultation: { label: "Consultation", icon: FileText, variant: "secondary" as const },
  ipd: { label: "IPD Nursing", icon: Bed, variant: "outline" as const },
};

export function PatientVitalsHistory({ patientId }: PatientVitalsHistoryProps) {
  const { data: vitals, isLoading } = usePatientVitalsHistory(patientId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!vitals || vitals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-lg">No Vitals Recorded</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vitals will appear here after check-in or consultation.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data (last 10 readings, reversed for chronological order)
  const chartData = vitals
    .slice(0, 10)
    .reverse()
    .map((v) => ({
      date: format(new Date(v.recorded_at), "MMM dd"),
      systolic: v.blood_pressure_systolic,
      diastolic: v.blood_pressure_diastolic,
      pulse: v.pulse,
      temperature: v.temperature,
      spo2: v.spo2,
    }));

  const chartConfig = {
    systolic: { label: "Systolic", color: "hsl(var(--destructive))" },
    diastolic: { label: "Diastolic", color: "hsl(var(--primary))" },
    pulse: { label: "Pulse", color: "hsl(var(--chart-3))" },
    spo2: { label: "SpO2", color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="space-y-6">
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vitals Trends
          </CardTitle>
          <CardDescription>Last 10 readings</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="var(--color-systolic)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="var(--color-diastolic)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="pulse"
                stroke="var(--color-pulse)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Vitals History List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vitals History</CardTitle>
          <CardDescription>{vitals.length} recordings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vitals.map((vital) => (
            <VitalRecordCard key={vital.id} vital={vital} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function VitalRecordCard({ vital }: { vital: VitalsRecord }) {
  const config = sourceConfig[vital.source];
  const SourceIcon = config.icon;

  const hasAbnormal =
    isAbnormalVital('systolic', vital.blood_pressure_systolic) ||
    isAbnormalVital('diastolic', vital.blood_pressure_diastolic) ||
    isAbnormalVital('pulse', vital.pulse) ||
    isAbnormalVital('temperature', vital.temperature) ||
    isAbnormalVital('spo2', vital.spo2);

  return (
    <div className={`border rounded-lg p-4 ${hasAbnormal ? 'border-warning bg-warning/5' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant={config.variant} className="gap-1">
            <SourceIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          {hasAbnormal && (
            <Badge variant="outline" className="text-warning gap-1">
              <AlertTriangle className="h-3 w-3" />
              Abnormal
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {format(new Date(vital.recorded_at), "MMM dd, yyyy 'at' h:mm a")}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(vital.blood_pressure_systolic || vital.blood_pressure_diastolic) && (
          <VitalItem
            icon={<Heart className="h-4 w-4" />}
            label="Blood Pressure"
            value={`${vital.blood_pressure_systolic || '-'}/${vital.blood_pressure_diastolic || '-'}`}
            unit="mmHg"
            isAbnormal={
              isAbnormalVital('systolic', vital.blood_pressure_systolic) ||
              isAbnormalVital('diastolic', vital.blood_pressure_diastolic)
            }
          />
        )}

        {vital.pulse && (
          <VitalItem
            icon={<Activity className="h-4 w-4" />}
            label="Pulse"
            value={vital.pulse}
            unit="bpm"
            isAbnormal={isAbnormalVital('pulse', vital.pulse)}
          />
        )}

        {vital.temperature && (
          <VitalItem
            icon={<Thermometer className="h-4 w-4" />}
            label="Temperature"
            value={vital.temperature}
            unit="°C"
            isAbnormal={isAbnormalVital('temperature', vital.temperature)}
          />
        )}

        {vital.spo2 && (
          <VitalItem
            icon={<Droplets className="h-4 w-4" />}
            label="SpO2"
            value={vital.spo2}
            unit="%"
            isAbnormal={isAbnormalVital('spo2', vital.spo2)}
          />
        )}

        {vital.respiratory_rate && (
          <VitalItem
            icon={<Wind className="h-4 w-4" />}
            label="Resp. Rate"
            value={vital.respiratory_rate}
            unit="/min"
            isAbnormal={isAbnormalVital('respiratory_rate', vital.respiratory_rate)}
          />
        )}

        {vital.weight && (
          <VitalItem
            icon={<Scale className="h-4 w-4" />}
            label="Weight"
            value={vital.weight}
            unit="kg"
          />
        )}

        {vital.height && (
          <VitalItem
            icon={<Ruler className="h-4 w-4" />}
            label="Height"
            value={vital.height}
            unit="cm"
          />
        )}

        {vital.bmi && (
          <VitalItem
            icon={<Scale className="h-4 w-4" />}
            label="BMI"
            value={vital.bmi.toFixed(1)}
          />
        )}
      </div>

      {vital.notes && (
        <p className="text-sm text-muted-foreground mt-3 italic">
          "{vital.notes}"
        </p>
      )}
    </div>
  );
}

function VitalItem({
  icon,
  label,
  value,
  unit,
  isAbnormal,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  isAbnormal?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${isAbnormal ? 'text-warning' : ''}`}>
      <div className={`p-1.5 rounded ${isAbnormal ? 'bg-warning/20' : 'bg-muted'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
