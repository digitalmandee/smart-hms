import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIChatMessage } from "./AIChatMessage";
import { DoctorAvatar } from "./DoctorAvatar";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const avatarState = voice.voiceState === "listening"
    ? "listening" as const
    : voice.voiceState === "speaking"
    ? "speaking" as const
    : isLoading
    ? "thinking" as const
    : "idle" as const;

  // Smooth scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    : (isRTL ? "متاح" : "Online");

  const overlayStatusText = voice.voiceState === "listening"
    ? (isRTL ? "أستمع إليك... اضغط للإيقاف" : "I'm listening... tap to stop")
    : voice.voiceState === "speaking"
    ? (isRTL ? "د. طبيبي يتحدث..." : "Dr. Tabeebi is speaking...")
    : isLoading
    ? (isRTL ? "يفكر في إجابتك..." : "Thinking about your answer...")
    : (isRTL ? "اضغط على الطبيب للتحدث" : "Tap the doctor to speak");

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col bg-gradient-to-b from-background to-accent/10",
        "h-full min-h-0",
        className
      )}>
        {/* Compact header with status */}
        <div className="flex-shrink-0 px-4 py-2.5 border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DoctorAvatar state={avatarState} size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">
                  {language === "ar" ? "د. طبيبي" : language === "ur" ? "ڈاکٹر طبیبی" : "Dr. Tabeebi"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    avatarState === "idle" && "bg-green-500",
                    avatarState === "listening" && "bg-red-500 animate-pulse",
                    avatarState === "speaking" && "bg-blue-500 animate-pulse",
                    avatarState === "thinking" && "bg-amber-500 animate-pulse",
                  )} />
                  <span className="text-[11px] text-muted-foreground">
                    {statusText}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleLang}
                title="Toggle language"
                className="h-8 px-2 rounded-full"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-xs">{LANG_LABELS[language]}</span>
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
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              {messages.length > 1 && (
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 w-8 p-0 rounded-full" title="New chat">
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

            {/* Suggested topics */}
            {showSuggestions && (
              <div className="px-4 py-3 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === "ar" ? "أو اختر من المواضيع:" : language === "ur" ? "یا کوئی موضوع چنیں:" : "Or choose a topic:"}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {(SUGGESTED_TOPICS[language] || SUGGESTED_TOPICS.en).map((topic) => (
                    <Button
                      key={topic}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full h-11 whitespace-nowrap hover:bg-primary/10 hover:border-primary/30 transition-colors flex-shrink-0 px-4"
                      onClick={() => handleSend(topic)}
                    >
                      {topic}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Live transcript while listening (inline) */}
            {voice.voiceState === "listening" && voice.transcript && !showVoiceOverlay && (
              <div className="px-4 py-2 text-sm text-muted-foreground italic animate-pulse">
                {voice.transcript}...
              </div>
            )}

            <div ref={bottomRef} />
          </ScrollArea>

          {/* Voice Overlay with Doctor Avatar */}
          {showVoiceOverlay && (
            <div
              className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-fade-in"
              onClick={() => {
                if (voice.voiceState === "idle" && !isLoading) {
                  setShowVoiceOverlay(false);
                }
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-9 w-9 rounded-full hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  voice.stopAll();
                  setShowVoiceOverlay(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Doctor Avatar as the voice character */}
              <button
                className="focus:outline-none cursor-pointer active:scale-95 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMicToggle();
                }}
              >
                <DoctorAvatar
                  state={avatarState}
                  size="lg"
                />
              </button>

              {/* Status text */}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {overlayStatusText}
                </p>
                {voice.voiceState === "listening" && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500/80 rounded-full"
                        style={{
                          animation: `voiceWave 0.6s ease-in-out ${i * 0.08}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript */}
              {voice.transcript && (
                <div className="bg-accent/60 rounded-2xl px-5 py-3 max-w-[85%]">
                  <p className="text-sm text-foreground/80 text-center italic">
                    "{voice.transcript}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pill-shaped input area */}
        <div className="flex-shrink-0 p-3 bg-background/80 backdrop-blur-sm space-y-2"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
        >
          <div className="flex items-end gap-2 bg-accent/30 border border-border/40 rounded-2xl px-3 py-2 shadow-sm">
            <textarea
              ref={inputRef}
              value={voice.voiceState === "listening" ? voice.transcript : input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "ar"
                  ? "صف أعراضك..."
                  : language === "ur"
                  ? "اپنی علامات بیان کریں..."
                  : "Describe your symptoms..."
              }
              className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] leading-relaxed placeholder:text-muted-foreground/50 min-h-[24px] max-h-[100px] py-1"
              dir={isRTL ? "rtl" : "ltr"}
              disabled={isLoading || voice.voiceState === "listening"}
              rows={1}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 100) + "px";
              }}
            />

            {/* Mic button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleMicToggle}
                  className={cn(
                    "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all active:scale-95",
                    voice.voiceState === "listening" && "bg-destructive text-destructive-foreground scale-110 shadow-lg shadow-destructive/30",
                    voice.voiceState === "speaking" && "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
                    voice.voiceState === "idle" && !isLoading && "bg-muted hover:bg-muted-foreground/20 text-muted-foreground",
                  )}
                  disabled={isLoading && voice.voiceState !== "speaking"}
                >
                  {voice.voiceState === "listening" ? (
                    <MicOff className="h-4.5 w-4.5" />
                  ) : voice.voiceState === "speaking" ? (
                    <VolumeX className="h-4.5 w-4.5" />
                  ) : (
                    <Mic className="h-4.5 w-4.5" />
                  )}
                </button>
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
              <button
                onClick={stopGeneration}
                className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground active:scale-95 transition-transform"
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || voice.voiceState === "listening"}
                className={cn(
                  "shrink-0 h-10 w-10 rounded-full flex items-center justify-center active:scale-95 transition-all",
                  input.trim()
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground/40"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center">
            {language === "ar"
              ? "للأغراض المعلوماتية فقط. لا يُعد بديلاً عن الاستشارة الطبية."
              : language === "ur"
              ? "صرف معلوماتی مقاصد کے لیے۔ پیشہ ورانہ طبی مشورے کا متبادل نہیں۔"
              : "For informational purposes only. Not a substitute for professional medical advice."}
          </p>
        </div>

        <style>{`
          @keyframes voiceWave {
            0%, 100% { height: 4px; opacity: 0.4; }
            50% { height: 20px; opacity: 0.9; }
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
