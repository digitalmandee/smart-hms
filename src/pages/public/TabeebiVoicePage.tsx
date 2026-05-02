import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useConversation } from "@elevenlabs/react";
import { LiveDoctorPortrait } from "@/components/ai/LiveDoctorPortrait";
import { Mic, MicOff, PhoneOff, Globe, Captions, FileDown } from "lucide-react";
import { exportTranscriptPdf, type TranscriptEntry } from "@/lib/exportTranscriptPdf";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ELEVENLABS_AGENT_ID = "agent_1201kqn8y31sembseyqhmwj1mhg5";

const LANG_CYCLE: Array<"en" | "ar" | "ur"> = ["en", "ar", "ur"];
const LANG_LABELS: Record<string, string> = { en: "EN", ar: "AR", ur: "UR" };
const LANG_FULL: Record<string, string> = { en: "English", ar: "العربية", ur: "اردو" };

const T = {
  en: {
    callDoctor: "Call Doctor",
    tapToStart: "Tap to start a video call with Dr. Tabeebi",
    connecting: "Connecting to Dr. Tabeebi…",
    listening: "Listening…",
    speaking: "Dr. Tabeebi is speaking",
    idle: "Live",
    endCall: "End call",
    mute: "Mute",
    unmute: "Unmute",
    captions: "Captions",
    micDenied: "Microphone access is required for the call.",
    connectFailed: "Could not connect. Please try again.",
    downloadTranscript: "Download transcript",
    noTranscript: "No transcript yet.",
    transcriptDownloaded: "Transcript downloaded.",
  },
  ar: {
    callDoctor: "اتصل بالطبيب",
    tapToStart: "اضغط لبدء مكالمة فيديو مع الدكتور طبيبي",
    connecting: "جارٍ الاتصال بالدكتور طبيبي…",
    listening: "أستمع…",
    speaking: "الدكتور طبيبي يتحدث",
    idle: "مباشر",
    endCall: "إنهاء المكالمة",
    mute: "كتم",
    unmute: "إلغاء الكتم",
    captions: "الترجمة",
    micDenied: "الوصول إلى الميكروفون مطلوب لإجراء المكالمة.",
    connectFailed: "تعذر الاتصال. حاول مرة أخرى.",
    downloadTranscript: "تنزيل النص",
    noTranscript: "لا يوجد نص بعد.",
    transcriptDownloaded: "تم تنزيل النص.",
  },
  ur: {
    callDoctor: "ڈاکٹر کو کال کریں",
    tapToStart: "ڈاکٹر طبیبی سے ویڈیو کال شروع کرنے کے لیے دبائیں",
    connecting: "ڈاکٹر طبیبی سے رابطہ ہو رہا ہے…",
    listening: "سن رہا ہوں…",
    speaking: "ڈاکٹر طبیبی بول رہے ہیں",
    idle: "لائیو",
    endCall: "کال ختم کریں",
    mute: "خاموش",
    unmute: "آواز چالو کریں",
    captions: "سب ٹائٹل",
    micDenied: "کال کے لیے مائیکروفون کی اجازت درکار ہے۔",
    connectFailed: "رابطہ نہیں ہو سکا۔ دوبارہ کوشش کریں۔",
  },
};

type Caption = { role: "user" | "assistant"; content: string };

