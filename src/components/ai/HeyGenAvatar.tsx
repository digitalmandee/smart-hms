import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { DoctorAvatarLarge } from "./DoctorAvatarLarge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const AVATAR_ID = "c3f695d081884624bb5fbd00751e30e3";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export interface HeyGenAvatarHandle {
  speak: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
}

interface HeyGenAvatarProps {
  state?: AvatarState;
  onStartTalking?: () => void;
  onStopTalking?: () => void;
  className?: string;
}

export const HeyGenAvatar = forwardRef<HeyGenAvatarHandle, HeyGenAvatarProps>(
  ({ state = "idle", onStartTalking, onStopTalking, className }, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<"connecting" | "ready" | "error">("connecting");
  const [statusState, setStatusState] = useState<"connecting" | "ready" | "error">("connecting");
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Callback ref: assigns stream immediately when <video> mounts in DOM
  const videoCallbackRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && pendingStreamRef.current) {
      el.srcObject = pendingStreamRef.current;
      el.play().catch(() => {});
    }
  };

  useImperativeHandle(ref, () => ({
    async speak(text: string) {
      if (!avatarRef.current || statusRef.current !== "ready") return;
      try {
        await avatarRef.current.speak({
          text,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      } catch (e) {
        console.error("HeyGen speak error:", e);
      }
    },
    async interrupt() {
      if (!avatarRef.current || statusRef.current !== "ready") return;
      try {
        await avatarRef.current.interrupt();
      } catch (e) {
        console.error("HeyGen interrupt error:", e);
      }
    },
  }));

    useEffect(() => {
      let cancelled = false;

      async function initAvatar() {
        try {
          // 1. Get the current session token for auth
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;

          // 2. Get a short-lived token from our edge function (authenticated)
          const res = await fetch(`${SUPABASE_URL}/functions/v1/heygen-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          });
          const { token, error: tokenError } = await res.json();
          if (tokenError || !token) throw new Error(tokenError ?? "No token");

          if (cancelled) return;

          // 2. Create avatar SDK instance
          const avatar = new StreamingAvatar({ token });
          avatarRef.current = avatar;

          // 3. Wire up events
          avatar.on(StreamingEvents.STREAM_READY, (event) => {
            if (cancelled) return;
            const stream = (event as any).detail as MediaStream;
            pendingStreamRef.current = stream;
            statusRef.current = "ready";
            setStatusState("ready");
          });

          avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
            if (!cancelled) { statusRef.current = "error"; setStatusState("error"); }
          });

          avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
            onStartTalking?.();
          });

          avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
            onStopTalking?.();
          });

          // 4. Start session — low quality = fastest stream
          await avatar.createStartAvatar({
            avatarName: AVATAR_ID,
            quality: AvatarQuality.Low,
          });

          if (cancelled) {
            avatar.stopAvatar();
            return;
          }

          // 5. Keep-alive ping every 25 seconds
          keepAliveRef.current = setInterval(async () => {
            try {
              await (avatar as any).keepAlive?.();
            } catch {
              // Silently ignore keep-alive errors
            }
          }, 25_000);
        } catch (err: any) {
          console.error("HeyGen init error:", err);
          if (!cancelled) {
            statusRef.current = "error";
            setStatusState("error");
            setErrorMsg(err?.message ?? "Connection failed");
          }
        }
      }

      initAvatar();

      return () => {
        cancelled = true;
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
        avatarRef.current?.stopAvatar().catch(() => {});
        avatarRef.current = null;
      };
    }, []);

    // Border glow matching DoctorAvatarLarge
    const borderGlow =
      state === "speaking"
        ? "0 0 0 4px hsl(var(--primary)), 0 0 60px 20px hsl(var(--primary)/0.5), 0 0 100px 40px hsl(var(--primary)/0.2)"
        : state === "listening"
        ? "0 0 0 2px hsl(var(--primary)/0.5), 0 0 20px 4px hsl(var(--primary)/0.2)"
        : state === "thinking"
        ? "0 0 0 2px hsl(40 80% 55%/0.4), 0 0 16px 4px hsl(40 80% 55%/0.1)"
        : "0 0 0 1px hsl(var(--border))";

    // Show fallback skeleton while connecting
    if (statusState === "connecting") {
      return <DoctorAvatarLarge state="thinking" className={className} />;
    }

    // Show fallback on error
    if (statusState === "error") {
      return <DoctorAvatarLarge state={state} className={className} />;
    }

    return (
      <div className={cn("relative flex flex-col items-center", className)}>
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl transition-[box-shadow,transform] duration-500",
            state === "speaking" && "scale-[1.03]"
          )}
          style={{
            width: "min(300px, 86vw)",
            height: "min(420px, 54vh)",
            boxShadow: borderGlow,
          }}
        >
          <video
            ref={videoCallbackRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
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
      </div>
    );
  }
);

HeyGenAvatar.displayName = "HeyGenAvatar";
