import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

const DOCTOR_PHOTO_URL =
  "https://plus.unsplash.com/premium_photo-1664475543697-229156438e1e?fm=jpg&q=80&w=800&auto=format&fit=crop";

const IDLE_BARS = [4, 6, 4, 8, 4, 6, 4, 8, 4, 6, 4];

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
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

  // Border glow — dramatic during speaking
  const borderGlow =
    state === "speaking"
      ? "0 0 0 4px hsl(var(--primary)), 0 0 60px 20px hsl(var(--primary)/0.5), 0 0 100px 40px hsl(var(--primary)/0.2)"
      : state === "listening"
      ? "0 0 0 2px hsl(var(--primary)/0.5), 0 0 20px 4px hsl(var(--primary)/0.2)"
      : state === "thinking"
      ? "0 0 0 2px hsl(40 80% 55%/0.4), 0 0 16px 4px hsl(40 80% 55%/0.1)"
      : "0 0 0 1px hsl(var(--border))";

  // Animation applied to the CONTAINER (not img) so overflow-hidden doesn't clip it
  const containerAnimation =
    state === "speaking"
      ? "headNod 0.65s ease-in-out infinite"
      : state === "idle"
      ? "avatarFloat 5s ease-in-out infinite"
      : undefined;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>

      {/* Portrait container — animation HERE so it's visible (not clipped) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl transition-[box-shadow,transform] duration-500",
          state === "speaking" && "scale-[1.03]"
        )}
        style={{
          width: "min(300px, 86vw)",
          height: "min(420px, 54vh)",
          boxShadow: borderGlow,
          animation: containerAnimation,
          perspective: "800px",
        }}
      >
        {/* Doctor photo — static, no animation on the img itself */}
        <img
          src={DOCTOR_PHOTO_URL}
          alt="Doctor avatar"
          className="w-full h-full object-cover"
          style={{ objectPosition: "50% 8%" }}
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
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

        {/* Dark mouth oval — scales open/closed with mouthOpenness (visible on bright photo) */}
        {state === "speaking" && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              bottom: "29%",
              width: `${36 + mouthOpenness * 20}px`,
              height: `${8 + mouthOpenness * 22}px`,
              background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 80%)",
              borderRadius: "50%",
              transition: "width 70ms ease-out, height 70ms ease-out",
            }}
          />
        )}

        {/* EQ bars — inside portrait, bottom-center overlay, big + glowing */}
        {(state === "speaking" || state === "listening") && (
          <div
            className="absolute left-1/2 -translate-x-1/2 flex gap-[4px] items-end pointer-events-none"
            style={{ bottom: "52px", height: "60px" }}
          >
            {barHeights.map((h, i) => (
              <div
                key={i}
                style={{
                  width: "7px",
                  height: `${h}px`,
                  borderRadius: "9999px",
                  background: "hsl(var(--primary))",
                  boxShadow: "0 0 6px 1px hsl(var(--primary)/0.6)",
                  transition: "height 75ms ease-out",
                }}
              />
            ))}
          </div>
        )}

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
            "absolute top-3 right-3 rounded-full border-2 border-background w-3.5 h-3.5 transition-colors",
            state === "listening" && "bg-primary animate-pulse",
            state === "speaking" && "bg-primary animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />
      </div>

      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes headNod {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          30% { transform: translateY(-8px) rotateX(1.5deg); }
          70% { transform: translateY(6px) rotateX(-1deg); }
        }
      `}</style>
    </div>
  );
}
