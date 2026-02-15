import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIChatMessage } from "./AIChatMessage";
import { DoctorAvatar } from "./DoctorAvatar";
import { useAIChat } from "@/hooks/useAIChat";
import { useVoiceConsultation } from "@/hooks/useVoiceConsultation";
import { Send, Square, Trash2, Globe, Mic, MicOff, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientAIChatProps {
  mode?: "patient_intake" | "doctor_assist" | "general";
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  className?: string;
  compact?: boolean;
}

const GREETINGS = {
  en: "Hello! I'm Dr. Tabeebi, your personal AI doctor. 👋\n\nTell me what's bothering you today, and I'll ask you a few focused questions to understand your condition better — just like a real consultation.\n\nYou can type or tap the 🎤 mic to speak.",
  ar: "أهلاً! أنا د. طبيبي، طبيبك الشخصي بالذكاء الاصطناعي. 👋\n\nأخبرني شو عندك اليوم، وبسألك كم سؤال عشان أفهم حالتك — مثل ما تزور طبيبك بالضبط.\n\nتقدر تكتب أو تضغط 🎤 عشان تتكلم.",
};

const SUGGESTED_TOPICS = {
  en: [
    "🤕 I have a headache",
    "🤢 Stomach pain",
    "🤒 Fever and chills",
    "📋 Follow-up visit",
  ],
  ar: [
    "🤕 لدي صداع",
    "🤢 ألم في المعدة",
    "🤒 حمى وقشعريرة",
    "📋 متابعة حالتي",
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
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const voice = useVoiceConsultation(language);

  const handleAssistantResponse = useCallback(
    (content: string) => {
      if (voiceModeActive) {
        voice.speakResponse(content);
      }
    },
    [voiceModeActive, voice]
  );

  const { messages, isLoading, sendMessage, stopGeneration, clearChat } = useAIChat({
    mode,
    language,
    patientContext,
    onConversationCreated,
    onAssistantResponse: handleAssistantResponse,
    initialGreeting: GREETINGS[language],
  });

  // Determine avatar state from voice + loading
  const avatarState = voice.voiceState === "listening"
    ? "listening" as const
    : voice.voiceState === "speaking"
    ? "speaking" as const
    : isLoading
    ? "thinking" as const
    : "idle" as const;

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

  const handleMicToggle = () => {
    if (voice.voiceState === "listening") {
      voice.stopListening();
    } else if (voice.voiceState === "speaking") {
      voice.stopSpeaking();
    } else {
      setVoiceModeActive(true);
      voice.startListening((finalText) => {
        handleSend(finalText);
      });
    }
  };

  const handleClear = () => {
    voice.stopAll();
    setVoiceModeActive(false);
    clearChat();
  };

  const isVoiceActive = voice.voiceState === "listening" || voice.voiceState === "speaking";
  const showSuggestions = messages.length <= 1; // Only greeting present

  return (
    <TooltipProvider>
      <Card className={cn("flex flex-col", compact ? "h-[500px]" : "h-[700px]", className)}>
        {/* Header with DoctorAvatar */}
        <CardHeader className="flex-shrink-0 pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <DoctorAvatar state={avatarState} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold">{language === "ar" ? "د. طبيبي" : "Dr. Tabeebi"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {voice.voiceState === "listening"
                    ? (language === "ar" ? "🎙️ أستمع..." : "🎙️ Listening...")
                    : voice.voiceState === "speaking"
                    ? (language === "ar" ? "🔊 أتحدث..." : "🔊 Speaking...")
                    : isLoading
                    ? (language === "ar" ? "💭 أفكر..." : "💭 Thinking...")
                    : (language === "ar" ? "🟢 متاح الآن" : "🟢 Available now")}
                </span>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                title="Toggle language"
                className="h-8 px-2"
              >
                <Globe className="h-4 w-4 mr-1" />
                {language === "en" ? "عربي" : "EN"}
              </Button>
              {voiceModeActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    voice.stopAll();
                    setVoiceModeActive(false);
                  }}
                  className="h-8 px-2"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              {messages.length > 1 && (
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-1 px-2" ref={scrollRef}>
            {messages.map((msg, i) => (
              <AIChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                isFirst={i === 0 && msg.role === "assistant"}
              />
            ))}

            {/* Suggested topics after greeting */}
            {showSuggestions && (
              <div className="px-4 py-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === "ar" ? "أو اختر من المواضيع:" : "Or choose a topic:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS[language].map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full h-8 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                      onClick={() => handleSend(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Live transcript while listening */}
            {voice.voiceState === "listening" && voice.transcript && (
              <div className="px-4 py-2 text-sm text-muted-foreground italic animate-pulse">
                {voice.transcript}...
              </div>
            )}
          </ScrollArea>

          <div className="flex-shrink-0 p-4 border-t space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={voice.voiceState === "listening" ? voice.transcript : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === "ar"
                    ? "صف أعراضك أو اسأل سؤالاً طبياً..."
                    : "Describe your symptoms or ask a medical question..."
                }
                className="min-h-[44px] max-h-[120px] resize-none text-base"
                dir={language === "ar" ? "rtl" : "ltr"}
                disabled={isLoading || voice.voiceState === "listening"}
              />

              {/* Mic button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleMicToggle}
                    size="icon"
                    className={cn(
                      "shrink-0 h-11 w-11 rounded-full transition-all",
                      voice.voiceState === "listening" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground scale-110",
                      voice.voiceState === "speaking" && "bg-info hover:bg-info/90 text-info-foreground"
                    )}
                    variant={isVoiceActive ? "default" : "outline"}
                    disabled={isLoading && voice.voiceState !== "speaking"}
                  >
                    {voice.voiceState === "listening" ? (
                      <MicOff className="h-5 w-5" />
                    ) : voice.voiceState === "speaking" ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {!voice.isSupported
                    ? (language === "ar" ? "المتصفح لا يدعم التعرف على الصوت" : "Speech recognition not supported")
                    : voice.voiceState === "listening"
                    ? (language === "ar" ? "إيقاف الاستماع" : "Stop listening")
                    : voice.voiceState === "speaking"
                    ? (language === "ar" ? "إيقاف التحدث" : "Stop speaking")
                    : (language === "ar" ? "تحدث مع طبيبي" : "Speak to Tabeebi")}
                </TooltipContent>
              </Tooltip>

              {/* Send / Stop */}
              {isLoading ? (
                <Button onClick={stopGeneration} variant="destructive" size="icon" className="shrink-0 h-11 w-11 rounded-full">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => handleSend()} size="icon" className="shrink-0 h-11 w-11 rounded-full" disabled={!input.trim() || voice.voiceState === "listening"}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {language === "ar"
                ? "للأغراض المعلوماتية فقط. لا يُعد بديلاً عن الاستشارة الطبية."
                : "For informational purposes only. Not a substitute for professional medical advice."}
            </p>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}