export default function TabeebiVoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authLoading, setAuthLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "ar" | "ur">(
    (searchParams.get("lang") as "en" | "ar" | "ur") || "en"
  );
  const [muted, setMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [connecting, setConnecting] = useState(false);

  const t = T[language];
  const isRTL = language === "ar" || language === "ur";

  // Auth gate
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/tabeebi", { replace: true });
      else setAuthLoading(false);
    });
  }, [navigate]);

  const conversation = useConversation({
    onConnect: () => {
      setConnecting(false);
    },
    onDisconnect: () => {
      setConnecting(false);
    },
    onError: (err) => {
      console.error("ElevenLabs error:", err);
      toast.error(t.connectFailed);
      setConnecting(false);
    },
    onMessage: (msg: { source?: string; message?: string }) => {
      // The SDK emits transcripts/responses through onMessage as { source, message }
      if (!msg?.message) return;
      const role: "user" | "assistant" = msg.source === "user" ? "user" : "assistant";
      setCaptions((prev) => {
        const next = [...prev, { role, content: msg.message! }];
        return next.slice(-8);
      });
    },
  });

  const status = conversation.status; // 'connected' | 'disconnected' | 'connecting'
  const isConnected = status === "connected";
  const isSpeaking = !!conversation.isSpeaking;

  // Wrap getOutputByteFrequencyData so the portrait can poll it
  const getFrequencyData = useCallback(() => {
    try {
      return conversation.getOutputByteFrequencyData?.();
    } catch {
      return null;
    }
  }, [conversation]);

  const startCall = useCallback(async () => {
    if (isConnected || connecting) return;
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error(t.micDenied);
      setConnecting(false);
      return;
    }
    try {
      await conversation.startSession({
        agentId: ELEVENLABS_AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (err) {
      console.error("startSession failed:", err);
      toast.error(t.connectFailed);
      setConnecting(false);
    }
  }, [conversation, connecting, isConnected, t]);

  const endCall = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("endSession failed:", err);
    }
  }, [conversation]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    try {
      await conversation.setVolume?.({ volume: next ? 0 : 1 });
    } catch {
      // ignore
    }
  }, [conversation, muted]);

  // End call on unmount
  useEffect(() => {
    return () => {
      try { void conversation.endSession?.(); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageChange = (lang: "en" | "ar" | "ur") => setLanguage(lang);

  if (authLoading) {
    return <div className="min-h-[100dvh] bg-background" />;
  }

  const portraitStatus = isConnected ? "live" : connecting ? "connecting" : "idle";
  const lastAssistant = [...captions].reverse().find((c) => c.role === "assistant");
  const lastUser = [...captions].reverse().find((c) => c.role === "user");

  return (
    <div
      className="h-[100dvh] bg-black flex flex-col overflow-hidden relative"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Full-bleed live portrait */}
      <div className="absolute inset-0">
        <LiveDoctorPortrait
          isSpeaking={isSpeaking}
          getFrequencyData={getFrequencyData}
          status={portraitStatus}
        />
      </div>

      {/* Top bar — language picker + close */}
      <header className="relative z-10 flex items-center justify-between px-4 pt-4">
        <div /> {/* spacer; status pill is inside the portrait */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-full bg-black/50 backdrop-blur text-white hover:bg-black/70 hover:text-white gap-1.5"
            >
              <Globe className="h-4 w-4" />
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
      </header>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Live captions */}
      {showCaptions && isConnected && (
        <div className="relative z-10 px-6 pb-4 flex flex-col items-center gap-2">
          {lastUser && (
            <div className="max-w-md mx-auto rounded-2xl bg-white/90 text-black px-4 py-2 shadow-lg">
              <p className="text-xs uppercase tracking-wide opacity-60 mb-0.5">You</p>
              <p className="text-sm leading-snug line-clamp-2">{lastUser.content}</p>
            </div>
          )}
          {lastAssistant && (
            <div className="max-w-md mx-auto rounded-2xl bg-black/70 backdrop-blur text-white px-4 py-2 shadow-lg">
              <p className="text-xs uppercase tracking-wide opacity-60 mb-0.5">Dr. Tabeebi</p>
              <p className="text-sm leading-snug line-clamp-3">{lastAssistant.content}</p>
            </div>
          )}
        </div>
      )}

      {/* Status text when not in captions or not connected */}
      {!isConnected && (
        <div className="relative z-10 text-center pb-6">
          <p className="text-white/90 text-base font-medium">
            {connecting ? t.connecting : t.tapToStart}
          </p>
        </div>
      )}

      {/* Bottom call dock */}
      <div className="relative z-10 pb-8 pt-2 px-6 flex items-center justify-center gap-5">
        {!isConnected ? (
          <button
            onClick={startCall}
            disabled={connecting}
            className={cn(
              "h-20 px-8 rounded-full flex items-center gap-3 shadow-xl transition-all",
              "bg-emerald-500 hover:bg-emerald-600 text-white text-base font-semibold",
              "active:scale-95 disabled:opacity-60",
            )}
          >
            <Mic className="h-6 w-6" />
            <span>{t.callDoctor}</span>
          </button>
        ) : (
          <>
            {/* Mute */}
            <button
              onClick={toggleMute}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-white transition shadow-lg active:scale-95",
                muted ? "bg-white/30" : "bg-white/20 hover:bg-white/30",
              )}
              aria-label={muted ? t.unmute : t.mute}
            >
              {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            {/* End call */}
            <button
              onClick={endCall}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white shadow-2xl transition active:scale-95"
              aria-label={t.endCall}
            >
              <PhoneOff className="h-8 w-8" />
            </button>

            {/* Captions toggle */}
            <button
              onClick={() => setShowCaptions((v) => !v)}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-white transition shadow-lg active:scale-95",
                showCaptions ? "bg-white/30" : "bg-white/20 hover:bg-white/30",
              )}
              aria-label={t.captions}
            >
              <Captions className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
