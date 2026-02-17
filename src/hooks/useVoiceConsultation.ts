import { useState, useCallback, useRef, useEffect } from "react";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  }
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  ar: "ar-SA",
  ur: "ur-PK",
};

export function useVoiceConsultation(language: string = "en") {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const voiceStateRef = useRef<VoiceState>("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isTTSSupported =
    typeof window !== "undefined" && !!window.speechSynthesis;

  // Keep ref in sync
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = useCallback(
    (onFinalTranscript?: (text: string) => void) => {
      if (!isSupported) return;

      onFinalRef.current = onFinalTranscript || null;

      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.lang = LANG_MAP[language] || "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setVoiceState("listening");
        setTranscript("");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
          setVoiceState("processing");
          onFinalRef.current?.(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setVoiceState("idle");
        }
      };

      recognition.onend = () => {
        // Use ref to get the latest state (avoid stale closure)
        const currentState = voiceStateRef.current;
        if (currentState === "listening") {
          // Auto-restart on silence timeout
          try {
            recognition.start();
          } catch {
            setVoiceState("idle");
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported, language]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setVoiceState("idle");
  }, []);

  const speakResponse = useCallback(
    (text: string) => {
      if (!isTTSSupported || !text.trim()) return;

      // Clean markdown/special chars for better speech
      const cleanText = text
        .replace(/[#*_`~>\-|]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!cleanText) return;

      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const doSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = LANG_MAP[language] || "en-US";
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Try to find a matching voice
        const voices = window.speechSynthesis.getVoices();
        const targetLang = LANG_MAP[language] || "en-US";
        const matchingVoice = voices.find(v => v.lang.startsWith(targetLang.split("-")[0]));
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => {
          setVoiceState("speaking");
        };

        utterance.onend = () => {
          setTimeout(() => setVoiceState("idle"), 300);
        };

        utterance.onerror = () => {
          setVoiceState("idle");
        };

        utteranceRef.current = utterance;
        setVoiceState("speaking");
        window.speechSynthesis.speak(utterance);
      };

      // Browsers load voices asynchronously — wait if not ready yet
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        const onVoicesChanged = () => {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
          doSpeak();
        };
        window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
        // Fallback: speak anyway after 500ms even if voiceschanged never fires
        setTimeout(() => {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
          doSpeak();
        }, 500);
      }
    },
    [isTTSSupported, language]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setVoiceState("idle");
  }, []);

  const stopAll = useCallback(() => {
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  return {
    voiceState,
    transcript,
    isSupported,
    isTTSSupported,
    startListening,
    stopListening,
    speakResponse,
    stopSpeaking,
    stopAll,
  };
}
