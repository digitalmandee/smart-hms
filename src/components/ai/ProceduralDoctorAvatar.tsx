import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

interface ProceduralDoctorAvatarProps {
  state?: AvatarState;
  className?: string;
}

// ─── Inner 3D scene ───────────────────────────────────────────────────────────
function DoctorScene({ state }: { state: AvatarState }) {
  const clockRef = useRef(new THREE.Clock());

  // Refs for animated parts
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeGroupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Amplitude simulation
  const ampRef = useRef({ current: 0, target: 0, timeSince: 0 });

  // Blink state
  const blinkRef = useRef({
    nextBlink: 3 + Math.random() * 2,
    blinking: false,
    blinkTimer: 0,
    blinkVal: 1,
  });

  useFrame((_, delta) => {
    const t = clockRef.current.getElapsedTime();
    const amp = ampRef.current;
    const blink = blinkRef.current;

    // ── Lip sync amplitude ──────────────────────────────────────────────────
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

    if (mouthRef.current) {
      mouthRef.current.scale.y = 1 + amp.current * 3.5;
    }

    // ── Eye blink ──────────────────────────────────────────────────────────
    blink.blinkTimer += delta;
    if (!blink.blinking && blink.blinkTimer >= blink.nextBlink) {
      blink.blinking = true;
      blink.blinkTimer = 0;
      blink.nextBlink = 3 + Math.random() * 2;
    }
    if (blink.blinking) {
      const progress = blink.blinkTimer / 0.12;
      blink.blinkVal = progress < 0.5 ? 1 - progress * 2 : (progress - 0.5) * 2;
      blink.blinkVal = Math.max(0.05, Math.min(1, blink.blinkVal));
      if (blink.blinkTimer >= 0.12) {
        blink.blinking = false;
        blink.blinkVal = 1;
      }
    }
    if (eyeGroupRef.current) {
      eyeGroupRef.current.scale.y = blink.blinkVal;
    }

    // ── Head animations ────────────────────────────────────────────────────
    if (headRef.current) {
      if (state === "speaking") {
        headRef.current.rotation.x = Math.sin(t * 2.4) * 0.08;
        headRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;
      } else if (state === "thinking") {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.06, delta * 3);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, -0.08, delta * 3);
      } else if (state === "listening") {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.04, delta * 3);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0.06, delta * 3);
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, Math.sin(t * 0.5) * 0.02, delta * 3);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, Math.sin(t * 0.3) * 0.015, delta * 3);
      }
    }

    // ── Torso breathing ────────────────────────────────────────────────────
    if (torsoRef.current) {
      torsoRef.current.scale.y = 1 + Math.sin(t * 0.8) * 0.008;
    }

    // ── Root idle sway ─────────────────────────────────────────────────────
    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
    }

    // ── Arm sway ───────────────────────────────────────────────────────────
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = state === "speaking"
        ? 0.4 + Math.sin(t * 1.5) * 0.1
        : 0.35 + Math.sin(t * 0.5) * 0.02;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = state === "speaking"
        ? -(0.4 + Math.sin(t * 1.5 + 1.2) * 0.1)
        : -(0.35 + Math.sin(t * 0.5) * 0.02);
    }
  });

  const skinColor = "#e8b89a";
  const hairColor = "#2c1810";
  const coatColor = "#f8f8f8";
  const shirtColor = "#d0e8f5";
  const stethColor = "#9ca3af";
  const eyeWhite = "#ffffff";
  const irisDark = "#1a0a00";
  const mouthColor = "#c0706a";
  const lipColor = "#b85c58";

  return (
    <group ref={rootRef} position={[0, -0.55, 0]}>

      {/* ── Torso / White Coat ──────────────────────────────────────────── */}
      <mesh ref={torsoRef} position={[0, 0.62, 0]}>
        <boxGeometry args={[0.44, 0.52, 0.22]} />
        <meshStandardMaterial color={coatColor} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Shirt / tie area */}
      <mesh position={[0, 0.64, 0.112]}>
        <boxGeometry args={[0.12, 0.38, 0.01]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* Coat lapel left */}
      <mesh position={[-0.1, 0.78, 0.108]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.09, 0.18, 0.01]} />
        <meshStandardMaterial color={coatColor} roughness={0.5} />
      </mesh>

      {/* Coat lapel right */}
      <mesh position={[0.1, 0.78, 0.108]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.09, 0.18, 0.01]} />
        <meshStandardMaterial color={coatColor} roughness={0.5} />
      </mesh>

      {/* Coat pocket left */}
      <mesh position={[-0.17, 0.6, 0.112]}>
        <boxGeometry args={[0.08, 0.06, 0.01]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.6} />
      </mesh>

      {/* ── Stethoscope ─────────────────────────────────────────────────── */}
      {/* Chest piece */}
      <mesh position={[0.08, 0.68, 0.12]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.022, 0.022, 0.015, 16]} />
        <meshStandardMaterial color={stethColor} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Tube arc */}
      <mesh position={[0.04, 0.76, 0.11]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.06, 0.008, 8, 24, Math.PI * 0.9]} />
        <meshStandardMaterial color={stethColor} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* ── Neck ────────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.905, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.1, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* ── Head group ──────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 1.07, 0]}>

        {/* Head sphere */}
        <mesh>
          <sphereGeometry args={[0.175, 32, 32]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} metalness={0.02} />
        </mesh>

        {/* Hair — top cap */}
        <mesh position={[0, 0.06, -0.01]}>
          <sphereGeometry args={[0.182, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>

        {/* Forehead hairline fill */}
        <mesh position={[0, 0.155, 0.06]}>
          <boxGeometry args={[0.28, 0.04, 0.05]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>

        {/* ── Eyes group (scaled for blink) ───────────────────────────── */}
        <group ref={eyeGroupRef}>
          {/* Left eye white */}
          <mesh position={[-0.068, 0.035, 0.155]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.1} />
          </mesh>
          {/* Left iris */}
          <mesh position={[-0.068, 0.035, 0.178]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color={irisDark} roughness={0.2} />
          </mesh>
          {/* Left pupil */}
          <mesh position={[-0.068, 0.035, 0.188]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color="#000000" roughness={0.1} />
          </mesh>

          {/* Right eye white */}
          <mesh position={[0.068, 0.035, 0.155]}>
            <sphereGeometry args={[0.028, 16, 16]} />
            <meshStandardMaterial color={eyeWhite} roughness={0.1} />
          </mesh>
          {/* Right iris */}
          <mesh position={[0.068, 0.035, 0.178]}>
            <sphereGeometry args={[0.018, 16, 16]} />
            <meshStandardMaterial color={irisDark} roughness={0.2} />
          </mesh>
          {/* Right pupil */}
          <mesh position={[0.068, 0.035, 0.188]}>
            <sphereGeometry args={[0.009, 8, 8]} />
            <meshStandardMaterial color="#000000" roughness={0.1} />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh position={[-0.068, 0.075, 0.16]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.046, 0.008, 0.004]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>
        <mesh position={[0.068, 0.075, 0.16]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.046, 0.008, 0.004]} />
          <meshStandardMaterial color={hairColor} roughness={0.9} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.01, 0.172]}>
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial color="#d4956e" roughness={0.9} />
        </mesh>

        {/* Mouth area skin */}
        <mesh position={[0, -0.065, 0.165]}>
          <boxGeometry args={[0.07, 0.025, 0.002]} />
          <meshStandardMaterial color={lipColor} roughness={0.5} />
        </mesh>

        {/* Mouth opening (animated) */}
        <mesh ref={mouthRef} position={[0, -0.065, 0.167]}>
          <boxGeometry args={[0.055, 0.012, 0.002]} />
          <meshStandardMaterial color={mouthColor} roughness={0.6} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.178, 0.01, 0]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.178, 0.01, 0]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
      </group>

      {/* ── Left Arm ────────────────────────────────────────────────────── */}
      <group ref={leftArmRef} position={[-0.265, 0.82, 0]}>
        {/* Upper arm */}
        <mesh position={[-0.04, -0.1, 0]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
          <meshStandardMaterial color={coatColor} roughness={0.6} />
        </mesh>
        {/* Forearm */}
        <mesh position={[-0.06, -0.32, 0]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.045, 0.18, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.075, -0.47, 0]}>
          <sphereGeometry args={[0.044, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} />
        </mesh>
      </group>

      {/* ── Right Arm ───────────────────────────────────────────────────── */}
      <group ref={rightArmRef} position={[0.265, 0.82, 0]}>
        {/* Upper arm */}
        <mesh position={[0.04, -0.1, 0]} rotation={[0, 0, -0.15]}>
          <capsuleGeometry args={[0.055, 0.2, 8, 16]} />
          <meshStandardMaterial color={coatColor} roughness={0.6} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.06, -0.32, 0]} rotation={[0, 0, -0.1]}>
          <capsuleGeometry args={[0.045, 0.18, 8, 16]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0.075, -0.47, 0]}>
          <sphereGeometry args={[0.044, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.75} />
        </mesh>
      </group>

    </group>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function ProceduralDoctorAvatar({ state = "idle", className }: ProceduralDoctorAvatarProps) {
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
          background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
        }}
      >
        <Canvas
          className="w-full h-full"
          gl={{ antialias: true, alpha: true }}
          camera={{ fov: 32, position: [0, 0.7, 1.6] }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[1, 2, 2]} intensity={1.4} castShadow />
          <directionalLight position={[-1, 1, 1]} intensity={0.5} />
          <directionalLight position={[0, -1, 1]} intensity={0.2} />

          <DoctorScene state={state} />
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
