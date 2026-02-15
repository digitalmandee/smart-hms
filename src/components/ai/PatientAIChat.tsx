import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIChatMessage } from "./AIChatMessage";
import { DoctorAvatar } from "./DoctorAvatar";
import { VoiceOrb } from "./VoiceOrb";
import { useAIChat, ChatMessage } from "@/hooks/useAIChat";
import { useVoiceConsultation } from "@/hooks/useVoiceConsultation";
import { Send, Square, Plus, Globe, Mic, MicOff, VolumeX, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientAIChatProps {
  mode?: "patient_intake" | "doctor_assist" | "general";
  patientContext?: Record<string, unknown>;
  onConversationCreated?: (id: string) => void;
  className?: string;
  compact?: boolean;
  initialConversationId?: string;
  initialMessages?: ChatMessage[];
}

const GREETINGS: Record<string, string> = {
  en: "Hello! I'm Dr. Tabeebi. What brings you in today?",
  ar: "أهلاً! أنا د. طبيبي. شو بتحس فيه اليوم؟",
  ur: "السلام علیکم! میں ڈاکٹر طبیبی ہوں۔ آج کیا تکلیف ہے؟",
};

const SUGGESTED_TOPICS: Record<string, string[]> = {
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
  ur: [
    "🤕 مجھے سر درد ہے",
    "🤢 پیٹ میں درد",
    "🤒 بخار اور سردی",
    "📋 فالو اپ وزٹ",
  ],
};

const LANG_CYCLE: Array<"en" | "ar" | "ur"> = ["en", "ar", "ur"];
const LANG_LABELS: Record<string, string> = { en: "عربي", ar: "اردو", ur: "EN" };

export function PatientAIChat({
  mode = "patient_intake",
  patientContext,
  onConversationCreated,
  className,
  compact = false,
  initialConversationId,
  initialMessages,
}: PatientAIChatProps) {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"en" | "ar" | "ur">("en");
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [showVoiceOverlay, setShowVoiceOverlay] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const voiceLang = language === "ur" ? "en" : language;
  const voice = useVoiceConsultation(voiceLang);

  const handleAssistantResponse = useCallback(
    (content: string) => {
      if (voiceModeActive) {
        setShowVoiceOverlay(true);
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
    initialGreeting: initialConversationId ? undefined : GREETINGS[language],
    initialConversationId,
    initialMessages,
  });

  const isRTL = language === "ar" || language === "ur";

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

  // Close voice overlay when speaking ends
  useEffect(() => {
    if (voice.voiceState === "idle" && showVoiceOverlay && !isLoading) {
      const timer = setTimeout(() => setShowVoiceOverlay(false), 500);
      return () => clearTimeout(timer);
    }
  }, [voice.voiceState, showVoiceOverlay, isLoading]);

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
      setShowVoiceOverlay(false);
    } else if (voice.voiceState === "speaking") {
      voice.stopSpeaking();
      setShowVoiceOverlay(false);
    } else {
      setVoiceModeActive(true);
      setShowVoiceOverlay(true);
      voice.startListening((finalText) => {
        setShowVoiceOverlay(false);
        handleSend(finalText);
      });
    }
  };

  const handleClear = () => {
    voice.stopAll();
    setVoiceModeActive(false);
    setShowVoiceOverlay(false);
    clearChat();
  };

  const cycleLang = () => {
    const idx = LANG_CYCLE.indexOf(language);
    setLanguage(LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]);
  };

  const isVoiceActive = voice.voiceState === "listening" || voice.voiceState === "speaking";
  const showSuggestions = messages.length <= 1;

  const statusText = voice.voiceState === "listening"
    ? (isRTL ? "أستمع..." : "Listening...")
    : voice.voiceState === "speaking"
    ? (isRTL ? "يتحدث..." : "Speaking...")
    : isLoading
    ? (isRTL ? "يفكر..." : "Thinking...")
    : (isRTL ? "متاح" : "Available");

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col bg-gradient-to-b from-background to-accent/10",
        "h-full min-h-0",
        className
      )}>
        {/* Compact header */}
        <div className="flex-shrink-0 px-4 py-3 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DoctorAvatar state={avatarState} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {language === "ar" ? "د. طبيبي" : language === "ur" ? "ڈاکٹر طبیبی" : "Dr. Tabeebi"}
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {statusText}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleLang}
                title="Toggle language"
                className="h-8 px-2"
              >
                <Globe className="h-4 w-4 mr-1" />
                {LANG_LABELS[language]}
              </Button>
              {voiceModeActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    voice.stopAll();
                    setVoiceModeActive(false);
                    setShowVoiceOverlay(false);
                  }}
                  className="h-8 px-2"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              {messages.length > 1 && (
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2" title="New chat">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-1" ref={scrollRef}>
            {messages.map((msg, i) => (
              <AIChatMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}

            {/* Suggested topics after greeting */}
            {showSuggestions && (
              <div className="px-4 py-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === "ar" ? "أو اختر من المواضيع:" : language === "ur" ? "یا کوئی موضوع چنیں:" : "Or choose a topic:"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(SUGGESTED_TOPICS[language] || SUGGESTED_TOPICS.en).map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full h-9 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                      onClick={() => handleSend(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Live transcript while listening (text mode) */}
            {voice.voiceState === "listening" && voice.transcript && !showVoiceOverlay && (
              <div className="px-4 py-2 text-sm text-muted-foreground italic animate-pulse">
                {voice.transcript}...
              </div>
            )}
          </ScrollArea>

          {/* Voice Overlay */}
          {showVoiceOverlay && (
            <div
              className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center gap-6 animate-fade-in"
              onClick={() => {
                if (voice.voiceState === "idle") {
                  setShowVoiceOverlay(false);
                }
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 rounded-full"
                onClick={() => {
                  voice.stopAll();
                  setShowVoiceOverlay(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              <VoiceOrb
                state={
                  voice.voiceState === "listening"
                    ? "listening"
                    : voice.voiceState === "speaking"
                    ? "speaking"
                    : isLoading
                    ? "thinking"
                    : "idle"
                }
                onClick={handleMicToggle}
              />

              <p className="text-sm font-medium text-muted-foreground">
                {voice.voiceState === "listening"
                  ? (isRTL ? "أستمع... اضغط للإيقاف" : "Listening... tap to stop")
                  : voice.voiceState === "speaking"
                  ? (isRTL ? "د. طبيبي يتحدث..." : "Dr. Tabeebi is speaking...")
                  : isLoading
                  ? (isRTL ? "يفكر..." : "Thinking...")
                  : (isRTL ? "اضغط للتحدث" : "Tap to speak")}
              </p>

              {voice.transcript && (
                <p className="text-sm text-foreground/80 max-w-[80%] text-center italic">
                  "{voice.transcript}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 p-3 border-t bg-background/80 backdrop-blur-sm space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={voice.voiceState === "listening" ? voice.transcript : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "ar"
                  ? "صف أعراضك أو اسأل سؤالاً طبياً..."
                  : language === "ur"
                  ? "اپنی علامات بیان کریں..."
                  : "Describe your symptoms or ask a medical question..."
              }
              className="min-h-[44px] max-h-[120px] resize-none text-base"
              dir={isRTL ? "rtl" : "ltr"}
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
                    voice.voiceState === "speaking" && "bg-blue-500 hover:bg-blue-600 text-white"
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
                  ? "Speech recognition not supported"
                  : voice.voiceState === "listening"
                  ? "Stop listening"
                  : voice.voiceState === "speaking"
                  ? "Stop speaking"
                  : "Speak to Tabeebi"}
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
              : language === "ur"
              ? "صرف معلوماتی مقاصد کے لیے۔ پیشہ ورانہ طبی مشورے کا متبادل نہیں۔"
              : "For informational purposes only. Not a substitute for professional medical advice."}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
