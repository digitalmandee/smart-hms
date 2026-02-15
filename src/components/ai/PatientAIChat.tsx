import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIChatMessage } from "./AIChatMessage";
import { useAIChat } from "@/hooks/useAIChat";
import { Bot, Send, Square, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientAIChatProps {
  mode?: "patient_intake" | "doctor_assist" | "general";
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function PatientAIChat({
  mode = "patient_intake",
  patientContext,
  onConversationCreated,
  className,
  compact = false,
}: PatientAIChatProps) {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, sendMessage, stopGeneration, clearChat } = useAIChat({
    mode,
    language,
    patientContext,
    onConversationCreated,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = language === "ar"
    ? "مرحباً! أنا مساعدك الطبي. كيف يمكنني مساعدتك اليوم؟ يرجى وصف مخاوفك الصحية."
    : "Hello! I'm your medical intake assistant. How can I help you today? Please describe your health concerns.";

  return (
    <Card className={cn("flex flex-col", compact ? "h-[500px]" : "h-[700px]", className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5 text-primary" />
            {language === "ar" ? "مساعد الاستقبال الطبي" : "AI Medical Intake"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              title="Toggle language"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language === "en" ? "عربي" : "EN"}
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1 px-2" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm max-w-sm">{welcomeMessage}</p>
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

        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "ar"
                  ? "اكتب رسالتك هنا..."
                  : "Type your message here..."
              }
              className="min-h-[44px] max-h-[120px] resize-none"
              dir={language === "ar" ? "rtl" : "ltr"}
              disabled={isLoading}
            />
            {isLoading ? (
              <Button onClick={stopGeneration} variant="destructive" size="icon" className="shrink-0">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSend} size="icon" className="shrink-0" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
