import { cn } from "@/lib/utils";
import drTabeebiPhoto from "@/assets/dr-tabeebi-avatar.jpg";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
  return (
    <div className={cn("relative flex flex-col items-center gap-6", className)}>
      {/* Avatar ring container */}
      <div className="relative flex items-center justify-center">
        {/* Outermost pulse ring */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-700",
            "w-[360px] h-[360px]",
            state === "listening" && "bg-primary/10 animate-ping",
            state === "speaking" && "bg-primary/15 animate-pulse",
            state === "thinking" && "bg-amber-500/10 animate-pulse",
            state === "idle" && "bg-primary/5"
          )}
        />
        {/* Mid ring */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-500",
            "w-[320px] h-[320px]",
            state === "listening" && "ring-2 ring-primary/40 animate-pulse",
            state === "speaking" && "ring-4 ring-primary/60 animate-pulse",
            state === "thinking" && "ring-2 ring-amber-400/30",
            state === "idle" && "ring-1 ring-primary/15"
          )}
        />
        {/* Inner ring */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-300",
            "w-[290px] h-[290px]",
            state === "listening" && "ring-2 ring-primary/60",
            state === "speaking" && "ring-4 ring-primary/80",
            (state === "thinking" || state === "idle") && "ring-0"
          )}
        />

        {/* Waveform bars — listening (left side) */}
        {state === "listening" && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-primary/70 rounded-full"
                style={{
                  height: "10px",
                  animation: `largeWave 0.7s ease-in-out ${i * 0.12}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Waveform bars — speaking (right side) */}
        {state === "speaking" && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-primary/70 rounded-full"
                style={{
                  height: "10px",
                  animation: `largeWave 0.55s ease-in-out ${i * 0.09}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Photo avatar circle */}
        <div
          className={cn(
            "relative rounded-full overflow-hidden transition-all duration-700",
            "w-[272px] h-[272px]",
            state === "idle" && "animate-[avatarFloat_4s_ease-in-out_infinite] shadow-2xl",
            state === "speaking" && "scale-[1.04] shadow-[0_0_50px_12px_hsl(var(--primary)/0.35)]",
            state === "listening" && "shadow-[0_0_30px_6px_hsl(var(--primary)/0.25)]",
            state === "thinking" && "shadow-[0_0_20px_4px_hsl(var(--primary)/0.15)] shadow-2xl",
          )}
        >
          {/* Real doctor photo */}
          <img
            src={drTabeebiPhoto}
            alt="Dr. Tabeebi"
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              state === "idle" && "animate-[breatheScale_5s_ease-in-out_infinite]",
              state === "listening" && "brightness-110 scale-105",
              state === "speaking" && "scale-[1.03]",
            )}
            style={{ objectPosition: "50% 8%" }}
          />

          {/* State color overlay */}
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500 pointer-events-none",
              state === "listening" && "bg-primary/8",
              state === "speaking" && "bg-primary/5",
              state === "thinking" && "bg-amber-500/10",
              state === "idle" && "bg-transparent"
            )}
          />

          {/* Speaking — mouth area animated overlay (lower face) */}
          {state === "speaking" && (
            <>
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-white/25 blur-md"
                style={{
                  bottom: "23%",
                  width: "90px",
                  height: "30px",
                  animation: "mouthPulse 0.38s ease-in-out infinite",
                }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-primary/20 blur-sm"
                style={{
                  bottom: "24%",
                  width: "55px",
                  height: "16px",
                  animation: "mouthPulse 0.28s ease-in-out 0.05s infinite",
                }}
              />
            </>
          )}

          {/* Thinking shimmer */}
          {state === "thinking" && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-pulse" />
          )}
        </div>

        {/* Status dot */}
        <span
          className={cn(
            "absolute bottom-3 right-[calc(50%-136px+8px)] rounded-full border-2 border-background w-5 h-5 transition-colors z-10",
            state === "listening" && "bg-primary animate-pulse",
            state === "speaking" && "bg-primary animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />
      </div>

      {/* Equalizer bars below avatar — only when speaking */}
      <div className="h-10 flex items-end justify-center">
        {state === "speaking" ? (
          <div className="flex gap-1 items-end">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-2 bg-primary/70 rounded-full"
                style={{
                  animation: `eqBar ${0.4 + (i % 3) * 0.1}s ease-in-out ${i * 0.07}s infinite alternate`,
                  minHeight: "4px",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-1 items-end opacity-20">
            {[8, 14, 6, 18, 8, 12, 6].map((h, i) => (
              <div key={i} className="w-2 bg-muted-foreground rounded-full" style={{ height: `${h}px` }} />
            ))}
          </div>
        )}
      </div>

      {/* Doctor name + specialty card */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-foreground tracking-wide">Dr. Fatima Al-Tabeebi</p>
        <p className="text-xs text-muted-foreground">Family Medicine · Dubai, UAE</p>
      </div>

      <style>{`
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes breatheScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes largeWave {
          0%, 100% { height: 6px; opacity: 0.4; }
          50% { height: 24px; opacity: 0.9; }
        }
        @keyframes mouthPulse {
          0%, 100% { opacity: 0.25; transform: translateX(-50%) scaleX(0.65); }
          50% { opacity: 0.85; transform: translateX(-50%) scaleX(1.25); }
        }
        @keyframes eqBar {
          from { height: 4px; opacity: 0.5; }
          to { height: 28px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
