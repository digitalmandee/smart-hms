import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import {
  Dentition,
  SurfaceKey,
  getQuadrants,
  getToothClass,
  isUpperTooth,
  conditionColor,
  normalizeCondition,
  ABSENT_CONDITIONS,
} from "@/lib/dental/constants";

export interface ToothState {
  condition: string;
  surfaces: Partial<Record<SurfaceKey, string>>;
}

interface Props {
  dentition: Dentition;
  toothStates: Record<number, ToothState>;
  selectedTooth: number | null;
  onSelectTooth: (tooth: number | null) => void;
  onPaintSurface?: (tooth: number, surface: SurfaceKey) => void;
  jawView?: "both" | "upper" | "lower";
}

const ENAMEL = "#efe9dc";
const GUM = "#d98a92";

// ── Arch placement ──────────────────────────────────────────────────────────
interface Placement {
  position: [number, number, number];
  rotationY: number;
  mesialSign: 1 | -1;
}

function archPlacement(quadrantKey: string, index: number, count: number): Placement {
  const t = count > 1 ? index / (count - 1) : 0;
  const upper = quadrantKey === "q1" || quadrantKey === "q2";
  const rightSide = quadrantKey === "q1" || quadrantKey === "q4";
  // right side sweeps 150° -> 90°, left side 90° -> 30°
  const deg = rightSide ? 152 - 62 * t : 90 - 62 * (quadrantKey === "q2" || quadrantKey === "q3" ? t : t);
  const ang = (deg * Math.PI) / 180;
  const a = 2.5;
  const b = 3.0;
  const y = upper ? 0.75 : -0.75;
  return {
    position: [Math.cos(ang) * a, y, Math.sin(ang) * b - 1.2],
    rotationY: Math.PI / 2 - ang,
    mesialSign: rightSide ? 1 : -1,
  };
}

// ── Tooth ───────────────────────────────────────────────────────────────────
interface ToothProps {
  toothNumber: number;
  state: ToothState;
  placement: Placement;
  selected: boolean;
  onSelect: () => void;
  onPaintSurface?: (surface: SurfaceKey) => void;
}

function Tooth({ toothNumber, state, placement, selected, onSelect, onPaintSurface }: ToothProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const upper = isUpperTooth(toothNumber);
  const cls = getToothClass(toothNumber);
  const cond = normalizeCondition(state?.condition);
  const absent = ABSENT_CONDITIONS.includes(cond);
  const dir = upper ? -1 : 1; // crown grows downward for upper teeth

  const dims = useMemo(() => {
    switch (cls) {
      case "incisor":
        return { w: 0.44, h: 0.62, d: 0.28, roots: 1, rootH: 0.85, cusps: 0 };
      case "canine":
        return { w: 0.42, h: 0.72, d: 0.36, roots: 1, rootH: 1.0, cusps: 1 };
      case "premolar":
        return { w: 0.5, h: 0.55, d: 0.52, roots: 1, rootH: 0.9, cusps: 2 };
      default:
        return { w: 0.68, h: 0.52, d: 0.62, roots: 2, rootH: 0.85, cusps: 4 };
    }
  }, [cls]);

  useFrame(() => {
    if (!groupRef.current) return;
    const s = selected ? 1.18 : hovered ? 1.08 : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
  });

  const bodyColor = cond === "healthy" ? ENAMEL : conditionColor(cond);
  const { w, h, d, rootH, roots, cusps } = dims;

  const surfaceMeta: { key: SurfaceKey; pos: [number, number, number]; size: [number, number, number] }[] = [
    { key: "B", pos: [0, (dir * h) / 2 - dir * h * 0.5 + dir * h * 0.5 - dir * 0, d / 2 + 0.012], size: [w * 0.92, h * 0.82, 0.02] },
    { key: "L", pos: [0, 0, -d / 2 - 0.012], size: [w * 0.92, h * 0.82, 0.02] },
    { key: "M", pos: [(placement.mesialSign * w) / 2 + placement.mesialSign * 0.012, 0, 0], size: [0.02, h * 0.82, d * 0.9] },
    { key: "D", pos: [(-placement.mesialSign * w) / 2 - placement.mesialSign * 0.012, 0, 0], size: [0.02, h * 0.82, d * 0.9] },
    { key: "O", pos: [0, (dir * h) / 2 + dir * 0.012, 0], size: [w * 0.9, 0.02, d * 0.9] },
  ];

  const handleSurface = (e: ThreeEvent<MouseEvent>, key: SurfaceKey) => {
    e.stopPropagation();
    if (onPaintSurface) onPaintSurface(key);
    else onSelect();
  };

  return (
    <group position={placement.position} rotation={[0, placement.rotationY, 0]}>
      {/* gum collar */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.max(w, d) * 0.55, 0.07, 6, 14]} />
        <meshStandardMaterial color={GUM} roughness={0.8} />
      </mesh>

      <group
        ref={groupRef}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        {/* crown */}
        <mesh position={[0, (dir * h) / 2, 0]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.35}
            metalness={cond === "filling_amalgam" || cond === "implant" ? 0.7 : 0.05}
            emissive={selected ? "#ffffff" : hovered ? "#666666" : "#000000"}
            emissiveIntensity={selected ? 0.22 : hovered ? 0.12 : 0}
            transparent={absent}
            opacity={absent ? 0.16 : 1}
          />
        </mesh>

        {/* cusps / incisal edge */}
        {!absent && cusps > 0 && Array.from({ length: cusps }).map((_, i) => {
          const cx = cusps === 1 ? 0 : ((i % 2) - 0.5) * w * 0.5;
          const cz = cusps <= 2 ? (cusps === 2 ? 0 : 0) : (Math.floor(i / 2) - 0.5) * d * 0.5;
          const cz2 = cusps === 2 ? ((i % 2) - 0.5) * d * 0.5 : cz;
          return (
            <mesh key={i} position={[cusps === 2 ? 0 : cx, dir * (h + 0.06), cusps === 2 ? cz2 : cz]}>
              <sphereGeometry args={[cls === "canine" ? 0.13 : 0.11, 10, 8]} />
              <meshStandardMaterial color={bodyColor} roughness={0.35} transparent={absent} opacity={absent ? 0.16 : 1} />
            </mesh>
          );
        })}

        {/* surfaces */}
        {!absent && surfaceMeta.map((s) => {
          const sc = normalizeCondition(state?.surfaces?.[s.key]);
          const painted = sc !== "healthy";
          return (
            <mesh
              key={s.key}
              position={[s.pos[0], s.key === "O" ? (dir * h) + dir * 0.012 : (dir * h) / 2, s.pos[2]]}
              onClick={(e) => handleSurface(e, s.key)}
            >
              <boxGeometry args={s.size} />
              <meshStandardMaterial
                color={painted ? conditionColor(sc) : ENAMEL}
                transparent={!painted}
                opacity={painted ? 1 : 0.25}
                roughness={0.4}
              />
            </mesh>
          );
        })}

        {/* roots */}
        {Array.from({ length: roots }).map((_, i) => (
          <mesh
            key={i}
            position={[roots === 1 ? 0 : (i - 0.5) * w * 0.5, -dir * (rootH / 2), 0]}
            rotation={[upper ? 0 : Math.PI, 0, 0]}
          >
            <coneGeometry args={[Math.min(w, d) * (roots === 1 ? 0.34 : 0.24), rootH, 8]} />
            <meshStandardMaterial
              color={cond === "root_canal" ? conditionColor("root_canal") : "#e3d6c2"}
              roughness={0.7}
              transparent={absent}
              opacity={absent ? 0.12 : 1}
            />
          </mesh>
        ))}

        {/* implant fixture */}
        {cond === "implant" && (
          <mesh position={[0, -dir * rootH * 0.5, 0]}>
            <cylinderGeometry args={[0.11, 0.09, rootH, 10]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.85} roughness={0.25} />
          </mesh>
        )}
      </group>

      <Text
        position={[0, dir * (h + 0.42), 0]}
        fontSize={0.17}
        color={selected ? "#0ea5e9" : "#475569"}
        anchorX="center"
        anchorY="middle"
        rotation={[0, 0, 0]}
      >
        {String(toothNumber)}
      </Text>
    </group>
  );
}

