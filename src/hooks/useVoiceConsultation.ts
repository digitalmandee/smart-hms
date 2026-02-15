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
    puter: {
      ai: {
        txt2speech: (text: string) => Promise<Blob>;
      };
    };
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isTTSSupported =
    typeof window !== "undefined" && !!window.puter;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const startListening = useCallback(
    (onFinalTranscript?: (text: string) => void) => {
      if (!isSupported) return;

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
          onFinalTranscript?.(finalTranscript.trim());
        } else {
          setTranscript(interimTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setVoiceState("idle");
      };

      recognition.onend = () => {
        if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported, language, voiceState]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  }, []);

  const speakResponse = useCallback(
    async (text: string) => {
      if (!isTTSSupported || !text.trim()) return;

      // Clean markdown/special chars for better speech
      const cleanText = text
        .replace(/[#*_`~>\-|]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!cleanText) return;

      try {
        setVoiceState("speaking");
        const blob = await window.puter.ai.txt2speech(cleanText);
        
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setVoiceState("idle");
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        };

        audio.onerror = () => {
          setVoiceState("idle");
          URL.revokeObjectURL(url);
          audioUrlRef.current = null;
        };

        await audio.play();
      } catch (error) {
        console.error("TTS error:", error);
        setVoiceState("idle");
      }
    },
    [isTTSSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
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
