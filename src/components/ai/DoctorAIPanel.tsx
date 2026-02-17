import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIChatMessage } from "./AIChatMessage";
import { AISuggestionCard } from "./AISuggestionCard";
import { MedicineAlternatives } from "./MedicineAlternatives";
import { useAIChat } from "@/hooks/useAIChat";
import { useAISuggestion } from "@/hooks/useAISuggestion";
import { DoctorAvatar } from "./DoctorAvatar";
import { toast } from "sonner";
import {
  Stethoscope, FileText, TestTube, MessageCircle, Pill,
  Send, Square, Trash2, Bot, Loader2, Check, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DoctorAIPanelProps {
  patientContext?: Record<string, unknown>;
  onSuggestDiagnosis?: (text: string) => void;
  onSuggestNotes?: (text: string) => void;
  onAddMedicineToPrescription?: (medicineName: string) => void;
  standalone?: boolean;
}

type SubTab = "chat" | "diagnosis" | "soap" | "labs" | "medicine";

const SUB_TABS: { key: SubTab; icon: typeof MessageCircle; label: string }[] = [
  { key: "chat", icon: MessageCircle, label: "Chat" },
  { key: "diagnosis", icon: Stethoscope, label: "Diagnosis" },
  { key: "soap", icon: FileText, label: "SOAP Note" },
  { key: "labs", icon: TestTube, label: "Labs" },
  { key: "medicine", icon: Pill, label: "Medicine" },
];

const QUICK_PROMPTS = {
  diagnosis: "Based on the patient context provided (symptoms, vitals, chief complaint), suggest a differential diagnosis with confidence levels and ICD-10 codes.",
  soap: "Generate a SOAP note based on the patient context provided. Format with clear sections: Subjective, Objective, Assessment, Plan.",
  labs: "Based on the symptoms and vitals, recommend appropriate laboratory tests with reasoning.",
};

export function DoctorAIPanel({ patientContext, onSuggestDiagnosis, onSuggestNotes, onAddMedicineToPrescription, standalone = false }: DoctorAIPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>("chat");
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

  const handleQuickAction = useCallback((action: keyof typeof QUICK_PROMPTS) => {
    if (isLoading) return;
    setLastQuickAction(action);
    sendMessage(QUICK_PROMPTS[action]);
  }, [isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
      toast.success("Diagnosis applied");
    } else if (lastQuickAction === "soap" && onSuggestNotes) {
      onSuggestNotes(lastAssistant.content);
      toast.success("SOAP note applied to clinical notes");
    } else if (lastQuickAction === "labs" && onSuggestNotes) {
      onSuggestNotes(lastAssistant.content);
    }
    if (conversationId && suggestionType) {
      logSuggestion({ conversationId, type: suggestionType, data: { content: lastAssistant.content }, accepted: true });
    }
  };

  const handleRejectSuggestion = () => {
    if (conversationId && suggestionType) {
      logSuggestion({ conversationId, type: suggestionType, data: { content: lastAssistant?.content || "" }, accepted: false });
    }
  };

  // Chat input + messages area (reused in chat tab)
  const chatArea = (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0 h-[380px]" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <DoctorAvatar size="sm" state="idle" />
            <p className="text-xs text-muted-foreground mt-2">Ask a clinical question or use a quick action</p>
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

      {showSuggestion && suggestionType && (
        <div className="mt-2">
          <AISuggestionCard
            type={suggestionType}
            content={lastAssistant.content.slice(0, 500) + (lastAssistant.content.length > 500 ? "..." : "")}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
          />
        </div>
      )}

      <div className="flex gap-2 mt-2">
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return chatArea;

      case "diagnosis":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DoctorAvatar size="xs" state={isLoading && lastQuickAction === "diagnosis" ? "thinking" : "idle"} />
              Suggest Diagnosis
            </div>
            <Button
              onClick={() => handleQuickAction("diagnosis")}
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading && lastQuickAction === "diagnosis" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Differential Diagnosis
            </Button>
            {/* Show results in scrollable area */}
            <ScrollArea className="h-[340px]" ref={scrollRef}>
              {messages.filter(m => m.role === "assistant").length > 0 && lastQuickAction === "diagnosis" && (
                <div className="space-y-2">
                  {messages.filter(m => m.role === "assistant").map((msg, i) => (
                    <AIChatMessage key={i} role={msg.role} content={msg.content} isStreaming={isLoading && i === messages.filter(m => m.role === "assistant").length - 1} />
                  ))}
                </div>
              )}
            </ScrollArea>
            {showSuggestion && suggestionType === "diagnosis" && (
              <AISuggestionCard
                type="diagnosis"
                content={lastAssistant!.content.slice(0, 500) + (lastAssistant!.content.length > 500 ? "..." : "")}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
              />
            )}
            <p className="text-[9px] text-muted-foreground/60 text-center">Powered by Tabeebi</p>
          </div>
        );

      case "soap":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DoctorAvatar size="xs" state={isLoading && lastQuickAction === "soap" ? "thinking" : "idle"} />
              SOAP Note Generator
            </div>
            <Button
              onClick={() => handleQuickAction("soap")}
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading && lastQuickAction === "soap" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Generate SOAP Note
            </Button>
            <ScrollArea className="h-[300px]" ref={scrollRef}>
              {messages.filter(m => m.role === "assistant").length > 0 && lastQuickAction === "soap" && (
                <div className="space-y-2">
                  {messages.filter(m => m.role === "assistant").map((msg, i) => (
                    <AIChatMessage key={i} role={msg.role} content={msg.content} isStreaming={isLoading && i === messages.filter(m => m.role === "assistant").length - 1} />
                  ))}
                </div>
              )}
            </ScrollArea>
            {showSuggestion && suggestionType === "soap_note" && (
              <div className="space-y-2">
                <AISuggestionCard
                  type="soap_note"
                  content={lastAssistant!.content.slice(0, 500) + (lastAssistant!.content.length > 500 ? "..." : "")}
                  onAccept={handleAcceptSuggestion}
                  onReject={handleRejectSuggestion}
                />
                <Button
                  onClick={() => {
                    if (onSuggestNotes && lastAssistant?.content) {
                      onSuggestNotes(lastAssistant.content);
                      toast.success("SOAP note applied to clinical notes");
                    }
                  }}
                  className="w-full gap-2"
                  size="sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply to Clinical Notes
                </Button>
              </div>
            )}
            <p className="text-[9px] text-muted-foreground/60 text-center">Powered by Tabeebi</p>
          </div>
        );

      case "labs":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DoctorAvatar size="xs" state={isLoading && lastQuickAction === "labs" ? "thinking" : "idle"} />
              Suggest Labs
            </div>
            <Button
              onClick={() => handleQuickAction("labs")}
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading && lastQuickAction === "labs" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              Recommend Laboratory Tests
            </Button>
            <ScrollArea className="h-[340px]" ref={scrollRef}>
              {messages.filter(m => m.role === "assistant").length > 0 && lastQuickAction === "labs" && (
                <div className="space-y-2">
                  {messages.filter(m => m.role === "assistant").map((msg, i) => (
                    <AIChatMessage key={i} role={msg.role} content={msg.content} isStreaming={isLoading && i === messages.filter(m => m.role === "assistant").length - 1} />
                  ))}
                </div>
              )}
            </ScrollArea>
            {showSuggestion && suggestionType === "lab_order" && (
              <AISuggestionCard
                type="lab_order"
                content={lastAssistant!.content.slice(0, 500) + (lastAssistant!.content.length > 500 ? "..." : "")}
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
              />
            )}
            <p className="text-[9px] text-muted-foreground/60 text-center">Powered by Tabeebi</p>
          </div>
        );

      case "medicine":
        return (
          <div className="space-y-3">
            <MedicineAlternatives onSelectAlternative={onAddMedicineToPrescription} />
            <p className="text-[9px] text-muted-foreground/60 text-center">Powered by Tabeebi</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <DoctorAvatar size="xs" state={isLoading ? "thinking" : "idle"} />
          Tabeebi Clinical Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex min-h-[480px]">
          {/* Vertical icon pills */}
          <div className="flex flex-col gap-1 p-2 border-r border-primary/10 bg-primary/5">
            {SUB_TABS.map(({ key, icon: Icon, label }) => (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                      activeTab === key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 p-3 min-w-0 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