function Gums({ dentition, jawView }: { dentition: Dentition; jawView: "both" | "upper" | "lower" }) {
  const scale: [number, number, number] = [1, 1, 1.2];
  return (
    <group position={[0, 0, -1.2]} scale={scale}>
      {jawView !== "lower" && (
        <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.22, 10, 48, Math.PI]} />
          <meshStandardMaterial color={GUM} roughness={0.85} />
        </mesh>
      )}
      {jawView !== "upper" && (
        <mesh position={[0, -0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.6, 0.22, 10, 48, Math.PI]} />
          <meshStandardMaterial color={GUM} roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

export default function Dental3DChart({
  dentition,
  toothStates,
  selectedTooth,
  onSelectTooth,
  onPaintSurface,
  jawView = "both",
}: Props) {
  const teeth = useMemo(() => {
    const out: { n: number; placement: Placement }[] = [];
    getQuadrants(dentition).forEach((q) => {
      q.teeth.forEach((n, i) => {
        const upper = isUpperTooth(n);
        if (jawView === "upper" && !upper) return;
        if (jawView === "lower" && upper) return;
        out.push({ n, placement: archPlacement(q.key, i, q.teeth.length) });
      });
    });
    return out;
  }, [dentition, jawView]);

  return (
    <div className="h-[460px] w-full rounded-lg border bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <Canvas
        camera={{ position: [0, 6.5, 6.5], fov: 45 }}
        dpr={[1, 2]}
        onPointerMissed={() => onSelectTooth(null)}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 10, 6]} intensity={1.1} />
        <directionalLight position={[-6, 6, -4]} intensity={0.35} />
        <Environment>
          <Lightformer intensity={1.6} position={[0, 6, 2]} scale={[10, 10, 1]} />
          <Lightformer intensity={0.8} color="#bcd6e6" position={[-6, 2, -2]} rotation-y={Math.PI / 2} scale={[16, 2, 1]} />
        </Environment>

        <Gums dentition={dentition} jawView={jawView} />

        {teeth.map(({ n, placement }) => (
          <Tooth
            key={n}
            toothNumber={n}
            state={toothStates[n] || { condition: "healthy", surfaces: {} }}
            placement={placement}
            selected={selectedTooth === n}
            onSelect={() => onSelectTooth(selectedTooth === n ? null : n)}
            onPaintSurface={onPaintSurface ? (s) => onPaintSurface(n, s) : undefined}
          />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={14}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
