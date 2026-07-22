"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, RoundedBox } from "@react-three/drei";
import type { Group } from "three";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Palette clinique : blanc + bleu médical (pas de vert).
const WALL = "#f4f8fc";
const FLOOR = "#e6edf5";
const PILLAR = "#eef3f9";
const BLUE = "#2563eb";
const CYAN = "#38bdf8";
const INDIGO = "#1e3a8a";

const ROOMS: {
  z: number;
  side: 1 | -1;
  accent: string;
}[] = [
  { z: -7, side: 1, accent: BLUE },
  { z: -17, side: -1, accent: CYAN },
  { z: -27, side: 1, accent: BLUE },
  { z: -37, side: -1, accent: INDIGO },
  { z: -47, side: 1, accent: CYAN },
];

const CORRIDOR_LEN = 60;

/** Zone de soin ouverte sur le couloir : mur de fond accentué + mobilier. */
function Room({
  z,
  side,
  accent,
}: {
  z: number;
  side: 1 | -1;
  accent: string;
}) {
  const x = side * 5;
  return (
    <group position={[x, 0, z]}>
      {/* Mur de fond */}
      <mesh position={[side * 1.4, 1.8, 0]} rotation={[0, -side * Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[7, 3.6]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      {/* Bandeau de signalétique lumineux */}
      <mesh position={[side * 1.35, 3.1, 0]} rotation={[0, -side * Math.PI / 2, 0]}>
        <planeGeometry args={[3.2, 0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* Mobilier stylisé (comptoir + éléments) */}
      <RoundedBox args={[2.4, 0.9, 1]} radius={0.08} smoothness={3} position={[side * 0.4, 0.45, 0.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[1, 1.3, 0.5]} radius={0.06} smoothness={3} position={[side * 1, 0.65, -1]} castShadow>
        <meshStandardMaterial color={accent} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <mesh position={[side * 0.4, 1.05, 0.6]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.05]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Structure fixe du couloir : sol, plafond lumineux, murs, piliers. */
function Corridor() {
  const halfLen = CORRIDOR_LEN / 2;
  const zCenter = -halfLen + 5;
  const lights = [];
  for (let i = 0; i < 7; i++) lights.push(-i * 9 - 1);
  const pillars = [];
  for (let i = 0; i < 7; i++) pillars.push(-i * 9 - 1);

  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zCenter]} receiveShadow>
        <planeGeometry args={[9, CORRIDOR_LEN]} />
        <meshStandardMaterial color={FLOOR} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Bande centrale au sol (repère de circulation) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, zCenter]}>
        <planeGeometry args={[0.5, CORRIDOR_LEN]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
      {/* Plafond */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, zCenter]}>
        <planeGeometry args={[9, CORRIDOR_LEN]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      {/* Panneaux lumineux au plafond + sources */}
      {lights.map((z, i) => (
        <group key={i} position={[0, 3.95, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.6]} />
            <meshStandardMaterial color="#eaf2ff" emissive="#dbeafe" emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.5, 0]} intensity={7} distance={12} decay={2} color="#eaf2ff" castShadow={i % 2 === 0} />
        </group>
      ))}
      {/* Piliers de chaque côté */}
      {pillars.map((z, i) => (
        <group key={i}>
          <mesh position={[4.4, 2, z]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color={PILLAR} />
          </mesh>
          <mesh position={[-4.4, 2, z]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color={PILLAR} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Déplace la caméra le long du couloir selon le défilement (drei useScroll). */
function CameraDolly() {
  const scroll = useScroll();
  const rig = useRef<Group>(null);
  useFrame((state) => {
    const o = scroll.offset; // 0 → 1
    const z = 3 - o * (CORRIDOR_LEN - 6);
    const sway = REDUCED ? 0 : Math.sin(o * Math.PI * 3) * 0.6;
    state.camera.position.set(sway, 1.55, z);
    state.camera.lookAt(sway * 0.4, 1.45, z - 6);
  });
  return <group ref={rig} />;
}

export function HospitalScene() {
  return (
    <>
      <color attach="background" args={["#dce8f4"]} />
      <fog attach="fog" args={["#dce8f4", 10, 34]} />
      <ambientLight intensity={0.75} color="#eaf2ff" />
      <directionalLight position={[3, 8, 2]} intensity={0.7} color="#ffffff" />
      <Corridor />
      {ROOMS.map((r, i) => (
        <Room key={i} {...r} />
      ))}
      <CameraDolly />
    </>
  );
}
