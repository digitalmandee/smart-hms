import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ProceduralDoctorAvatar } from "./ProceduralDoctorAvatar";
import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface VRMAvatarCanvasProps {
  state?: AvatarState;
  className?: string;
}

const LOCAL_VRM_PATH = "/avatars/doctor.vrm";

// ─── Inner scene rendered inside <Canvas> ────────────────────────────────────
interface VRMSceneProps {
  url: string;
  state: AvatarState;
  onLoaded: () => void;
  onError: () => void;
}

function VRMScene({ url, state, onLoaded, onError }: VRMSceneProps) {
  const vrmRef = useRef<VRM | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const { scene, camera } = useThree();

  // Amplitude simulation state (mutable refs to avoid re-renders)
  const ampRef = useRef({
    current: 0,
    target: 0,
    timeSince: 0,
  });

  // Blink state
  const blinkRef = useRef({
    nextBlink: 3 + Math.random() * 2,
    blinking: false,
    blinkTimer: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      url,
      (gltf) => {
        if (cancelled) return;
        const vrm: VRM = gltf.userData.vrm;
        if (!vrm) { onError(); return; }

        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.combineSkeletons(gltf.scene);

        // Rotate VRM to face camera (VRM spec is -Z forward)
        vrm.scene.rotation.y = Math.PI;
        scene.add(vrm.scene);
        vrmRef.current = vrm;
        onLoaded();
      },
      undefined,
      () => { if (!cancelled) onError(); }
    );

    // Frame bust-level camera
    camera.position.set(0, 1.15, 1.8);
    (camera as THREE.PerspectiveCamera).fov = 28;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    return () => {
      cancelled = true;
      if (vrmRef.current) {
        scene.remove(vrmRef.current.scene);
        VRMUtils.deepDispose(vrmRef.current.scene);
        vrmRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useFrame((_, delta) => {
    const vrm = vrmRef.current;
    if (!vrm) return;

    const t = clockRef.current.getElapsedTime();
    const amp = ampRef.current;
    const blink = blinkRef.current;

    // ── Amplitude / lip sync simulation ──────────────────────────────────────
    if (state === "speaking") {
      amp.timeSince += delta;
      if (amp.timeSince > 0.08) {
        amp.target = Math.random() * 0.9 + 0.1;
        amp.timeSince = 0;
      }
    } else {
      amp.target = 0;
    }
    amp.current = THREE.MathUtils.lerp(amp.current, amp.target, delta * 12);

    // Try both VRM 0.x and VRM 1.0 / RPM expression names
    const expressionManager = vrm.expressionManager;
    if (expressionManager) {
      const mouthVal = amp.current * 0.85;
      if (expressionManager.getValue("aa") !== undefined) {
        expressionManager.setValue("aa", mouthVal);
      } else if (expressionManager.getValue("viseme_aa") !== undefined) {
        expressionManager.setValue("viseme_aa", mouthVal);
      }

      // ── Eye blink ─────────────────────────────────────────────────────────
      blink.blinkTimer += delta;
      if (!blink.blinking && blink.blinkTimer >= blink.nextBlink) {
        blink.blinking = true;
        blink.blinkTimer = 0;
        blink.nextBlink = 3 + Math.random() * 2;
      }
      if (blink.blinking) {
        const blinkProgress = blink.blinkTimer / 0.12; // 120ms blink
        const blinkVal = blinkProgress < 0.5
          ? blinkProgress * 2
          : 2 - blinkProgress * 2;
        const clampedBlink = Math.max(0, Math.min(1, blinkVal));
        if (expressionManager.getValue("blink") !== undefined) {
          expressionManager.setValue("blink", clampedBlink);
        } else {
          if (expressionManager.getValue("blinkLeft") !== undefined)
            expressionManager.setValue("blinkLeft", clampedBlink);
          if (expressionManager.getValue("blinkRight") !== undefined)
            expressionManager.setValue("blinkRight", clampedBlink);
        }
        if (blink.blinkTimer >= 0.12) blink.blinking = false;
      }
    }

    // ── Head / body procedural animations ────────────────────────────────────
    const humanoid = vrm.humanoid;
    if (humanoid) {
      const head = humanoid.getNormalizedBoneNode("head");
      const neck = humanoid.getNormalizedBoneNode("neck");
      const spine = humanoid.getNormalizedBoneNode("spine");
      const leftArm = humanoid.getNormalizedBoneNode("leftUpperArm");
      const rightArm = humanoid.getNormalizedBoneNode("rightUpperArm");

      if (state === "speaking") {
        // Head nod
        if (head) head.rotation.x = Math.sin(t * 2.4) * 0.06;
        if (neck) neck.rotation.x = Math.sin(t * 1.8) * 0.04;
        // Subtle arm gesture sway
        if (leftArm) leftArm.rotation.z = 0.35 + Math.sin(t * 1.5) * 0.08;
        if (rightArm) rightArm.rotation.z = -(0.35 + Math.sin(t * 1.5 + 1.2) * 0.08);
      } else if (state === "listening") {
        // Slight head tilt
        if (head) head.rotation.z = 0.06;
        if (head) head.rotation.x = 0;
        if (neck) neck.rotation.x = 0;
        if (leftArm) leftArm.rotation.z = 0.32;
        if (rightArm) rightArm.rotation.z = -0.32;
      } else if (state === "thinking") {
        // Head slightly tilted to the side
        if (head) head.rotation.z = -0.08;
        if (head) head.rotation.x = -0.04;
        if (neck) neck.rotation.x = 0;
        if (leftArm) leftArm.rotation.z = 0.32;
        if (rightArm) rightArm.rotation.z = -0.32;
      } else {
        // Idle sway
        if (head) {
          head.rotation.x = 0;
          head.rotation.z = Math.sin(t * 0.5) * 0.02;
        }
        if (neck) neck.rotation.x = 0;
        if (spine) spine.rotation.z = Math.sin(t * 0.5) * 0.01;
        if (leftArm) leftArm.rotation.z = 0.32 + Math.sin(t * 0.5) * 0.02;
        if (rightArm) rightArm.rotation.z = -(0.32 + Math.sin(t * 0.5) * 0.02);
      }
    }

    vrm.update(delta);
  });

  return null;
}

// ─── Public component ─────────────────────────────────────────────────────────
export function VRMAvatarCanvas({ state = "idle", className }: VRMAvatarCanvasProps) {
  const [vrmStatus, setVrmStatus] = useState<"loading" | "ready" | "error">("loading");
  const [vrmUrl, setVrmUrl] = useState<string | null>(null);

  // Try local VRM file; if not found, stay null → show ProceduralDoctorAvatar
  useEffect(() => {
    fetch(LOCAL_VRM_PATH, { method: "HEAD" })
      .then((r) => { if (r.ok) setVrmUrl(LOCAL_VRM_PATH); })
      .catch(() => {});
  }, []);

  // No local VRM → show procedural 3D avatar
  if (!vrmUrl) {
    return <ProceduralDoctorAvatar state={state} className={className} />;
  }

  const borderGlow =
    state === "speaking"
      ? "0 0 0 4px hsl(var(--primary)), 0 0 60px 20px hsl(var(--primary)/0.5), 0 0 100px 40px hsl(var(--primary)/0.2)"
      : state === "listening"
      ? "0 0 0 2px hsl(var(--primary)/0.5), 0 0 20px 4px hsl(var(--primary)/0.2)"
      : state === "thinking"
      ? "0 0 0 2px hsl(40 80% 55%/0.4), 0 0 16px 4px hsl(40 80% 55%/0.1)"
      : "0 0 0 1px hsl(var(--border))";

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
          background: "hsl(var(--card))",
        }}
      >
        {/* Show ProceduralDoctorAvatar inline while VRM loads */}
        {vrmStatus === "loading" && (
          <div className="absolute inset-0 z-10">
            <ProceduralDoctorAvatar state="thinking" className="w-full h-full" />
          </div>
        )}

        <Canvas
          className="w-full h-full"
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 28, position: [0, 1.15, 1.8] }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[1, 2, 2]} intensity={1.2} />
          <directionalLight position={[-1, 0, 1]} intensity={0.4} />

          <Suspense fallback={null}>
            {vrmUrl && (
              <VRMScene
                url={vrmUrl}
                state={state}
                onLoaded={() => setVrmStatus("ready")}
                onError={() => setVrmStatus("error")}
              />
            )}
          </Suspense>
        </Canvas>

        {/* State tint overlay */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-500 pointer-events-none",
            state === "listening" && "bg-primary/[0.08]",
            state === "thinking" && "bg-amber-500/10",
            state === "speaking" && "bg-primary/[0.05]",
          )}
        />

        {/* Bottom gradient */}
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
            "absolute top-3 right-3 rounded-full border-2 border-background w-3.5 h-3.5 transition-colors z-20",
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
