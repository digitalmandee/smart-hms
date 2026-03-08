import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

const CONDITION_COLORS: Record<string, string> = {
  healthy: "#22c55e",
  decayed: "#ef4444",
  missing: "#9ca3af",
  restored: "#3b82f6",
  crown: "#eab308",
  implant: "#a855f7",
  bridge: "#f97316",
  root_canal: "#ec4899",
  fractured: "#dc2626",
};

// Tooth positions for upper and lower jaw in an arch
function getToothPosition(toothNumber: number): [number, number, number] {
  const isUpper = toothNumber < 30;
  const y = isUpper ? 0.5 : -0.5;

  // Map tooth numbers to arch positions
  const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]; // Q1
  const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]; // Q2
  const LOWER_LEFT = [38, 37, 36, 35, 34, 33, 32, 31]; // Q3
  const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48]; // Q4

  let idx = UPPER_RIGHT.indexOf(toothNumber);
  if (idx >= 0) {
    const angle = (Math.PI * 0.55) + (idx / 7) * (Math.PI * 0.45);
    return [Math.cos(angle) * 3.2, y, Math.sin(angle) * 1.5 - 0.8];
  }
  idx = UPPER_LEFT.indexOf(toothNumber);
  if (idx >= 0) {
    const angle = (Math.PI * 0.0) + (idx / 7) * (Math.PI * 0.45);
    return [Math.cos(angle) * 3.2, y, Math.sin(angle) * 1.5 - 0.8];
  }
  idx = LOWER_LEFT.indexOf(toothNumber);
  if (idx >= 0) {
    const angle = (Math.PI * 0.0) + (idx / 7) * (Math.PI * 0.45);
    return [Math.cos(angle) * 3.2, y, -(Math.sin(angle) * 1.5 - 0.8)];
  }
  idx = LOWER_RIGHT.indexOf(toothNumber);
  if (idx >= 0) {
    const angle = (Math.PI * 0.55) + (idx / 7) * (Math.PI * 0.45);
    return [Math.cos(angle) * 3.2, y, -(Math.sin(angle) * 1.5 - 0.8)];
  }
  return [0, 0, 0];
}

function isMolar(n: number) {
  const m = n % 10;
  return m >= 6 && m <= 8;
}

function Tooth({ toothNumber, condition, selected, onClick }: {
  toothNumber: number;
  condition: string;
  selected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => getToothPosition(toothNumber), [toothNumber]);
  const color = CONDITION_COLORS[condition] || CONDITION_COLORS.healthy;
  const molar = isMolar(toothNumber);

  useFrame(() => {
    if (meshRef.current) {
      const scale = selected ? 1.2 : hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {molar ? (
          <boxGeometry args={[0.35, 0.45, 0.35]} />
        ) : (
          <cylinderGeometry args={[0.12, 0.15, 0.5, 8]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#ffffff" : hovered ? "#444444" : "#000000"}
          emissiveIntensity={selected ? 0.3 : hovered ? 0.15 : 0}
          transparent={condition === "missing"}
          opacity={condition === "missing" ? 0.25 : 1}
        />
      </mesh>
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {toothNumber.toString()}
      </Text>
    </group>
  );
}

function JawArch() {
  return (
    <group>
      {/* Upper jaw arch */}
      <mesh position={[0, 0.5, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.08, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#ffcccc" transparent opacity={0.3} />
      </mesh>
      {/* Lower jaw arch */}
      <mesh position={[0, -0.5, -0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.08, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#ffcccc" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

const ALL_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
];

interface Dental3DChartProps {
  toothMap: Record<number, { condition: string }>;
  selectedTooth: number | null;
  onSelectTooth: (tooth: number | null) => void;
}

export default function Dental3DChart({ toothMap, selectedTooth, onSelectTooth }: Dental3DChartProps) {
  return (
    <div className="h-[400px] w-full rounded-lg border bg-background/50">
      <Canvas camera={{ position: [0, 5, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <directionalLight position={[-5, 10, -5]} intensity={0.4} />
        <JawArch />
        {ALL_TEETH.map(n => (
          <Tooth
            key={n}
            toothNumber={n}
            condition={toothMap[n]?.condition || "healthy"}
            selected={selectedTooth === n}
            onClick={() => onSelectTooth(selectedTooth === n ? null : n)}
          />
        ))}
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
