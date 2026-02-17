import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface DoctorAvatarLargeProps {
  state?: AvatarState;
  className?: string;
}

export function DoctorAvatarLarge({ state = "idle", className }: DoctorAvatarLargeProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Pulse rings behind avatar */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-700",
          "w-[340px] h-[340px]",
          state === "listening" && "bg-primary/10 animate-ping",
          state === "speaking" && "bg-primary/10 animate-pulse",
          state === "thinking" && "bg-amber-500/8 animate-pulse",
          state === "idle" && "bg-primary/5"
        )}
      />
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
      <div
        className={cn(
          "absolute rounded-full transition-all duration-300",
          "w-[270px] h-[270px]",
          state === "listening" && "ring-1 ring-primary/60",
          state === "speaking" && "ring-1 ring-primary/60",
          (state === "thinking" || state === "idle") && "ring-0"
        )}
      />

      {/* Left waveform bars — show when listening */}
      {state === "listening" && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
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

      {/* Right waveform bars — show when speaking */}
      {state === "speaking" && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-center">
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

      {/* Avatar circle */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center shadow-2xl overflow-hidden transition-transform duration-700",
          "w-[260px] h-[260px]",
          state === "idle" && "animate-[avatarFloat_4s_ease-in-out_infinite]",
          state === "speaking" && "scale-[1.03]",
        )}
        style={{
          background: "linear-gradient(135deg, hsl(174 84% 38%) 0%, hsl(174 84% 28%) 50%, hsl(174 84% 20%) 100%)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className={cn(
            "w-full h-full",
            state === "listening" && "animate-[headTilt_0.5s_ease-out_forwards]",
            state === "speaking" && "animate-[headNod_1.5s_ease-in-out_infinite]",
            state === "thinking" && "animate-[headTiltRight_0.5s_ease-out_forwards]",
          )}
        >
          <defs>
            <linearGradient id="lgSkinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5D0A9" />
              <stop offset="100%" stopColor="#E8B88A" />
            </linearGradient>
            <linearGradient id="lgHairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B3B3B" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <linearGradient id="lgCoatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F0F0F0" />
            </linearGradient>
          </defs>

          {/* Body / White coat */}
          <rect x="43" y="50" width="14" height="10" rx="3" fill="url(#lgSkinGrad)" />
          <path d="M25 62 Q25 55 50 53 Q75 55 75 62 L78 95 Q50 100 22 95 Z" fill="url(#lgCoatGrad)" stroke="#E0E0E0" strokeWidth="0.5" />
          <path d="M42 55 L50 65 L58 55" stroke="#D0D0D0" strokeWidth="1.2" fill="none" />
          {/* Coat buttons */}
          <circle cx="50" cy="70" r="1.5" fill="#C0C0C0" />
          <circle cx="50" cy="78" r="1.5" fill="#C0C0C0" />
          <circle cx="50" cy="86" r="1.5" fill="#C0C0C0" />

          {/* Stethoscope */}
          <path d="M40 58 Q36 65 37 75 Q37 78 40 78" stroke="#2C6E7F" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="80" r="4" fill="#2C6E7F" />
          <circle cx="40" cy="80" r="1.8" fill="#1D5566" />

          {/* Head — breathing scale applied via parent */}
          <g className={state === "idle" ? "animate-[breathe_4s_ease-in-out_infinite]" : ""}>
            <ellipse cx="50" cy="35" rx="20" ry="22" fill="url(#lgSkinGrad)" />
          </g>

          {/* Hair */}
          <path d="M30 32 Q32 12 50 10 Q68 12 70 32 Q68 20 55 18 L50 20 L45 18 Q32 20 30 32Z" fill="url(#lgHairGrad)" />
          <path d="M30 32 Q28 38 30 42" stroke="#2A2A2A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M70 32 Q72 38 70 42" stroke="#2A2A2A" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Eyebrows */}
          <path d="M38 27 Q42 25 46 27" stroke="#3B3B3B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <path d="M54 27 Q58 25 62 27" stroke="#3B3B3B" strokeWidth="1.3" fill="none" strokeLinecap="round" />

          {/* Left eye */}
          <g>
            <ellipse cx="42" cy="33" rx="5" ry="3.5" fill="white" />
            <circle cx={state === "thinking" ? "40" : "42"} cy="33" r="2.5" fill="#4A3728">
              {state === "listening" && (
                <animate attributeName="r" values="2.5;3.2;2.5" dur="1.5s" repeatCount="indefinite" />
              )}
              {state === "thinking" && (
                <animate attributeName="cx" values="40;39;40" dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            <circle cx={state === "thinking" ? "40" : "42"} cy="33" r="1.2" fill="#1A1A1A" />
            <circle cx={state === "thinking" ? "41.5" : "43.5"} cy="32" r="0.7" fill="white" opacity="0.8" />
            {/* Blink on idle */}
            {state === "idle" && (
              <ellipse cx="42" cy="33" rx="5" ry="3.5" fill="url(#lgSkinGrad)">
                <animate attributeName="ry" values="0;0;0;0;0;0;0;0;3.5;0;0;0;0;0;0;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
              </ellipse>
            )}
          </g>

          {/* Right eye */}
          <g>
            <ellipse cx="58" cy="33" rx="5" ry="3.5" fill="white" />
            <circle cx={state === "thinking" ? "56" : "58"} cy="33" r="2.5" fill="#4A3728">
              {state === "listening" && (
                <animate attributeName="r" values="2.5;3.2;2.5" dur="1.5s" repeatCount="indefinite" />
              )}
              {state === "thinking" && (
                <animate attributeName="cx" values="56;55;56" dur="2s" repeatCount="indefinite" />
              )}
            </circle>
            <circle cx={state === "thinking" ? "56" : "58"} cy="33" r="1.2" fill="#1A1A1A" />
            <circle cx={state === "thinking" ? "57.5" : "59.5"} cy="32" r="0.7" fill="white" opacity="0.8" />
            {state === "idle" && (
              <ellipse cx="58" cy="33" rx="5" ry="3.5" fill="url(#lgSkinGrad)">
                <animate attributeName="ry" values="0;0;0;0;0;0;0;0;3.5;0;0;0;0;0;0;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
              </ellipse>
            )}
          </g>

          {/* Nose */}
          <path d="M48 37 Q50 40 52 37" stroke="#D4A574" strokeWidth="1" fill="none" strokeLinecap="round" />

          {/* Mouth */}
          {state === "speaking" ? (
            <g>
              <ellipse cx="50" cy="44" rx="6" ry="3.5" fill="#C0756B">
                <animate attributeName="ry" values="2;5;1;4;2" dur="0.5s" repeatCount="indefinite" />
                <animate attributeName="rx" values="6;5;6;5;6" dur="0.5s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx="50" cy="43" rx="4.5" ry="1.5" fill="white" opacity="0.5" />
              {/* Teeth hint */}
              <ellipse cx="50" cy="43.5" rx="3" ry="0.8" fill="white" opacity="0.7" />
            </g>
          ) : state === "listening" ? (
            <path d="M44 43 Q47 47 50 47 Q53 47 56 43" stroke="#C0756B" strokeWidth="1.8" fill="none" strokeLinecap="round" />
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
          <ellipse cx="28" cy="35" rx="3" ry="5" fill="url(#lgSkinGrad)" />
          <ellipse cx="72" cy="35" rx="3" ry="5" fill="url(#lgSkinGrad)" />
        </svg>

        {/* Status dot */}
        <span
          className={cn(
            "absolute bottom-3 right-3 rounded-full border-2 border-background w-5 h-5 transition-colors",
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
          50% { transform: translateY(-10px); }
        }
        @keyframes headNod {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(2px) rotate(1.5deg); }
          75% { transform: translateY(2px) rotate(-1.5deg); }
        }
        @keyframes headTilt {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-4deg); }
        }
        @keyframes headTiltRight {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(3deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.015); }
        }
        @keyframes largeWave {
          0%, 100% { height: 6px; opacity: 0.4; }
          50% { height: 22px; opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
