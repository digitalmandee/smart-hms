import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { DoctorAvatar } from "./DoctorAvatar";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface AvatarPlaceholderCardProps {
  state?: AvatarState;
  className?: string;
}

const IDLE_BARS = [4, 6, 4, 8, 4, 6, 4, 8, 4, 6, 4];

export function AvatarPlaceholderCard({ state = "idle", className }: AvatarPlaceholderCardProps) {
  const [barHeights, setBarHeights] = useState<number[]>(IDLE_BARS);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

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
        setBarHeights(Array.from({ length: 11 }, () => Math.floor(6 + Math.random() * 14)));
      }, 100);
    } else {
      setBarHeights(IDLE_BARS);
    }
    return () => clearInterval(timerRef.current);
  }, [state]);

  const borderGlow =
    state === "speaking"
      ? "0 0 0 4px hsl(var(--primary)), 0 0 60px 20px hsl(var(--primary)/0.5), 0 0 100px 40px hsl(var(--primary)/0.2)"
      : state === "listening"
      ? "0 0 0 2px hsl(var(--primary)/0.5), 0 0 20px 4px hsl(var(--primary)/0.2)"
      : state === "thinking"
      ? "0 0 0 2px hsl(40 80% 55%/0.4), 0 0 16px 4px hsl(40 80% 55%/0.1)"
      : "0 0 0 1px hsl(var(--border))";

  const containerAnimation =
    state === "idle" ? "avatarCardFloat 5s ease-in-out infinite" : undefined;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl transition-[box-shadow,transform] duration-500 flex flex-col items-center justify-between",
          state === "speaking" && "scale-[1.03]"
        )}
        style={{
          width: "min(300px, 86vw)",
          height: "min(420px, 54vh)",
          boxShadow: borderGlow,
          background: "linear-gradient(160deg, hsl(174 84% 12%) 0%, hsl(174 84% 6%) 100%)",
          animation: containerAnimation,
        }}
      >
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 30%, hsl(174 84% 25% / 0.3) 0%, transparent 70%)",
          }}
        />

        {/* State tint overlay */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 pointer-events-none",
            state === "listening" && "bg-primary/[0.08]",
            state === "thinking" && "bg-amber-500/10",
            state === "speaking" && "bg-primary/[0.05]",
          )}
        />

        {/* Thinking shimmer */}
        {state === "thinking" && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Listening pulse ring */}
        {state === "listening" && (
          <div className="absolute inset-0 rounded-3xl ring-2 ring-primary/40 animate-pulse pointer-events-none" />
        )}

        {/* Status dot */}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full border-2 border-background/30 w-3.5 h-3.5 transition-colors z-20",
            state === "listening" && "bg-primary animate-pulse",
            state === "speaking" && "bg-primary animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />

        {/* Avatar — centered in top 70% */}
        <div className="flex-1 flex items-center justify-center w-full relative z-10 pt-6">
          <DoctorAvatar state={state} size="lg" />
        </div>

        {/* EQ bars */}
        <div className="relative z-10 w-full flex justify-center pb-2">
          {(state === "speaking" || state === "listening") ? (
            <div className="flex gap-[4px] items-end" style={{ height: "44px" }}>
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: `${h}px`,
                    borderRadius: "9999px",
                    background: "hsl(var(--primary))",
                    boxShadow: "0 0 6px 1px hsl(var(--primary)/0.6)",
                    transition: "height 75ms ease-out",
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{ height: "44px" }} />
          )}
        </div>

        {/* Name badge */}
        <div className="relative z-10 w-full px-4 pb-5">
          <div
            className="w-full rounded-2xl py-2.5 px-4 text-center"
            style={{
              background: "hsl(174 84% 8% / 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid hsl(174 84% 30% / 0.3)",
            }}
          >
            <p className="text-sm font-semibold tracking-wide" style={{ color: "hsl(174 84% 80%)" }}>
              Dr. Tabeebi 🩺
            </p>
            <p className="text-xs mt-0.5" style={{ color: "hsl(174 84% 60% / 0.7)" }}>
              AI Health Assistant
            </p>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-b-3xl" />
      </div>

      <style>{`
        @keyframes avatarCardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
