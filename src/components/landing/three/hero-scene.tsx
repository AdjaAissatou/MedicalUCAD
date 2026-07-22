"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  MeshDistortMaterial,
  Icosahedron,
} from "@react-three/drei";
import type { Mesh } from "three";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Blob organique distordu — la « cellule » médicale au cœur du hero. */
function Blob() {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (REDUCED || !mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.14;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.12;
  });
  return (
    <Float
      speed={REDUCED ? 0 : 1.3}
      rotationIntensity={REDUCED ? 0 : 0.5}
      floatIntensity={REDUCED ? 0 : 0.7}
    >
      <Icosahedron ref={mesh} args={[1.5, 16]}>
        <MeshDistortMaterial
          color="#0e7490"
          emissive="#0b3b45"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.4}
          distort={REDUCED ? 0 : 0.4}
          speed={REDUCED ? 0 : 1.5}
        />
      </Icosahedron>
    </Float>
  );
}

/** Parallaxe douce : la caméra suit légèrement le curseur. */
function Rig() {
  useFrame((state) => {
    if (REDUCED) return;
    const x = state.pointer.x * 0.6;
    const y = state.pointer.y * 0.4;
    state.camera.position.x += (x - state.camera.position.x) * 0.04;
    state.camera.position.y += (y - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      frameloop={REDUCED ? "demand" : "always"}
    >
      <fog attach="fog" args={["#062e2c", 5, 13]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#67e8f9" />
      <pointLight position={[-4, -2, -2]} intensity={40} color="#16a34a" />
      <pointLight position={[3, -3, 2]} intensity={20} color="#22d3ee" />
      <Blob />
      <Sparkles
        count={90}
        scale={9}
        size={2.4}
        speed={REDUCED ? 0 : 0.35}
        color="#7fffd4"
        opacity={0.55}
      />
      <Rig />
    </Canvas>
  );
}
