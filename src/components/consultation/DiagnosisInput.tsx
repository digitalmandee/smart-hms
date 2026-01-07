import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ClipboardList } from "lucide-react";

interface DiagnosisInputProps {
  diagnosis: string;
  onDiagnosisChange: (value: string) => void;
  clinicalNotes: string;
  onClinicalNotesChange: (value: string) => void;
  readOnly?: boolean;
}

export function DiagnosisInput({
  diagnosis,
  onDiagnosisChange,
  clinicalNotes,
  onClinicalNotesChange,
  readOnly = false,
}: DiagnosisInputProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Diagnosis & Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Textarea
            id="diagnosis"
            placeholder="Enter diagnosis..."
            value={diagnosis}
            onChange={(e) => onDiagnosisChange(e.target.value)}
            rows={2}
            disabled={readOnly}
          />
        </div>

        {/* Clinical Notes */}
        <div className="space-y-2">
          <Label htmlFor="clinical-notes">Clinical Notes</Label>
          <Textarea
            id="clinical-notes"
            placeholder="Additional clinical notes, observations, examination findings..."
            value={clinicalNotes}
            onChange={(e) => onClinicalNotesChange(e.target.value)}
            rows={4}
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}
