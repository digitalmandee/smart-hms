import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Eye, Mic, Hand, Brain } from "lucide-react";

interface GCSCalculatorProps {
  initialValues?: {
    eye: number;
    verbal: number;
    motor: number;
  };
  onChange?: (values: { eye: number; verbal: number; motor: number; total: number }) => void;
  readOnly?: boolean;
}

const eyeResponses = [
  { value: 4, label: "Spontaneous", description: "Eyes open spontaneously" },
  { value: 3, label: "To Voice", description: "Eyes open to verbal command" },
  { value: 2, label: "To Pain", description: "Eyes open to painful stimuli" },
  { value: 1, label: "None", description: "No eye opening" },
];

const verbalResponses = [
  { value: 5, label: "Oriented", description: "Oriented and converses" },
  { value: 4, label: "Confused", description: "Disoriented and converses" },
  { value: 3, label: "Inappropriate", description: "Inappropriate words" },
  { value: 2, label: "Incomprehensible", description: "Incomprehensible sounds" },
  { value: 1, label: "None", description: "No verbal response" },
];

const motorResponses = [
  { value: 6, label: "Obeys", description: "Obeys commands" },
  { value: 5, label: "Localizes", description: "Localizes painful stimuli" },
  { value: 4, label: "Withdraws", description: "Withdraws from pain" },
  { value: 3, label: "Flexion", description: "Abnormal flexion (decorticate)" },
  { value: 2, label: "Extension", description: "Extension (decerebrate)" },
  { value: 1, label: "None", description: "No motor response" },
];

export const GCSCalculator = ({ initialValues, onChange, readOnly = false }: GCSCalculatorProps) => {
  const [eye, setEye] = useState(initialValues?.eye || 0);
  const [verbal, setVerbal] = useState(initialValues?.verbal || 0);
  const [motor, setMotor] = useState(initialValues?.motor || 0);

  const total = eye + verbal + motor;

  useEffect(() => {
    if (onChange && eye > 0 && verbal > 0 && motor > 0) {
      onChange({ eye, verbal, motor, total });
    }
  }, [eye, verbal, motor, total, onChange]);

  const getSeverity = () => {
    if (total === 0) return { label: "Not Assessed", color: "text-muted-foreground", bg: "bg-muted" };
    if (total <= 8) return { label: "Severe (Coma)", color: "text-red-600", bg: "bg-red-100 dark:bg-red-950" };
    if (total <= 12) return { label: "Moderate", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-950" };
    return { label: "Mild", color: "text-green-600", bg: "bg-green-100 dark:bg-green-950" };
  };

  const severity = getSeverity();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Glasgow Coma Scale
          </CardTitle>
          <div className={cn("px-4 py-2 rounded-lg font-bold text-2xl", severity.bg, severity.color)}>
            {total > 0 ? total : "—"}/15
          </div>
        </div>
        <p className={cn("text-sm font-medium", severity.color)}>
          {severity.label}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eye Response */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="h-4 w-4" />
            Eye Response (E)
            {eye > 0 && <span className="text-primary">= {eye}</span>}
          </Label>
          <RadioGroup
            value={eye.toString()}
            onValueChange={(v) => !readOnly && setEye(parseInt(v))}
            className="grid grid-cols-2 md:grid-cols-4 gap-2"
            disabled={readOnly}
          >
            {eyeResponses.map((response) => (
              <Label
                key={response.value}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                  eye === response.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <RadioGroupItem value={response.value.toString()} className="sr-only" />
                <div>
                  <div className="font-medium text-sm">
                    {response.value}. {response.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {response.description}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Verbal Response */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Mic className="h-4 w-4" />
            Verbal Response (V)
            {verbal > 0 && <span className="text-primary">= {verbal}</span>}
          </Label>
          <RadioGroup
            value={verbal.toString()}
            onValueChange={(v) => !readOnly && setVerbal(parseInt(v))}
            className="grid grid-cols-2 md:grid-cols-5 gap-2"
            disabled={readOnly}
          >
            {verbalResponses.map((response) => (
              <Label
                key={response.value}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                  verbal === response.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <RadioGroupItem value={response.value.toString()} className="sr-only" />
                <div>
                  <div className="font-medium text-sm">
                    {response.value}. {response.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {response.description}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Motor Response */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Hand className="h-4 w-4" />
            Motor Response (M)
            {motor > 0 && <span className="text-primary">= {motor}</span>}
          </Label>
          <RadioGroup
            value={motor.toString()}
            onValueChange={(v) => !readOnly && setMotor(parseInt(v))}
            className="grid grid-cols-2 md:grid-cols-3 gap-2"
            disabled={readOnly}
          >
            {motorResponses.map((response) => (
              <Label
                key={response.value}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all",
                  motor === response.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                )}
              >
                <RadioGroupItem value={response.value.toString()} className="sr-only" />
                <div>
                  <div className="font-medium text-sm">
                    {response.value}. {response.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {response.description}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};
