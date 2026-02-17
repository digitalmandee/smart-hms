import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

// Arabic/Gulf Muslim female doctor — hijab, white coat, stethoscope, studio background
// From: https://unsplash.com/photos/BK25mS15dhk
const DOCTOR_PHOTO_URL =
  "https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?fm=jpg&q=80&w=800&auto=format&fit=crop";

const IDLE_BARS   = [4, 6, 4, 8, 4, 6, 4, 8, 4, 6, 4];

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
  const [barHeights, setBarHeights] = useState<number[]>(IDLE_BARS);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // JS-driven bar animation — speaking: random tall bars, listening: random short uniform bars
  useEffect(() => {
    clearInterval(timerRef.current);

    if (state === "speaking") {
      timerRef.current = setInterval(() => {
        setBarHeights(
          Array.from({ length: 11 }, (_, i) => {
            const isCenter = i >= 3 && i <= 7;
            const min = isCenter ? 10 : 4;
            const max = isCenter ? 40 : 22;
            return Math.floor(min + Math.random() * (max - min));
          })
        );
      }, 80);
    } else if (state === "listening") {
      timerRef.current = setInterval(() => {
        setBarHeights(
          Array.from({ length: 11 }, () => Math.floor(6 + Math.random() * 14))
        );
      }, 100);
    } else {
      setBarHeights(IDLE_BARS);
    }

    return () => clearInterval(timerRef.current);
  }, [state]);

  // Mouth openness driven by center bar average
  const mouthOpenness =
    state === "speaking"
      ? Math.min(1, (barHeights[4] + barHeights[5] + barHeights[6]) / (3 * 40))
      : 0;

  // Border glow color per state
  const borderGlow =
    state === "speaking"
      ? "0 0 0 3px hsl(var(--primary)/0.8), 0 0 40px 10px hsl(var(--primary)/0.35)"
      : state === "listening"
      ? "0 0 0 2px hsl(var(--primary)/0.5), 0 0 20px 4px hsl(var(--primary)/0.2)"
      : state === "thinking"
      ? "0 0 0 2px hsl(40 80% 55%/0.4), 0 0 16px 4px hsl(40 80% 55%/0.1)"
      : "0 0 0 1px hsl(var(--border))";

  return (
    <div className={cn("relative flex flex-col items-center gap-3", className)}>

      {/* Portrait container */}
      <div
        className="relative overflow-hidden rounded-3xl transition-all duration-500"
        style={{
          width: "min(300px, 86vw)",
          height: "min(420px, 54vh)",
          boxShadow: borderGlow,
          transform: state === "speaking" ? "scale(1.015)" : "scale(1)",
        }}
      >
        {/* Doctor photo */}
        <img
          src={DOCTOR_PHOTO_URL}
          alt="Dr. Fatima Al-Tabeebi"
          className="w-full h-full object-cover"
          style={{
            objectPosition: "50% 8%",
            animation:
              state === "speaking"
                ? "headNod 0.65s ease-in-out infinite"
                : state === "idle"
                ? "avatarFloat 5s ease-in-out infinite"
                : undefined,
          }}
        />

        {/* State tint overlay */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 pointer-events-none",
            state === "listening" && "bg-primary/8",
            state === "thinking" && "bg-amber-500/10",
            state === "speaking" && "bg-primary/5",
          )}
        />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/70 to-transparent pointer-events-none" />

        {/* Mouth glow overlay — driven by mouthOpenness */}
        {state === "speaking" && (
          <>
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                bottom: "24%",
                width: "90px",
                height: `${10 + mouthOpenness * 28}px`,
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                transition: "height 75ms ease-out",
                borderRadius: "50%",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{
                bottom: "25%",
                width: "52px",
                height: `${6 + mouthOpenness * 18}px`,
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)",
                transition: "height 60ms ease-out",
                borderRadius: "50%",
              }}
            />
          </>
        )}

        {/* Thinking shimmer */}
        {state === "thinking" && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Listening pulse ring */}
        {state === "listening" && (
          <div className="absolute inset-0 rounded-3xl ring-2 ring-primary/40 animate-pulse pointer-events-none" />
        )}

        {/* Name card overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pointer-events-none">
          <p className="text-[13px] font-semibold text-white drop-shadow-md">Dr. Fatima Al-Tabeebi</p>
          <p className="text-[11px] text-white/80 drop-shadow">🇦🇪 Family Medicine · Dubai, UAE</p>
        </div>

        {/* Status dot */}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full border-2 border-background w-3.5 h-3.5 transition-colors",
            state === "listening" && "bg-primary animate-pulse",
            state === "speaking" && "bg-primary animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />
      </div>

      {/* Equalizer bars — JS-driven heights */}
      <div className="flex gap-[3px] items-end" style={{ height: "48px" }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            className={cn(
              "rounded-full transition-[height] duration-75",
              state === "speaking" || state === "listening" ? "bg-primary" : "bg-muted-foreground/25",
              state !== "speaking" && state !== "listening" && "opacity-40"
            )}
            style={{ width: "5px", height: `${h}px` }}
          />
        ))}
      </div>

      {/* Attribution (required for Unsplash+ embed) */}
      <p className="text-[9px] text-muted-foreground/40 -mt-1">Photo: Unsplash+</p>

      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes headNod {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(0.4deg); }
          70% { transform: translateY(3px) rotate(-0.3deg); }
        }
      `}</style>
    </div>
  );
}
