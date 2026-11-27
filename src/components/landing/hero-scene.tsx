"use client";

import { useRef, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Icosahedron,
  MeshDistortMaterial,
  Sparkles,
  Torus,
} from "@react-three/drei";
import type { Group } from "three";

/** Respecte la préférence système « animations réduites » (accessibilité). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
}

function Scene({ reduced }: { reduced: boolean }) {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current && !reduced) {
      group.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <>
      {/* Éclairage studio : clé froide + rim doré + accent menthe */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} color="#eafff7" />
      <pointLight position={[-5, -2, 3]} intensity={2.4} color="#d5a84b" />
      <pointLight position={[3, -3, -4]} intensity={1.3} color="#22d3b4" />

      <group ref={group}>
        <Float
          speed={reduced ? 0 : 1.1}
          rotationIntensity={reduced ? 0 : 0.5}
          floatIntensity={reduced ? 0 : 0.9}
        >
          {/* Noyau émeraude vivant */}
          <Icosahedron args={[1.45, 64]}>
            <MeshDistortMaterial
              color="#0c6b60"
              roughness={0.18}
              metalness={0.45}
              distort={reduced ? 0 : 0.34}
              speed={reduced ? 0 : 1.6}
            />
          </Icosahedron>

          {/* Halo filaire doré */}
          <Icosahedron args={[1.74, 2]}>
            <meshBasicMaterial
              color="#d5a84b"
              wireframe
              transparent
              opacity={0.14}
            />
          </Icosahedron>

          {/* Anneau d'orbite doré */}
          <Torus args={[2.35, 0.014, 16, 128]} rotation={[1.2, 0.35, 0]}>
            <meshStandardMaterial
              color="#e0b85e"
              metalness={0.9}
              roughness={0.25}
              emissive="#5a4415"
              emissiveIntensity={0.35}
            />
          </Torus>
        </Float>

        {/* Particules menthe en suspension */}
        <Sparkles
          count={50}
          scale={[8, 6, 4]}
          size={2.4}
          speed={reduced ? 0 : 0.35}
          opacity={0.5}
          color="#e8f3ef"
        />
      </group>
    </>
  );
}

/**
 * Scène 3D premium de la page d'accueil.
 * - Montée côté client uniquement (WebGL) ; un fallback évite tout décalage
 *   d'hydratation et tout rendu WebGL côté serveur.
 * - `aria-hidden` : purement décoratif, invisible pour les lecteurs d'écran.
 */
export function HeroScene({ className = "" }: { className?: string }) {
  // Monté côté client uniquement (WebGL), sans effet ni setState.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const reduced = usePrefersReducedMotion();

  if (!mounted) {
    return <div className={className} aria-hidden />;
  }

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? "demand" : "always"}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
