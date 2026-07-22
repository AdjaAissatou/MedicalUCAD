"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, RoundedBox, Environment } from "@react-three/drei";
import type { Group } from "three";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Palette clinique : blanc + bleu médical (pas de vert).
const WALL = "#eef3fa";
const PILLAR = "#e7eef7";
const BLUE = "#2563eb";
const CYAN = "#38bdf8";
const INDIGO = "#1e3a8a";

const ROOMS: { z: number; side: 1 | -1; accent: string }[] = [
  { z: -7, side: 1, accent: BLUE },
  { z: -17, side: -1, accent: CYAN },
  { z: -27, side: 1, accent: BLUE },
  { z: -37, side: -1, accent: INDIGO },
  { z: -47, side: 1, accent: CYAN },
];

const CORRIDOR_LEN = 60;

function Room({ z, side, accent }: { z: number; side: 1 | -1; accent: string }) {
  const x = side * 5;
  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[side * 1.4, 1.8, 0]}
        rotation={[0, (-side * Math.PI) / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[7, 3.6]} />
        <meshStandardMaterial color={WALL} roughness={0.85} metalness={0} envMapIntensity={0.4} />
      </mesh>
      {/* Signalétique lumineuse */}
      <mesh position={[side * 1.35, 3.1, 0]} rotation={[0, (-side * Math.PI) / 2, 0]}>
        <planeGeometry args={[3.2, 0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      {/* Comptoir */}
      <RoundedBox args={[2.4, 0.9, 1]} radius={0.08} smoothness={3} position={[side * 0.4, 0.45, 0.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} envMapIntensity={0.9} />
      </RoundedBox>
      {/* Élément accent (armoire/écran) */}
      <RoundedBox args={[1, 1.3, 0.5]} radius={0.06} smoothness={3} position={[side * 1, 0.65, -1]} castShadow>
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.2} envMapIntensity={1} />
      </RoundedBox>
      {/* Écran lumineux */}
      <mesh position={[side * 0.4, 1.05, 0.6]} castShadow>
        <boxGeometry args={[0.55, 0.36, 0.05]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Corridor() {
  const halfLen = CORRIDOR_LEN / 2;
  const zCenter = -halfLen + 5;
  const marks = Array.from({ length: 7 }, (_, i) => -i * 9 - 1);

  return (
    <group>
      {/* Sol poli PBR : reflète l'environnement HDRI (brillant, sans passe miroir) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zCenter]} receiveShadow>
        <planeGeometry args={[9, CORRIDOR_LEN]} />
        <meshStandardMaterial color="#dbe4f0" roughness={0.22} metalness={0.65} envMapIntensity={1.3} />
      </mesh>
      {/* Ligne de guidage centrale */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, zCenter]}>
        <planeGeometry args={[0.45, CORRIDOR_LEN]} />
        <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* Plafond */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, zCenter]}>
        <planeGeometry args={[9, CORRIDOR_LEN]} />
        <meshStandardMaterial color={WALL} roughness={0.9} envMapIntensity={0.3} />
      </mesh>
      {/* Panneaux lumineux + sources */}
      {marks.map((z, i) => (
        <group key={i} position={[0, 3.95, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.4, 0.6]} />
            <meshStandardMaterial color="#ffffff" emissive="#eaf2ff" emissiveIntensity={3} toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.6, 0]} intensity={5} distance={13} decay={2} color="#eaf2ff" castShadow={i % 2 === 0} shadow-mapSize={[512, 512]} />
        </group>
      ))}
      {/* Piliers */}
      {marks.map((z, i) => (
        <group key={i}>
          <mesh position={[4.4, 2, z]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color={PILLAR} roughness={0.6} metalness={0.1} envMapIntensity={0.7} />
          </mesh>
          <mesh position={[-4.4, 2, z]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color={PILLAR} roughness={0.6} metalness={0.1} envMapIntensity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function CameraDolly() {
  const scroll = useScroll();
  const rig = useRef<Group>(null);
  useFrame((state) => {
    const o = scroll.offset;
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
      <color attach="background" args={["#cfdcec"]} />
      <fog attach="fog" args={["#cfdcec", 11, 36]} />
      {/* Éclairage image (HDRI local) — reflets & lumière réalistes */}
      <Environment files="/hdri/clinic_1k.hdr" environmentIntensity={0.55} />
      <ambientLight intensity={0.25} color="#eaf2ff" />
      <directionalLight position={[3, 8, 2]} intensity={0.5} color="#ffffff" />
      <Corridor />
      {ROOMS.map((r, i) => (
        <Room key={i} {...r} />
      ))}
      <CameraDolly />
    </>
  );
}
