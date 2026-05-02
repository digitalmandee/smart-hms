import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import doctorImg from "@/assets/tabeebi-doctor.jpg";

interface LiveDoctorPortraitProps {
  /** Whether the agent is actively speaking. Triggers mouth animation. */
  isSpeaking: boolean;
  /** Returns a Uint8Array of byte frequency data (0-255), or null. */
  getFrequencyData?: () => Uint8Array | null | undefined;
  /** "connecting" | "live" | "idle" — drives the status pill. */
  status?: "idle" | "connecting" | "live";
  className?: string;
}

/**
 * Full-bleed portrait of Dr. Tabeebi with audio-driven mouth animation.
 * Reads live frequency data from the active audio stream and animates a
 * mouth overlay (scale + opacity) in sync with what's actually being heard.
 * Also adds subtle ambient motion (blink, breathing) so the face never
 * feels frozen.
 */
export function LiveDoctorPortrait({
  isSpeaking,
  getFrequencyData,
  status = "idle",
  className,
}: LiveDoctorPortraitProps) {
  const mouthRef = useRef<HTMLDivElement>(null);
  const eyelidLeftRef = useRef<HTMLDivElement>(null);
  const eyelidRightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [mouthShape, setMouthShape] = useState<"closed" | "small" | "open" | "wide">("closed");

  // Audio-driven mouth animation
  useEffect(() => {
    let smoothed = 0;
    const tick = () => {
      const data = getFrequencyData?.();
      let amp = 0;
      let centroid = 0;

      if (data && data.length > 0 && isSpeaking) {
        // Use mid-band (vocal range) for amplitude
        let sum = 0;
        let weighted = 0;
        let total = 0;
        const n = Math.min(data.length, 128);
        for (let i = 2; i < n; i++) {
          const v = data[i];
          sum += v;
          weighted += v * i;
          total += v;
        }
        amp = Math.min(1, sum / n / 140);
        centroid = total > 0 ? weighted / total / n : 0;
      }

      // Smooth to avoid jitter
      smoothed = smoothed * 0.55 + amp * 0.45;

      const m = mouthRef.current;
      if (m) {
        // Scale Y to indicate mouth opening
        const openY = 0.25 + smoothed * 1.6;
        const openX = centroid > 0.35 ? 1.15 : 0.95; // wider on high-frequency (E/I)
        m.style.transform = `translate(-50%, -50%) scaleX(${openX}) scaleY(${openY})`;
        m.style.opacity = String(0.55 + smoothed * 0.45);
      }

      // Pick a discrete shape for caption-style readability
      if (!isSpeaking || smoothed < 0.05) setMouthShape("closed");
      else if (smoothed < 0.2) setMouthShape("small");
      else if (centroid > 0.4) setMouthShape("wide");
      else setMouthShape("open");

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isSpeaking, getFrequencyData]);

  // Blink loop
  useEffect(() => {
    let cancelled = false;
    const blink = () => {
      if (cancelled) return;
      const eyes = [eyelidLeftRef.current, eyelidRightRef.current];
      eyes.forEach((e) => e && (e.style.transform = "scaleY(1)"));
      setTimeout(() => {
        eyes.forEach((e) => e && (e.style.transform = "scaleY(0.05)"));
      }, 80);
      const next = 2500 + Math.random() * 3500;
      setTimeout(blink, next);
    };
    const t = setTimeout(blink, 1500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black", className)}>
      {/* Base portrait — subtle breathing animation */}
      <div className="absolute inset-0 animate-[breathe_5s_ease-in-out_infinite]">
        <img
          src={doctorImg}
          alt="Dr. Tabeebi"
          className="w-full h-full object-cover object-center"
          draggable={false}
        />
      </div>

      {/*
        Mouth overlay — positioned over the doctor's lips.
        These coordinates are tuned to the generated portrait
        (face center ~50% X, mouth ~63% Y).
      */}
      <div
        className="absolute pointer-events-none"
        style={{ left: "50%", top: "63%", width: "11%", height: "5%" }}
      >
        <div
          ref={mouthRef}
          className="absolute left-1/2 top-1/2 w-full h-full rounded-[50%] transition-[background] duration-150"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(40,15,15,0.95) 30%, rgba(80,30,30,0.6) 70%, rgba(120,60,60,0) 100%)",
            transform: "translate(-50%, -50%) scaleY(0.25)",
            transformOrigin: "center",
            willChange: "transform, opacity",
            opacity: 0.6,
          }}
        />
        {/* Subtle teeth highlight when wide */}
        {mouthShape === "wide" && (
          <div
            className="absolute left-1/2 top-1/2 w-[80%] h-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
          />
        )}
      </div>

      {/* Eyelids — for blinking. Positioned over the eyes. */}
      <div
        ref={eyelidLeftRef}
        className="absolute pointer-events-none origin-top transition-transform duration-75"
        style={{
          left: "39%",
          top: "33.5%",
          width: "9%",
          height: "3.2%",
          background: "linear-gradient(to bottom, rgba(180,130,100,0.95), rgba(140,95,75,0.85))",
          borderRadius: "50% 50% 30% 30%",
          transform: "scaleY(0.05)",
        }}
      />
      <div
        ref={eyelidRightRef}
        className="absolute pointer-events-none origin-top transition-transform duration-75"
        style={{
          left: "53%",
          top: "33.5%",
          width: "9%",
          height: "3.2%",
          background: "linear-gradient(to bottom, rgba(180,130,100,0.95), rgba(140,95,75,0.85))",
          borderRadius: "50% 50% 30% 30%",
          transform: "scaleY(0.05)",
        }}
      />

      {/* Subtle vignette to feel like a video call */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      {/* Status pill (top-left, FaceTime-style) */}
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/55 backdrop-blur-md px-3 py-1.5 text-white">
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            status === "live" && "bg-red-500 animate-pulse",
            status === "connecting" && "bg-amber-400 animate-pulse",
            status === "idle" && "bg-zinc-400",
          )}
        />
        <span className="text-xs font-medium tracking-wide">
          {status === "live" ? "LIVE" : status === "connecting" ? "Connecting…" : "Dr. Tabeebi"}
        </span>
      </div>

      {/* Local keyframes for breathing */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
      `}</style>
    </div>
  );
}
