import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GCSCalculator } from "./GCSCalculator";
import { useCreateTraumaAssessment } from "@/hooks/useEmergency";
import { Loader2, AlertTriangle, Plus, Trash2 } from "lucide-react";

interface TraumaAssessmentFormProps {
  erId: string;
  onSuccess?: () => void;
}

interface Injury {
  id: string;
  body_part: string;
  injury_type: string;
  severity: string;
  description: string;
}

const BODY_PARTS = [
  "Head", "Face", "Neck", "Chest", "Abdomen", "Pelvis", "Spine",
  "Left Arm", "Right Arm", "Left Leg", "Right Leg", "Left Hand", "Right Hand",
  "Left Foot", "Right Foot", "Multiple"
];

const INJURY_TYPES = [
  "Laceration", "Contusion", "Abrasion", "Fracture", "Dislocation",
  "Burn", "Penetrating", "Blunt", "Crush", "Avulsion"
];

const MECHANISMS = [
  "Motor Vehicle Accident (MVA)",
  "Motorcycle Accident",
  "Pedestrian Hit",
  "Fall from Height",
  "Fall on Ground",
  "Assault/Violence",
  "Stab Wound",
  "Gunshot Wound",
  "Industrial Accident",
  "Sports Injury",
  "Burn Injury",
  "Other"
];

export const TraumaAssessmentForm = ({ erId, onSuccess }: TraumaAssessmentFormProps) => {
  const [gcsValues, setGcsValues] = useState({ eye: 0, verbal: 0, motor: 0, total: 0 });
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [mechanism, setMechanism] = useState("");
  const [notes, setNotes] = useState("");
  const createMutation = useCreateTraumaAssessment();

  const addInjury = () => {
    setInjuries([
      ...injuries,
      {
        id: crypto.randomUUID(),
        body_part: "",
        injury_type: "",
        severity: "moderate",
        description: "",
      },
    ]);
  };

  const updateInjury = (id: string, field: keyof Injury, value: string) => {
    setInjuries(
      injuries.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const removeInjury = (id: string) => {
    setInjuries(injuries.filter((i) => i.id !== id));
  };

  const handleSubmit = async () => {
    await createMutation.mutateAsync({
      er_id: erId,
      mechanism,
      gcs_eye: gcsValues.eye || null,
      gcs_verbal: gcsValues.verbal || null,
      gcs_motor: gcsValues.motor || null,
      gcs_total: gcsValues.total || null,
      injuries: injuries.length > 0 ? injuries : null,
      notes: notes || null,
    });
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      {/* Mechanism of Injury */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Mechanism of Injury
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={mechanism} onValueChange={setMechanism}>
            <SelectTrigger>
              <SelectValue placeholder="Select mechanism" />
            </SelectTrigger>
            <SelectContent>
              {MECHANISMS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* GCS Calculator */}
      <GCSCalculator onChange={setGcsValues} />

      {/* Injuries */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Injuries</CardTitle>
          <Button size="sm" variant="outline" onClick={addInjury}>
            <Plus className="h-4 w-4 mr-1" />
            Add Injury
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {injuries.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No injuries recorded. Click "Add Injury" to start.
            </p>
          ) : (
            injuries.map((injury, index) => (
              <div
                key={injury.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <Label className="text-xs">Body Part</Label>
                  <Select
                    value={injury.body_part}
                    onValueChange={(v) => updateInjury(injury.id, "body_part", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_PARTS.map((part) => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={injury.injury_type}
                    onValueChange={(v) => updateInjury(injury.id, "injury_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {INJURY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Severity</Label>
                  <Select
                    value={injury.severity}
                    onValueChange={(v) => updateInjury(injury.id, "severity", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={injury.description}
                    onChange={(e) => updateInjury(injury.id, "description", e.target.value)}
                    placeholder="Brief description"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => removeInjury(injury.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations, treatment given, etc."
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Trauma Assessment
        </Button>
      </div>
    </div>
  );
};
