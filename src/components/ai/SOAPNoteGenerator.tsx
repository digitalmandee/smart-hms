import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAIChat } from "@/hooks/useAIChat";
import { FileText, Loader2, Check } from "lucide-react";

interface SOAPNoteGeneratorProps {
  patientContext?: Record<string, unknown>;
  onAccept: (soapNote: string) => void;
}

export function SOAPNoteGenerator({ patientContext, onAccept }: SOAPNoteGeneratorProps) {
  const [sections, setSections] = useState({ subjective: "", objective: "", assessment: "", plan: "" });
  const [generated, setGenerated] = useState(false);

  const { messages, isLoading, sendMessage } = useAIChat({
    mode: "doctor_assist",
    patientContext,
  });

  const handleGenerate = async () => {
    await sendMessage(
      "Generate a SOAP note based on the patient context provided. Format your response with clear sections: **Subjective:**, **Objective:**, **Assessment:**, **Plan:**. Be concise and clinical."
    );
    setGenerated(true);
  };

  // Parse SOAP sections from the last assistant message
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();

  const parseSections = (text: string) => {
    const s = text.match(/subjective[:\s]*([\s\S]*?)(?=objective[:\s]|$)/i)?.[1]?.trim() || "";
    const o = text.match(/objective[:\s]*([\s\S]*?)(?=assessment[:\s]|$)/i)?.[1]?.trim() || "";
    const a = text.match(/assessment[:\s]*([\s\S]*?)(?=plan[:\s]|$)/i)?.[1]?.trim() || "";
    const p = text.match(/plan[:\s]*([\s\S]*?)$/i)?.[1]?.trim() || "";
    return { subjective: s, objective: o, assessment: a, plan: p };
  };

  // Update sections when new content arrives
  if (lastAssistant?.content && generated && !isLoading) {
    const parsed = parseSections(lastAssistant.content);
    if (parsed.subjective && sections.subjective !== parsed.subjective) {
      setSections(parsed);
    }
  }

  const fullNote = `S: ${sections.subjective}\nO: ${sections.objective}\nA: ${sections.assessment}\nP: ${sections.plan}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          SOAP Note Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!generated ? (
          <Button onClick={handleGenerate} disabled={isLoading} size="sm" className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate SOAP Note
          </Button>
        ) : isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Generating...
          </div>
        ) : (
          <>
            {(["subjective", "objective", "assessment", "plan"] as const).map((key) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs uppercase">{key}</Label>
                <Textarea
                  value={sections[key]}
                  onChange={(e) => setSections((prev) => ({ ...prev, [key]: e.target.value }))}
                  rows={2}
                  className="text-sm"
                />
              </div>
            ))}
            <Button size="sm" onClick={() => onAccept(fullNote)} className="w-full">
              <Check className="h-4 w-4 mr-2" /> Apply to Clinical Notes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
