import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AIChatMessage } from "./AIChatMessage";
import { AISuggestionCard } from "./AISuggestionCard";
import { useAIChat } from "@/hooks/useAIChat";
import { useAISuggestion } from "@/hooks/useAISuggestion";
import { Stethoscope, ChevronDown, ChevronUp, FileText, TestTube, Send, Square, Trash2, Bot } from "lucide-react";

interface DoctorAIPanelProps {
  patientContext?: Record<string, unknown>;
  onSuggestDiagnosis?: (text: string) => void;
  onSuggestNotes?: (text: string) => void;
}

const QUICK_PROMPTS = {
  diagnosis: "Based on the patient context provided (symptoms, vitals, chief complaint), suggest a differential diagnosis with confidence levels and ICD-10 codes.",
  soap: "Generate a SOAP note based on the patient context provided. Format with clear sections: Subjective, Objective, Assessment, Plan.",
  labs: "Based on the symptoms and vitals, recommend appropriate laboratory tests with reasoning.",
};

export function DoctorAIPanel({ patientContext, onSuggestDiagnosis, onSuggestNotes }: DoctorAIPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lastQuickAction, setLastQuickAction] = useState<keyof typeof QUICK_PROMPTS | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, conversationId, sendMessage, stopGeneration, clearChat } = useAIChat({
    mode: "doctor_assist",
    patientContext,
  });

  const { logSuggestion } = useAISuggestion();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    setLastQuickAction(null);
    sendMessage(input);
    setInput("");
  };

  const handleQuickAction = (action: keyof typeof QUICK_PROMPTS) => {
    if (isLoading) return;
    setLastQuickAction(action);
    sendMessage(QUICK_PROMPTS[action]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get the last assistant response for suggestion card
  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  const showSuggestion = lastAssistant?.content && !isLoading && lastQuickAction;

  const suggestionType = lastQuickAction === "diagnosis" ? "diagnosis" as const
    : lastQuickAction === "soap" ? "soap_note" as const
    : lastQuickAction === "labs" ? "lab_order" as const
    : null;

  const handleAcceptSuggestion = () => {
    if (!lastAssistant?.content) return;
    if (lastQuickAction === "diagnosis" && onSuggestDiagnosis) {
      onSuggestDiagnosis(lastAssistant.content);
    } else if ((lastQuickAction === "soap" || lastQuickAction === "labs") && onSuggestNotes) {
      onSuggestNotes(lastAssistant.content);
    }
    if (conversationId && suggestionType) {
      logSuggestion({
        conversationId,
        type: suggestionType,
        data: { content: lastAssistant.content },
        accepted: true,
      });
    }
  };

  const handleRejectSuggestion = () => {
    if (conversationId && suggestionType) {
      logSuggestion({
        conversationId,
        type: suggestionType,
        data: { content: lastAssistant?.content || "" },
        accepted: false,
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer pb-2 hover:bg-muted/50 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
                Clinical AI Copilot
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleQuickAction("diagnosis")} disabled={isLoading}>
                <Stethoscope className="h-3 w-3" /> Suggest Diagnosis
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleQuickAction("soap")} disabled={isLoading}>
                <FileText className="h-3 w-3" /> SOAP Note
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleQuickAction("labs")} disabled={isLoading}>
                <TestTube className="h-3 w-3" /> Suggest Labs
              </Button>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="h-[300px]" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <Bot className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">Use quick actions or type a clinical question</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <AIChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
            </ScrollArea>

            {/* Suggestion Card */}
            {showSuggestion && suggestionType && (
              <AISuggestionCard
                type={suggestionType}
                content={lastAssistant.content.slice(0, 500) + (lastAssistant.content.length > 500 ? "..." : "")}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
              />
            )}

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a clinical question..."
                className="min-h-[40px] max-h-[80px] resize-none text-sm"
                disabled={isLoading}
              />
              <div className="flex flex-col gap-1">
                {isLoading ? (
                  <Button onClick={stopGeneration} variant="destructive" size="icon" className="h-8 w-8 shrink-0">
                    <Square className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button onClick={handleSend} size="icon" className="h-8 w-8 shrink-0" disabled={!input.trim()}>
                    <Send className="h-3 w-3" />
                  </Button>
                )}
                {messages.length > 0 && (
                  <Button onClick={clearChat} variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
