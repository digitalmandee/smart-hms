import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarProps {
  state?: AvatarState;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function DoctorAvatar({ state = "idle", size = "md", className }: DoctorAvatarProps) {
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-[120px] h-[120px]",
  };

  const ringSize = {
    xs: "w-9 h-9",
    sm: "w-14 h-14",
    md: "w-24 h-24",
    lg: "w-[136px] h-[136px]",
  };

  const showRings = size === "md" || size === "lg";
  const showStatusDot = size !== "xs";
  const showWaves = (size === "md" || size === "lg");

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer pulse ring — only md/lg */}
      {showRings && (
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
      )}

      {/* Secondary ring — only md/lg */}
      {showRings && (
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
      )}

      {/* Avatar circle */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center shadow-lg transition-transform duration-700 overflow-hidden",
          sizeClasses[size],
          state === "idle" && size !== "xs" && "animate-[float_4s_ease-in-out_infinite]",
          state === "speaking" && "scale-105"
        )}
        style={{
          background: "linear-gradient(135deg, #4A90A4 0%, #2C6E7F 50%, #1D5566 100%)",
        }}
      >
        {/* Detailed Doctor SVG */}
        <svg
          viewBox="0 0 100 100"
          className={cn(
            "w-full h-full",
            state === "speaking" && "animate-[nod_1.5s_ease-in-out_infinite]"
          )}
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5D0A9" />
              <stop offset="100%" stopColor="#E8B88A" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B3B3B" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <linearGradient id="coatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </linearGradient>
          </defs>

          {/* Neck */}
          <rect x="43" y="50" width="14" height="10" rx="3" fill="url(#skinGrad)" />

          {/* White coat / body */}
          <path
            d="M25 62 Q25 55 50 53 Q75 55 75 62 L78 95 Q50 100 22 95 Z"
            fill="url(#coatGrad)"
            stroke="#E0E0E0"
            strokeWidth="0.5"
          />
          {/* Coat lapels */}
          <path d="M42 55 L50 65 L58 55" stroke="#D0D0D0" strokeWidth="1.2" fill="none" />
          {/* Coat buttons */}
          <circle cx="50" cy="72" r="1.5" fill="#C0C0C0" />
          <circle cx="50" cy="80" r="1.5" fill="#C0C0C0" />

          {/* Stethoscope */}
          <path
            d="M40 58 Q36 65 37 75 Q37 78 40 78"
            stroke="#2C6E7F"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="40" cy="80" r="3.5" fill="#2C6E7F" />
          <circle cx="40" cy="80" r="1.5" fill="#1D5566" />

          {/* Head */}
          <ellipse cx="50" cy="35" rx="20" ry="22" fill="url(#skinGrad)" />

          {/* Hair — neatly parted */}
          <path
            d="M30 32 Q32 12 50 10 Q68 12 70 32 Q68 20 55 18 L50 20 L45 18 Q32 20 30 32Z"
            fill="url(#hairGrad)"
          />
          {/* Side hair */}
          <path d="M30 32 Q28 38 30 42" stroke="#2A2A2A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M70 32 Q72 38 70 42" stroke="#2A2A2A" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M38 27 Q42 25 46 27" stroke="#3B3B3B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M54 27 Q58 25 62 27" stroke="#3B3B3B" strokeWidth="1.3" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          <g>
            {/* Left eye white */}
            <ellipse cx="42" cy="33" rx="5" ry="3.5" fill="white" />
            {/* Left iris */}
            <circle cx="42" cy="33" r="2.5" fill="#4A3728">
              {state === "listening" && (
                <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Left pupil */}
            <circle cx="42" cy="33" r="1.2" fill="#1A1A1A" />
            {/* Left eye shine */}
            <circle cx="43.5" cy="32" r="0.7" fill="white" opacity="0.8" />
            {/* Blink animation for idle */}
            {state === "idle" && (
              <ellipse cx="42" cy="33" rx="5" ry="3.5" fill="url(#skinGrad)">
                <animate attributeName="ry" values="0;0;0;0;0;0;0;0;0;3.5;0;0;0;0;0;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
              </ellipse>
            )}
          </g>
          <g>
            {/* Right eye white */}
            <ellipse cx="58" cy="33" rx="5" ry="3.5" fill="white" />
            {/* Right iris */}
            <circle cx="58" cy="33" r="2.5" fill="#4A3728">
              {state === "listening" && (
                <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>
            {/* Right pupil */}
            <circle cx="58" cy="33" r="1.2" fill="#1A1A1A" />
            {/* Right eye shine */}
            <circle cx="59.5" cy="32" r="0.7" fill="white" opacity="0.8" />
            {state === "idle" && (
              <ellipse cx="58" cy="33" rx="5" ry="3.5" fill="url(#skinGrad)">
                <animate attributeName="ry" values="0;0;0;0;0;0;0;0;0;3.5;0;0;0;0;0;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
              </ellipse>
            )}
          </g>

          {/* Nose */}
          <path d="M48 37 Q50 40 52 37" stroke="#D4A574" strokeWidth="1" fill="none" strokeLinecap="round" />

          {/* Mouth */}
          {state === "speaking" ? (
            <g>
              <ellipse cx="50" cy="44" rx="5" ry="3" fill="#C0756B">
                <animate attributeName="ry" values="2;4;1;3;2" dur="0.6s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="50" cy="43" rx="4" ry="1" fill="white" opacity="0.6" />
            </g>
          ) : (
            <path d="M44 43 Q47 46 50 46 Q53 46 56 43" stroke="#C0756B" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}

          {/* Glasses */}
          <rect x="35" y="29" width="14" height="10" rx="3" stroke="#666" strokeWidth="1.2" fill="none" opacity="0.6" />
          <rect x="51" y="29" width="14" height="10" rx="3" stroke="#666" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M49 34 L51 34" stroke="#666" strokeWidth="1" opacity="0.6" />
          <path d="M35 34 L30 32" stroke="#666" strokeWidth="0.8" opacity="0.4" />
          <path d="M65 34 L70 32" stroke="#666" strokeWidth="0.8" opacity="0.4" />

          {/* Ears */}
          <ellipse cx="28" cy="35" rx="3" ry="5" fill="url(#skinGrad)" />
          <ellipse cx="72" cy="35" rx="3" ry="5" fill="url(#skinGrad)" />
        </svg>

        {/* Status indicator — not on xs */}
        {showStatusDot && (
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 rounded-full border-2 border-background transition-colors",
              size === "sm" ? "w-3 h-3" : "w-4 h-4",
              state === "listening" && "bg-red-500 animate-pulse",
              state === "speaking" && "bg-blue-500 animate-pulse",
              state === "thinking" && "bg-amber-500 animate-pulse",
              state === "idle" && "bg-green-500"
            )}
          />
        )}
      </div>

      {/* Sound waves for speaking — only md/lg */}
      {showWaves && state === "speaking" && (
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

      {/* Ear waves for listening — only md/lg */}
      {showWaves && state === "listening" && (
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
