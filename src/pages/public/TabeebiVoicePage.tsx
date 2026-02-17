import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DoctorAvatarLarge } from "@/components/ai/DoctorAvatarLarge";
import { HeyGenAvatar, type HeyGenAvatarHandle } from "@/components/ai/HeyGenAvatar";
import { useVoiceConsultation } from "@/hooks/useVoiceConsultation";
import { useAIChat } from "@/hooks/useAIChat";
import { Mic, MicOff, MessageSquare, Globe, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANG_CYCLE: Array<"en" | "ar" | "ur"> = ["en", "ar", "ur"];
const LANG_LABELS: Record<string, string> = { en: "EN", ar: "AR", ur: "UR" };
const LANG_FULL: Record<string, string> = { en: "English", ar: "العربية", ur: "اردو" };

const STATUS_TEXT: Record<string, Record<string, string>> = {
  idle: {
    en: "Tap the mic to speak",
    ar: "اضغط على الميكروفون للتحدث",
    ur: "بات کرنے کے لیے مائیک دبائیں",
  },
  listening: {
    en: "Listening… speak now",
    ar: "أستمع… تحدث الآن",
    ur: "سن رہا ہوں… ابھی بولیں",
  },
  processing: {
    en: "Thinking…",
    ar: "أفكر…",
    ur: "سوچ رہا ہوں…",
  },
  speaking: {
    en: "Dr. Tabeebi is speaking…",
    ar: "الدكتور طبيبي يتحدث…",
    ur: "ڈاکٹر طبیبی بول رہے ہیں…",
  },
};

export default function TabeebiVoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar" | "ur">(
    (searchParams.get("lang") as "en" | "ar" | "ur") || "en"
  );
  const [autoListen, setAutoListen] = useState(false);
  const [recentExchanges, setRecentExchanges] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const avatarRef = useRef<HeyGenAvatarHandle>(null);
  const autoListenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessingRef = useRef(false);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/tabeebi", { replace: true });
      else setLoading(false);
    });
  }, [navigate]);

  // Hooks first — so refs always point to the latest version
  const { voiceState, transcript, isSupported, unlockAudio, startListening, stopListening, speakResponse, stopAll } =
    useVoiceConsultation(language);

  // Keep ref so async callbacks never capture stale closures
  const speakRef = useRef(speakResponse);
  speakRef.current = speakResponse;

  const handleAssistantResponse = useCallback((content: string) => {
    setRecentExchanges(prev => {
      const updated: Array<{ role: "user" | "assistant"; content: string }> = [...prev, { role: "assistant" as const, content }];
      return updated.slice(-6);
    });
    // Use HeyGen avatar for real lip-sync; fall back to browser TTS if avatar not ready
    if (avatarRef.current) {
      avatarRef.current.speak(content);
    } else {
      speakRef.current(content);
    }
  }, []);

  const { sendMessage, isLoading, messages } = useAIChat({
    mode: "patient_intake",
    language,
    patientContext: { voice_mode: true },
    onAssistantResponse: handleAssistantResponse,
  });

  // Derive avatar state
  const avatarState =
    voiceState === "listening" ? "listening"
    : voiceState === "speaking" ? "speaking"
    : isLoading ? "thinking"
    : "idle";

  // Auto-listen after AI finishes speaking (fallback when HeyGen not used)
  useEffect(() => {
    if (voiceState === "idle" && !isLoading && autoListen && !isProcessingRef.current && !loading) {
      if (recentExchanges.length > 0) {
        autoListenTimerRef.current = setTimeout(() => {
          startListening(handleFinalTranscript);
        }, 1200);
      }
    }
    return () => {
      if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);
    };
  }, [voiceState, isLoading, autoListen]);

  const handleFinalTranscript = useCallback((text: string) => {
    isProcessingRef.current = true;
    setRecentExchanges(prev => [...prev, { role: "user" as const, content: text }].slice(-6));
    // Silence while thinking — avatar "thinking" state gives visual feedback
    sendMessage(text).finally(() => {
      isProcessingRef.current = false;
    });
  }, [sendMessage]);

  const handleMicPress = () => {
    // CRITICAL: unlockAudio() MUST be called synchronously here (inside the click handler)
    unlockAudio();

    if (autoListenTimerRef.current) clearTimeout(autoListenTimerRef.current);

    if (voiceState === "listening") {
      stopListening();
    } else if (voiceState === "speaking") {
      // Interrupt the HeyGen avatar + stop browser TTS fallback
      avatarRef.current?.interrupt();
      stopAll();
    } else if (!isLoading) {
      startListening(handleFinalTranscript);
    }
  };

  const handleAvatarStopTalking = useCallback(() => {
    // Auto-listen after avatar finishes speaking
    if (autoListen && !isProcessingRef.current) {
      autoListenTimerRef.current = setTimeout(() => {
        startListening(handleFinalTranscript);
      }, 800);
    }
  }, [autoListen, startListening, handleFinalTranscript]);

  const handleLanguageChange = (lang: "en" | "ar" | "ur") => {
    setLanguage(lang);
    stopAll();
  };

  const handleReset = () => {
    stopAll();
    setRecentExchanges([]);
    isProcessingRef.current = false;
  };

  const micActive = voiceState === "listening";
  const micBusy = isLoading || voiceState === "speaking";

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <DoctorAvatarLarge state="thinking" />
      </div>
    );
  }

  const statusText = STATUS_TEXT[voiceState === "processing" || isLoading ? "processing" : voiceState]?.[language] ?? "";

  return (
    <div
      className="h-[100dvh] bg-background flex flex-col overflow-hidden"
      dir={language === "ar" || language === "ur" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="flex-shrink-0 bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Back to chat */}
          <button
            onClick={() => navigate(`/tabeebi/chat?lang=${language}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat Mode</span>
          </button>

          {/* Title */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold">Dr. Tabeebi</p>
            <p className="text-[10px] text-muted-foreground">Voice Consultation</p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Language picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground rounded-full gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{LANG_LABELS[language]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 z-[100]">
                {LANG_CYCLE.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={cn("cursor-pointer", language === lang && "bg-primary/10 font-medium")}
                  >
                    <span className="flex-1">{LANG_FULL[lang]}</span>
                    {language === lang && <span className="text-primary text-xs">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content — full-screen video-call layout */}
      <div className="flex-1 flex flex-col items-center justify-between overflow-hidden px-4 py-3">

        {/* Avatar — takes up most of the screen */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <HeyGenAvatar
            ref={avatarRef}
            state={avatarState}
            onStartTalking={() => {}}
            onStopTalking={handleAvatarStopTalking}
          />
        </div>

        {/* Caption area — last Dr. Tabeebi response as subtitle */}
        <div className="w-full max-w-sm flex-shrink-0 text-center min-h-[56px] flex flex-col items-center justify-center gap-1 pb-1">
          {/* Status text */}
          <p className={cn(
            "text-sm font-medium transition-all duration-300",
            avatarState === "listening" && "text-primary",
            avatarState === "speaking" && "text-primary",
            avatarState === "thinking" && "text-amber-500",
            avatarState === "idle" && "text-muted-foreground",
          )}>
            {statusText}
          </p>

          {/* Live transcript while listening */}
          {transcript && voiceState === "listening" && (
            <div className="max-w-xs mx-auto bg-primary/10 border border-primary/20 rounded-2xl px-4 py-1.5">
              <p className="text-xs text-foreground/80 italic">"{transcript}"</p>
            </div>
          )}

          {/* Last Dr. Tabeebi response (caption) */}
          {!transcript && recentExchanges.length > 0 && (() => {
            const last = [...recentExchanges].reverse().find(m => m.role === "assistant");
            return last ? (
              <p className="text-xs text-muted-foreground/70 line-clamp-2 max-w-[280px]">
                {last.content.length > 120 ? last.content.slice(0, 120) + "…" : last.content}
              </p>
            ) : null;
          })()}
        </div>

        {/* Mic button — floating bottom */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pb-2">
          <button
            onClick={handleMicPress}
            disabled={micBusy && voiceState !== "speaking"}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-ring",
              micActive
                ? "bg-primary text-primary-foreground scale-110 animate-pulse"
                : voiceState === "speaking"
                ? "bg-destructive/80 text-destructive-foreground hover:bg-destructive"
                : isLoading
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95"
            )}
            aria-label={micActive ? "Stop listening" : "Start speaking"}
          >
            {micActive ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>
          <p className="text-xs text-muted-foreground">
            {micActive ? "Tap to stop" : voiceState === "speaking" ? "Tap to interrupt" : "Tap to speak"}
          </p>
        </div>

        {/* STT not supported warning */}
        {!isSupported && (
          <div className="w-full max-w-sm bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center flex-shrink-0">
            <p className="text-xs text-destructive">
              Voice input is not supported in this browser. Please use Chrome or Edge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
