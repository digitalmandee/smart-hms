import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIChatMessage } from "./AIChatMessage";
import { useAIChat } from "@/hooks/useAIChat";
import { Stethoscope, Send, Square, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientAIChatProps {
  mode?: "patient_intake" | "doctor_assist" | "general";
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

const SUGGESTED_TOPICS = {
  en: [
    "I have a headache",
    "Stomach pain",
    "Fever and chills",
    "Follow-up on my condition",
  ],
  ar: [
    "لدي صداع",
    "ألم في المعدة",
    "حمى وقشعريرة",
    "متابعة حالتي",
  ],
};

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

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;
    sendMessage(msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={cn("flex flex-col", compact ? "h-[500px]" : "h-[700px]", className)}>
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex flex-col">
              <span>{language === "ar" ? "الدكتور الذكي" : "Dr. AI"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {language === "ar" ? "طبيبك الشخصي" : "Your Personal AI Doctor"}
              </span>
            </div>
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
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Stethoscope className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {language === "ar" ? "الدكتور الذكي" : "Dr. AI"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {language === "ar"
                  ? "مرحباً! أنا الدكتور الذكي، مساعدك الطبي الشخصي. أخبرني بما يزعجك وسأساعدك في جمع المعلومات المناسبة لطبيبك."
                  : "Hello! I'm Dr. AI, your personal medical assistant. Tell me what's bothering you, and I'll help gather the right information for your doctor."}
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {SUGGESTED_TOPICS[language].map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSend(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
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

        <div className="flex-shrink-0 p-4 border-t space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "ar"
                  ? "صف أعراضك أو اسأل سؤالاً طبياً..."
                  : "Describe your symptoms or ask a medical question..."
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
              <Button onClick={() => handleSend()} size="icon" className="shrink-0" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {language === "ar"
              ? "للأغراض المعلوماتية فقط. لا يُعد بديلاً عن الاستشارة الطبية المتخصصة."
              : "For informational purposes only. Not a substitute for professional medical advice."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
