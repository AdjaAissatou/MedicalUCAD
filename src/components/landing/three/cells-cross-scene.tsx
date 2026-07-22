"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { crossState } from "./cross-state";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const COUNT = 2200;

/** Texture ronde et douce pour des « cellules » lumineuses (aucun asset). */
function makeDotTexture() {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

// Appartenance à la forme de croix (plus) médicale.
function insideCross(x: number, y: number) {
  return (
    (Math.abs(x) <= 0.62 && Math.abs(y) <= 1.9) ||
    (Math.abs(y) <= 0.62 && Math.abs(x) <= 1.9)
  );
}

// Génération (aléatoire) au niveau module — hors du rendu React (pureté).
function buildParticles() {
  const cell = new Float32Array(COUNT * 3);
  const cross = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const palette = [
    new THREE.Color("#22d3ee"),
    new THREE.Color("#16a34a"),
    new THREE.Color("#7fffd4"),
  ];
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // Nuage de « cellules » : réparti dans une sphère.
    const rr = 2.4 + Math.random() * 1.7;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    cell[i3] = rr * Math.sin(ph) * Math.cos(th);
    cell[i3 + 1] = rr * Math.sin(ph) * Math.sin(th);
    cell[i3 + 2] = rr * Math.cos(ph) * 0.6;
    // Cible : point dans la croix (échantillonnage par rejet).
    let x = 0;
    let y = 0;
    do {
      x = (Math.random() * 2 - 1) * 2;
      y = (Math.random() * 2 - 1) * 2.2;
    } while (!insideCross(x, y));
    cross[i3] = x;
    cross[i3 + 1] = y;
    cross[i3 + 2] = (Math.random() * 2 - 1) * 0.25;
    const col = palette[(Math.random() * palette.length) | 0];
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }
  const positions = (REDUCED ? cross : cell).slice();
  return { cell, cross, colors, positions, tex: makeDotTexture() };
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  // buildParticles est une fonction module (sans impureté textuelle dans le hook).
  const { cell, cross, colors, tex, positions } = useMemo(
    () => buildParticles(),
    []
  );

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const prog = Math.min(Math.max(crossState.progress, 0), 1);
    // easeInOutCubic
    const e =
      prog < 0.5 ? 4 * prog * prog * prog : 1 - Math.pow(-2 * prog + 2, 3) / 2;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT * 3; i++) {
      arr[i] = cell[i] + (cross[i] - cell[i]) * e;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    const t = REDUCED ? 0 : state.clock.elapsedTime;
    // la rotation s'estompe à mesure que la croix se forme
    pts.rotation.y = t * 0.12 * (1 - e);
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

export default function CellsCrossScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{ alpha: true, antialias: true }}
      frameloop={REDUCED ? "demand" : "always"}
    >
      <Particles />
    </Canvas>
  );
}
