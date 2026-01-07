import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Vitals } from "@/hooks/useConsultations";
import { Activity, Heart, Thermometer, Weight, Ruler, Wind } from "lucide-react";

interface VitalsFormProps {
  vitals: Vitals;
  onChange: (vitals: Vitals) => void;
  readOnly?: boolean;
}

export function VitalsForm({ vitals, onChange, readOnly = false }: VitalsFormProps) {
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>(vitals.temperature_unit || 'F');

  const updateVitals = (updates: Partial<Vitals>) => {
    const newVitals = { ...vitals, ...updates };
    
    // Auto-calculate BMI if weight and height are present
    if (newVitals.weight && newVitals.height) {
      const heightInMeters = newVitals.height / 100;
      newVitals.bmi = Math.round((newVitals.weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    
    onChange(newVitals);
  };

  const handleBPChange = (type: 'systolic' | 'diastolic', value: string) => {
    const numValue = parseInt(value) || 0;
    updateVitals({
      blood_pressure: {
        systolic: type === 'systolic' ? numValue : (vitals.blood_pressure?.systolic || 0),
        diastolic: type === 'diastolic' ? numValue : (vitals.blood_pressure?.diastolic || 0),
      },
    });
  };

  const setNormalVitals = () => {
    updateVitals({
      blood_pressure: { systolic: 120, diastolic: 80 },
      pulse: 72,
      temperature: tempUnit === 'F' ? 98.6 : 37,
      temperature_unit: tempUnit,
      respiratory_rate: 16,
      spo2: 98,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Vitals
          </CardTitle>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={setNormalVitals}>
              Set Normal Values
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              Blood Pressure
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="Sys"
                value={vitals.blood_pressure?.systolic || ""}
                onChange={(e) => handleBPChange('systolic', e.target.value)}
                className="w-16 text-center"
                disabled={readOnly}
              />
              <span>/</span>
              <Input
                type="number"
                placeholder="Dia"
                value={vitals.blood_pressure?.diastolic || ""}
                onChange={(e) => handleBPChange('diastolic', e.target.value)}
                className="w-16 text-center"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">mmHg</span>
            </div>
          </div>

          {/* Pulse */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-pink-500" />
              Pulse
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="72"
                value={vitals.pulse || ""}
                onChange={(e) => updateVitals({ pulse: parseInt(e.target.value) || undefined })}
                className="w-20"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">bpm</span>
            </div>
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperature
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                placeholder={tempUnit === 'F' ? "98.6" : "37"}
                value={vitals.temperature || ""}
                onChange={(e) => updateVitals({ 
                  temperature: parseFloat(e.target.value) || undefined,
                  temperature_unit: tempUnit,
                })}
                className="w-20"
                disabled={readOnly}
              />
              <Select
                value={tempUnit}
                onValueChange={(v) => {
                  setTempUnit(v as 'F' | 'C');
                  updateVitals({ temperature_unit: v as 'F' | 'C' });
                }}
                disabled={readOnly}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">°F</SelectItem>
                  <SelectItem value="C">°C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SpO2 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Wind className="h-4 w-4 text-blue-500" />
              SpO2
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="98"
                value={vitals.spo2 || ""}
                onChange={(e) => updateVitals({ spo2: parseInt(e.target.value) || undefined })}
                className="w-20"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Weight className="h-4 w-4 text-green-500" />
              Weight
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                step="0.1"
                placeholder="70"
                value={vitals.weight || ""}
                onChange={(e) => updateVitals({ weight: parseFloat(e.target.value) || undefined })}
                className="w-20"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Ruler className="h-4 w-4 text-purple-500" />
              Height
            </Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="170"
                value={vitals.height || ""}
                onChange={(e) => updateVitals({ height: parseInt(e.target.value) || undefined })}
                className="w-20"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">cm</span>
            </div>
          </div>

          {/* Respiratory Rate */}
          <div className="space-y-2">
            <Label>Respiratory Rate</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                placeholder="16"
                value={vitals.respiratory_rate || ""}
                onChange={(e) => updateVitals({ respiratory_rate: parseInt(e.target.value) || undefined })}
                className="w-20"
                disabled={readOnly}
              />
              <span className="text-sm text-muted-foreground">/min</span>
            </div>
          </div>

          {/* BMI (calculated) */}
          <div className="space-y-2">
            <Label>BMI</Label>
            <div className="flex items-center gap-1">
              <Input
                type="text"
                value={vitals.bmi || "-"}
                className="w-20 bg-muted"
                disabled
              />
              <span className="text-sm text-muted-foreground">kg/m²</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
