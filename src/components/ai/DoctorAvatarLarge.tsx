import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

// Reliable Unsplash photo of an Arabic/Middle-Eastern female doctor in white coat
const DOCTOR_PHOTO_URL =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&crop=faces&auto=format&q=80";

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
  return (
    <div className={cn("relative flex flex-col items-center gap-4", className)}>
      {/* Avatar ring container */}
      <div className="relative flex items-center justify-center">

        {/* Outermost ambient pulse ring */}
        <div
          className={cn(
            "absolute rounded-full transition-all duration-700",
            "w-[340px] h-[340px]",
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
            "w-[304px] h-[304px]",
            state === "listening" && "ring-2 ring-primary/40 animate-pulse",
            state === "speaking" && "ring-4 ring-primary/70 animate-[speakRing_0.8s_ease-in-out_infinite]",
            state === "thinking" && "ring-2 ring-amber-400/30",
            state === "idle" && "ring-1 ring-primary/15"
          )}
        />

        {/* Waveform bars — listening (left side) */}
        {state === "listening" && (
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-primary/70 rounded-full"
                style={{
                  height: "12px",
                  transformOrigin: "center",
                  animation: `waveBar 0.7s ease-in-out ${i * 0.12}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* Photo avatar circle */}
        <div
          className={cn(
            "relative rounded-full overflow-hidden transition-all duration-500",
            "w-[280px] h-[280px]",
            state === "idle" && "animate-[avatarFloat_4s_ease-in-out_infinite] shadow-2xl",
            state === "speaking" &&
              "scale-[1.03] shadow-[0_0_56px_16px_hsl(var(--primary)/0.45)]",
            state === "listening" &&
              "shadow-[0_0_30px_6px_hsl(var(--primary)/0.3)]",
            state === "thinking" &&
              "shadow-[0_0_20px_4px_hsl(var(--primary)/0.15)] shadow-2xl"
          )}
        >
          {/* Doctor photo */}
          <img
            src={DOCTOR_PHOTO_URL}
            alt="Dr. Fatima Al-Tabeebi"
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              state === "idle" && "animate-[breatheScale_5s_ease-in-out_infinite]",
              state === "listening" && "brightness-110 scale-105",
              state === "speaking" && "scale-[1.04]",
            )}
            style={{
              objectPosition: "50% 10%",
              animation:
                state === "speaking"
                  ? "headNod 0.7s ease-in-out infinite"
                  : undefined,
            }}
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

          {/* Speaking — bright visible mouth area glow */}
          {state === "speaking" && (
            <>
              {/* Outer soft glow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  bottom: "22%",
                  width: "80px",
                  height: "26px",
                  background:
                    "radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
                  animation: "mouthPulse 0.38s ease-in-out infinite",
                  borderRadius: "50%",
                }}
              />
              {/* Inner bright core */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  bottom: "23%",
                  width: "46px",
                  height: "14px",
                  background:
                    "radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 100%)",
                  animation: "mouthPulse 0.28s ease-in-out 0.06s infinite",
                  borderRadius: "50%",
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
            "absolute bottom-2 right-[calc(50%-140px+10px)] rounded-full border-2 border-background w-5 h-5 transition-colors z-10",
            state === "listening" && "bg-primary animate-pulse",
            state === "speaking" && "bg-primary animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />
      </div>

      {/* Equalizer bars — visible only when speaking */}
      <div className="h-10 flex items-end justify-center">
        {state === "speaking" ? (
          <div className="flex gap-[3px] items-end">
            {[32, 18, 28, 14, 32, 20, 26, 12, 30, 16, 24].map((baseH, i) => (
              <div
                key={i}
                className="w-[5px] bg-primary rounded-full"
                style={{
                  height: `${baseH}px`,
                  transformOrigin: "bottom",
                  animation: `eqBar ${0.38 + (i % 4) * 0.09}s ease-in-out ${i * 0.055}s infinite alternate`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-[3px] items-end opacity-15">
            {[10, 16, 8, 20, 10, 14, 8, 18, 10, 14, 8].map((h, i) => (
              <div
                key={i}
                className="w-[5px] bg-muted-foreground rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Doctor name + specialty card */}
      <div className="text-center space-y-0.5">
        <p className="text-sm font-semibold text-foreground tracking-wide">
          Dr. Fatima Al-Tabeebi
        </p>
        <p className="text-xs text-muted-foreground">
          🇦🇪 Family Medicine · Dubai, UAE
        </p>
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
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.3); opacity: 0.4; }
          50% { transform: scaleY(1.8); opacity: 0.9; }
        }
        @keyframes headNod {
          0%, 100% { transform: scale(1.04) translateY(0px); }
          35% { transform: scale(1.04) translateY(-4px) rotate(0.5deg); }
          70% { transform: scale(1.04) translateY(3px) rotate(-0.3deg); }
        }
        @keyframes mouthPulse {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleX(0.6); }
          50% { opacity: 1; transform: translateX(-50%) scaleX(1.3); }
        }
        @keyframes eqBar {
          from { transform: scaleY(0.15); opacity: 0.55; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes speakRing {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary)/0.5); }
          50% { box-shadow: 0 0 0 8px hsl(var(--primary)/0); }
        }
      `}</style>
    </div>
  );
}
