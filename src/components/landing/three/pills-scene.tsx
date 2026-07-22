"use client";

import { Canvas } from "@react-three/fiber";
import {
  Float,
  Environment,
  Lightformer,
  ContactShadows,
} from "@react-three/drei";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Gélule bicolore : deux demi-capsules (cylindre + calotte) accolées. */
function Pill({
  colorA,
  colorB,
  position,
  rotation,
  scale = 1,
}: {
  colorA: string;
  colorB: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
}) {
  const r = 0.3;
  const half = 0.48;
  const mat = { roughness: 0.22, metalness: 0.1 };
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[-half / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, half, 28]} />
        <meshStandardMaterial color={colorA} {...mat} />
      </mesh>
      <mesh position={[-half, 0, 0]} castShadow>
        <sphereGeometry args={[r, 28, 28]} />
        <meshStandardMaterial color={colorA} {...mat} />
      </mesh>
      <mesh position={[half / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[r, r, half, 28]} />
        <meshStandardMaterial color={colorB} {...mat} />
      </mesh>
      <mesh position={[half, 0, 0]} castShadow>
        <sphereGeometry args={[r, 28, 28]} />
        <meshStandardMaterial color={colorB} {...mat} />
      </mesh>
    </group>
  );
}

function FloatingPill(props: React.ComponentProps<typeof Pill>) {
  return (
    <Float
      speed={REDUCED ? 0 : 1.4}
      rotationIntensity={REDUCED ? 0 : 1}
      floatIntensity={REDUCED ? 0 : 1.2}
    >
      <Pill {...props} />
    </Float>
  );
}

export default function PillsScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 6], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true }}
      frameloop={REDUCED ? "demand" : active ? "always" : "never"}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 4, -4]}
          scale={[9, 5, 1]}
          color="#ffffff"
        />
      </Environment>

      <FloatingPill position={[-1.5, 0.7, 0]} rotation={[0.3, 0.2, 0.5]} colorA="#0891b2" colorB="#ffffff" />
      <FloatingPill position={[1.4, -0.1, 0.4]} rotation={[0.1, -0.3, -0.5]} colorA="#16a34a" colorB="#ffffff" scale={0.9} />
      <FloatingPill position={[0.3, 1.5, -0.6]} rotation={[0.5, 0.4, 0.2]} colorA="#22d3ee" colorB="#0e7490" scale={0.72} />
      <FloatingPill position={[-0.5, -1.4, 0.3]} rotation={[-0.3, 0.2, 0.7]} colorA="#a5f3fc" colorB="#16a34a" scale={0.8} />

      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.35}
        scale={11}
        blur={2.6}
        far={5}
        color="#0e7490"
      />
    </Canvas>
  );
}
