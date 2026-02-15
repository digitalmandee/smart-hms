import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarProps {
  state?: AvatarState;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DoctorAvatar({ state = "idle", size = "md", className }: DoctorAvatarProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const ringSize = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer pulse ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-700",
          ringSize[size],
          state === "listening" && "bg-red-500/20 animate-ping",
          state === "speaking" && "bg-primary/20 animate-pulse",
          state === "thinking" && "bg-amber-500/15 animate-pulse",
          state === "idle" && "bg-primary/10"
        )}
      />

      {/* Secondary ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          sizeClasses[size],
          state === "listening" && "ring-2 ring-red-400/60 animate-pulse",
          state === "speaking" && "ring-2 ring-primary/60 animate-pulse",
          state === "thinking" && "ring-2 ring-amber-400/50",
          state === "idle" && "ring-1 ring-primary/20"
        )}
      />

      {/* Avatar circle */}
      <div
        className={cn(
          "relative rounded-full bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shadow-lg transition-transform duration-700",
          sizeClasses[size],
          state === "idle" && "animate-[float_4s_ease-in-out_infinite]",
          state === "speaking" && "scale-105"
        )}
      >
        {/* Doctor SVG */}
        <svg
          viewBox="0 0 100 100"
          className={cn(
            "w-3/4 h-3/4",
            state === "speaking" && "animate-[nod_1.5s_ease-in-out_infinite]"
          )}
        >
          {/* Head */}
          <circle cx="50" cy="35" r="18" fill="hsl(var(--primary-foreground))" opacity="0.95" />
          {/* Hair */}
          <path d="M32 30 Q35 15 50 14 Q65 15 68 30 Q65 22 50 22 Q35 22 32 30Z" fill="hsl(var(--foreground))" opacity="0.7" />
          {/* Eyes */}
          <circle cx="43" cy="33" r="2.5" fill="hsl(var(--foreground))" opacity="0.8">
            {state === "listening" && (
              <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="57" cy="33" r="2.5" fill="hsl(var(--foreground))" opacity="0.8">
            {state === "listening" && (
              <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>
          {/* Mouth */}
          {state === "speaking" ? (
            <ellipse cx="50" cy="42" rx="4" ry="3" fill="hsl(var(--foreground))" opacity="0.5">
              <animate attributeName="ry" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
            </ellipse>
          ) : (
            <path d="M44 41 Q50 46 56 41" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" opacity="0.5" />
          )}
          {/* Body / coat */}
          <path d="M32 55 Q32 50 50 48 Q68 50 68 55 L70 80 Q50 85 30 80 Z" fill="white" opacity="0.95" />
          {/* Stethoscope */}
          <path d="M42 55 Q38 62 40 70" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.8" />
          <circle cx="40" cy="72" r="3" fill="hsl(var(--primary))" opacity="0.8" />
          {/* Collar */}
          <path d="M42 52 L50 58 L58 52" stroke="hsl(var(--muted-foreground))" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>

        {/* Status indicator */}
        <span
          className={cn(
            "absolute bottom-1 right-1 rounded-full border-2 border-background transition-colors",
            size === "sm" ? "w-3 h-3" : "w-4 h-4",
            state === "listening" && "bg-red-500 animate-pulse",
            state === "speaking" && "bg-blue-500 animate-pulse",
            state === "thinking" && "bg-amber-500 animate-pulse",
            state === "idle" && "bg-green-500"
          )}
        />
      </div>

      {/* Sound waves for speaking */}
      {state === "speaking" && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary/60 rounded-full"
              style={{
                height: "8px",
                animation: `soundWave 0.8s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Ear waves for listening */}
      {state === "listening" && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-0.5 bg-red-400/70 rounded-full"
              style={{
                height: "6px",
                animation: `soundWave 0.6s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes nod {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(1px) rotate(1deg); }
          75% { transform: translateY(1px) rotate(-1deg); }
        }
        @keyframes soundWave {
          0%, 100% { height: 4px; opacity: 0.4; }
          50% { height: 12px; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
