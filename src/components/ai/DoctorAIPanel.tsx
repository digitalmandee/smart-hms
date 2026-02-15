import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PatientAIChat } from "./PatientAIChat";
import { Bot, ChevronDown, ChevronUp, Stethoscope, FileText, TestTube } from "lucide-react";

interface DoctorAIPanelProps {
  patientContext?: Record<string, unknown>;
  onSuggestDiagnosis?: (text: string) => void;
  onSuggestNotes?: (text: string) => void;
}

export function DoctorAIPanel({ patientContext, onSuggestDiagnosis, onSuggestNotes }: DoctorAIPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2 hover:bg-muted/50 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Clinical Assistant
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              <QuickPromptButton
                icon={Stethoscope}
                label="Suggest Diagnosis"
              />
              <QuickPromptButton
                icon={FileText}
                label="SOAP Note"
              />
              <QuickPromptButton
                icon={TestTube}
                label="Suggest Labs"
              />
            </div>
            <PatientAIChat
              mode="doctor_assist"
              patientContext={patientContext}
              compact
              className="h-[400px]"
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function QuickPromptButton({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Button variant="outline" size="sm" className="text-xs gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Button>
  );
}
