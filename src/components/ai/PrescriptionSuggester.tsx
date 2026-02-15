import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIChat } from "@/hooks/useAIChat";
import { Pill, Loader2, Check, AlertTriangle } from "lucide-react";

interface PrescriptionItem {
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  warning?: string;
}

interface PrescriptionSuggesterProps {
  diagnosis: string;
  patientContext?: Record<string, unknown>;
  onAcceptPrescription: (items: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions: string;
  }>) => void;
}

export function PrescriptionSuggester({ diagnosis, patientContext, onAcceptPrescription }: PrescriptionSuggesterProps) {
  const [suggestions, setSuggestions] = useState<PrescriptionItem[]>([]);
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());
  const [generated, setGenerated] = useState(false);

  const { messages, isLoading, sendMessage } = useAIChat({
    mode: "doctor_assist",
    patientContext: { ...patientContext, diagnosis },
  });

  const handleGenerate = async () => {
    await sendMessage(
      `Based on the diagnosis "${diagnosis}" and patient context, suggest medications. Return ONLY a JSON array with objects containing: medicine_name, dosage, frequency, duration, route, warning (optional). Example: [{"medicine_name":"Amoxicillin","dosage":"500mg","frequency":"TDS","duration":"7 days","route":"Oral"}]. No other text.`
    );
    setGenerated(true);
  };

  // Parse suggestions from last assistant message
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  if (lastAssistant?.content && generated && !isLoading && suggestions.length === 0) {
    try {
      const match = lastAssistant.content.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as PrescriptionItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSuggestions(parsed);
        }
      }
    } catch {
      // If JSON parse fails, show raw content
    }
  }

  const handleAcceptItem = (index: number) => {
    setAcceptedIndices((prev) => new Set(prev).add(index));
    const item = suggestions[index];
    onAcceptPrescription([{
      medicine_name: item.medicine_name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantity: 1,
      instructions: item.route ? `Route: ${item.route}` : "",
    }]);
  };

  const handleAcceptAll = () => {
    const allIndices = new Set(suggestions.map((_, i) => i));
    setAcceptedIndices(allIndices);
    onAcceptPrescription(
      suggestions.map((item) => ({
        medicine_name: item.medicine_name,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: 1,
        instructions: item.route ? `Route: ${item.route}` : "",
      }))
    );
  };

  if (!diagnosis) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Pill className="h-4 w-4 text-green-500" />
          AI Prescription Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!generated ? (
          <Button onClick={handleGenerate} disabled={isLoading} size="sm" variant="outline" className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pill className="h-4 w-4 mr-2" />}
            Suggest Medications
          </Button>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
          </div>
        ) : suggestions.length > 0 ? (
          <>
            {suggestions.map((item, i) => (
              <div key={i} className="p-2 rounded border text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.medicine_name}</span>
                  {!acceptedIndices.has(i) ? (
                    <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleAcceptItem(i)}>
                      <Check className="h-3 w-3 mr-1" /> Add
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Added</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.dosage} · {item.frequency} · {item.duration} {item.route && `· ${item.route}`}
                </p>
                {item.warning && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {item.warning}
                  </p>
                )}
              </div>
            ))}
            <Button size="sm" onClick={handleAcceptAll} className="w-full" disabled={acceptedIndices.size === suggestions.length}>
              <Check className="h-4 w-4 mr-2" /> Accept All
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            {lastAssistant?.content || "No suggestions generated."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
