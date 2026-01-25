import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Droplet } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface VitalEntry {
  time: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  pulse?: number;
  spo2?: number;
  etco2?: number;
  temp?: number;
}

interface VitalsChartProps {
  vitals: VitalEntry[];
  className?: string;
}

export function VitalsChart({ vitals, className }: VitalsChartProps) {
  const chartData = useMemo(() => {
    if (!vitals || vitals.length === 0) return [];
    
    return vitals
      .map((v) => ({
        ...v,
        timeLabel: v.time ? format(parseISO(v.time), "HH:mm") : "",
        bp: v.bp_systolic && v.bp_diastolic 
          ? `${v.bp_systolic}/${v.bp_diastolic}` 
          : undefined,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [vitals]);

  const latestVital = chartData[chartData.length - 1];

  if (chartData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vitals Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No vitals recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vitals Trend
          </CardTitle>
          {latestVital && (
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                {latestVital.pulse || "--"} bpm
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Droplet className="h-3 w-3 text-blue-500" />
                {latestVital.spo2 || "--"}%
              </Badge>
              <Badge variant="outline">
                BP: {latestVital.bp || "--"}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="left" 
                domain={[40, 200]} 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[80, 100]} 
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bp_systolic"
                name="Systolic BP"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="bp_diastolic"
                name="Diastolic BP"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="pulse"
                name="Pulse"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="spo2"
                name="SpO2"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
