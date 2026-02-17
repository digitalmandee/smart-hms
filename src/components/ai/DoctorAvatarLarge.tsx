import { cn } from "@/lib/utils";
import drTabeebiPhoto from "@/assets/dr-tabeebi-avatar.jpg";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outermost pulse ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-700",
          "w-[340px] h-[340px]",
          state === "listening" && "bg-primary/10 animate-ping",
          state === "speaking" && "bg-primary/10 animate-pulse",
          state === "thinking" && "bg-amber-500/10 animate-pulse",
          state === "idle" && "bg-primary/5"
        )}
      />
      {/* Mid ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          "w-[300px] h-[300px]",
          state === "listening" && "ring-2 ring-primary/40 animate-pulse",
          state === "speaking" && "ring-2 ring-primary/50 animate-pulse",
          state === "thinking" && "ring-2 ring-amber-400/30",
          state === "idle" && "ring-1 ring-primary/15"
        )}
      />
      {/* Inner ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-300",
          "w-[272px] h-[272px]",
          state === "listening" && "ring-2 ring-primary/60",
          state === "speaking" && "ring-2 ring-primary/60",
          (state === "thinking" || state === "idle") && "ring-0"
        )}
      />

      {/* Waveform bars — listening (left side) */}
      {state === "listening" && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
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
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 bg-primary/70 rounded-full"
              style={{
                height: "10px",
                animation: `largeWave 0.6s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Photo avatar circle */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden shadow-2xl transition-all duration-700",
          "w-[260px] h-[260px]",
          state === "idle" && "animate-[avatarFloat_4s_ease-in-out_infinite]",
          state === "speaking" && "scale-[1.03]",
        )}
      >
        {/* Real doctor photo */}
        <img
          src={drTabeebiPhoto}
          alt="Dr. Tabeebi"
          className={cn(
            "w-full h-full object-cover object-top transition-transform duration-700",
            state === "idle" && "animate-[breatheScale_5s_ease-in-out_infinite]",
            state === "listening" && "brightness-110",
          )}
          style={{ objectPosition: "50% 10%" }}
        />

        {/* State color overlay */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-500 pointer-events-none",
            state === "listening" && "bg-primary/10",
            state === "speaking" && "bg-primary/5",
            state === "thinking" && "bg-amber-500/10",
            state === "idle" && "bg-transparent"
          )}
        />

        {/* Speaking mouth pulse overlay — covers lower-face area */}
        {state === "speaking" && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-primary/20 blur-md"
            style={{
              bottom: "22%",
              width: "60px",
              height: "18px",
              animation: "mouthPulse 0.45s ease-in-out infinite",
            }}
          />
        )}

        {/* Thinking shimmer */}
        {state === "thinking" && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-amber-400/10 to-transparent animate-pulse" />
        )}
      </div>

      {/* Status dot */}
      <span
        className={cn(
          "absolute bottom-4 right-[calc(50%-130px+8px)] rounded-full border-2 border-background w-5 h-5 transition-colors z-10",
          state === "listening" && "bg-primary animate-pulse",
          state === "speaking" && "bg-primary animate-pulse",
          state === "thinking" && "bg-amber-500 animate-pulse",
          state === "idle" && "bg-green-500"
        )}
      />

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
          50% { height: 22px; opacity: 0.9; }
        }
        @keyframes mouthPulse {
          0%, 100% { opacity: 0.3; transform: translateX(-50%) scaleX(0.7); }
          50% { opacity: 0.9; transform: translateX(-50%) scaleX(1.2); }
        }
      `}</style>
    </div>
  );
}
