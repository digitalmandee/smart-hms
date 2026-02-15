import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ClipboardList, Check, Loader2 } from "lucide-react";

interface PatientIntakeSummaryProps {
  conversationId: string;
  onApplySymptoms?: (symptoms: string[]) => void;
  onApplyChiefComplaint?: (text: string) => void;
}

interface IntakeData {
  chief_complaint?: string;
  duration?: string;
  severity?: string;
  symptoms?: string[];
  history?: string;
  medications?: string;
  allergies?: string;
}

export function PatientIntakeSummary({ conversationId, onApplySymptoms, onApplyChiefComplaint }: PatientIntakeSummaryProps) {
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    async function fetchConversation() {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("messages")
        .eq("id", conversationId)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Parse the last assistant message for structured data
      const msgs = data.messages as Array<{ role: string; content: string }>;
      const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");

      if (lastAssistant?.content) {
        const content = lastAssistant.content;
        const parsed: IntakeData = {};

        const ccMatch = content.match(/chief\s*complaint[:\s]*(.*?)(?:\n|$)/i);
        if (ccMatch) parsed.chief_complaint = ccMatch[1].trim();

        const durMatch = content.match(/duration[:\s]*(.*?)(?:\n|$)/i);
        if (durMatch) parsed.duration = durMatch[1].trim();

        const sevMatch = content.match(/severity[:\s]*(.*?)(?:\n|$)/i);
        if (sevMatch) parsed.severity = sevMatch[1].trim();

        const sympMatch = content.match(/symptoms?[:\s]*(.*?)(?:\n|$)/i);
        if (sympMatch) {
          parsed.symptoms = sympMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        }

        const histMatch = content.match(/history[:\s]*(.*?)(?:\n|$)/i);
        if (histMatch) parsed.history = histMatch[1].trim();

        const medMatch = content.match(/medications?[:\s]*(.*?)(?:\n|$)/i);
        if (medMatch) parsed.medications = medMatch[1].trim();

        const allMatch = content.match(/allerg(?:y|ies)[:\s]*(.*?)(?:\n|$)/i);
        if (allMatch) parsed.allergies = allMatch[1].trim();

        setIntake(parsed);
      }
      setLoading(false);
    }

    fetchConversation();
  }, [conversationId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!intake) return null;

  const handleApply = () => {
    if (intake.chief_complaint) onApplyChiefComplaint?.(intake.chief_complaint);
    if (intake.symptoms?.length) onApplySymptoms?.(intake.symptoms);
    setApplied(true);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          AI Pre-Visit Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {intake.chief_complaint && (
          <div>
            <span className="font-medium text-muted-foreground">Chief Complaint: </span>
            {intake.chief_complaint}
          </div>
        )}
        {intake.duration && (
          <div>
            <span className="font-medium text-muted-foreground">Duration: </span>
            {intake.duration}
          </div>
        )}
        {intake.severity && (
          <div>
            <span className="font-medium text-muted-foreground">Severity: </span>
            <Badge variant="outline" className="text-xs">{intake.severity}</Badge>
          </div>
        )}
        {intake.symptoms && intake.symptoms.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Symptoms: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {intake.symptoms.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}
        {intake.allergies && (
          <div>
            <span className="font-medium text-muted-foreground">Allergies: </span>
            <span className="text-destructive">{intake.allergies}</span>
          </div>
        )}
        {intake.medications && (
          <div>
            <span className="font-medium text-muted-foreground">Current Medications: </span>
            {intake.medications}
          </div>
        )}
        {!applied ? (
          <Button size="sm" onClick={handleApply} className="w-full mt-2">
            <Check className="h-4 w-4 mr-2" /> Apply to Consultation
          </Button>
        ) : (
          <p className="text-xs text-green-600 font-medium text-center">✓ Applied to consultation</p>
        )}
      </CardContent>
    </Card>
  );
}
