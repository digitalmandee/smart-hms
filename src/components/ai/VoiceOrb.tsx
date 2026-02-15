import { cn } from "@/lib/utils";

type OrbState = "idle" | "listening" | "speaking" | "thinking";

interface VoiceOrbProps {
  state?: OrbState;
  className?: string;
  onClick?: () => void;
}

export function VoiceOrb({ state = "idle", className, onClick }: VoiceOrbProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none",
        state === "idle" && "bg-primary/10 hover:bg-primary/20 hover:scale-105",
        state === "listening" && "bg-red-500/20 scale-110",
        state === "speaking" && "bg-primary/20 scale-105",
        state === "thinking" && "bg-amber-500/15",
        className
      )}
    >
      {/* Outer ring animations */}
      {state === "listening" && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-ping" />
          <span className="absolute inset-[-4px] rounded-full border border-red-400/20 animate-pulse" />
        </>
      )}
      {state === "speaking" && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
          <span className="absolute inset-[-6px] rounded-full border border-primary/15 animate-pulse" style={{ animationDelay: "0.3s" }} />
        </>
      )}

      {/* Core orb */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
          state === "idle" && "bg-primary shadow-md",
          state === "listening" && "bg-red-500 shadow-lg shadow-red-500/30",
          state === "speaking" && "bg-primary shadow-lg shadow-primary/30",
          state === "thinking" && "bg-amber-500 shadow-lg shadow-amber-500/30 animate-pulse"
        )}
      >
        {/* Waveform bars inside orb */}
        <div className="flex items-center gap-[2px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "w-[3px] rounded-full transition-all",
                state === "idle" && "bg-primary-foreground/70 h-2",
                state === "listening" && "bg-white",
                state === "speaking" && "bg-primary-foreground",
                state === "thinking" && "bg-white/80 h-2"
              )}
              style={
                state === "listening" || state === "speaking"
                  ? {
                      animation: `orbWave 0.8s ease-in-out ${i * 0.1}s infinite`,
                    }
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes orbWave {
          0%, 100% { height: 6px; }
          50% { height: 16px; }
        }
      `}</style>
    </button>
  );
}
