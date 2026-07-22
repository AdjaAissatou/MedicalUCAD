"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Sparkles,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "./scroll-state";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STRAND = 26; // paires de base
const RADIUS = 1.35;
const TURN = 0.42; // pas angulaire entre paires
const SPACING = 0.42; // pas vertical
const HEIGHT = STRAND * SPACING;

/** Double hélice d'ADN — le motif médical central. */
function Helix() {
  const group = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const arr: {
      a: [number, number, number];
      b: [number, number, number];
    }[] = [];
    for (let i = 0; i < STRAND; i++) {
      const angle = i * TURN;
      const y = i * SPACING - HEIGHT / 2;
      arr.push({
        a: [Math.cos(angle) * RADIUS, y, Math.sin(angle) * RADIUS],
        b: [
          Math.cos(angle + Math.PI) * RADIUS,
          y,
          Math.sin(angle + Math.PI) * RADIUS,
        ],
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    // easing doux du progrès de scroll
    scrollState.progress += (scrollState.target - scrollState.progress) * 0.06;
    const p = scrollState.progress;
    const t = REDUCED ? 0 : state.clock.elapsedTime;
    group.current.rotation.y = t * 0.18 + p * Math.PI * 1.6;
    // l'hélice s'incline et grandit légèrement au fil du scroll
    group.current.rotation.z = -0.12 + p * 0.25;
    const s = 1 + p * 0.18;
    group.current.scale.setScalar(s);
    group.current.position.y = p * 1.2;
  });

  const matA = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0891b2",
        roughness: 0.25,
        metalness: 0.6,
        emissive: new THREE.Color("#083344"),
        emissiveIntensity: 0.4,
      }),
    []
  );
  const matB = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#16a34a",
        roughness: 0.25,
        metalness: 0.6,
        emissive: new THREE.Color("#052e16"),
        emissiveIntensity: 0.4,
      }),
    []
  );
  const matRung = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#a5f3fc",
        roughness: 0.4,
        metalness: 0.3,
        emissive: new THREE.Color("#164e63"),
        emissiveIntensity: 0.25,
      }),
    []
  );
  const sphere = useMemo(() => new THREE.SphereGeometry(0.16, 24, 24), []);

  return (
    <group ref={group}>
      {nodes.map((n, i) => {
        // cylindre (barreau) reliant les deux brins
        const a = new THREE.Vector3(...n.a);
        const b = new THREE.Vector3(...n.b);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const dir = b.clone().sub(a);
        const len = dir.length();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        const euler = new THREE.Euler().setFromQuaternion(quat);
        return (
          <group key={i}>
            <mesh
              geometry={sphere}
              material={matA}
              position={n.a}
              castShadow
              receiveShadow
            />
            <mesh
              geometry={sphere}
              material={matB}
              position={n.b}
              castShadow
              receiveShadow
            />
            <mesh
              material={matRung}
              position={[mid.x, mid.y, mid.z]}
              rotation={[euler.x, euler.y, euler.z]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.04, len, 10]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Caméra : zoom piloté par le scroll + légère parallaxe souris. */
function Rig() {
  useFrame((state) => {
    const p = scrollState.progress;
    // zoom : on recule la caméra au fil du scroll (transition de scène)
    const targetZ = 5.4 + p * 4.5;
    const px = REDUCED ? 0 : state.pointer.x * 0.5;
    const py = REDUCED ? 0 : state.pointer.y * 0.35;
    state.camera.position.x += (px - state.camera.position.x) * 0.04;
    state.camera.position.y += (py + p * 0.6 - state.camera.position.y) * 0.04;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.06;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function DnaScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      frameloop={REDUCED ? "demand" : "always"}
    >
      <color attach="background" args={["#04211f"]} />
      <fog attach="fog" args={["#04211f", 6, 16]} />

      {/* Éclairage réaliste 3 points + rim */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.6}
        color="#e0fbff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, -1, -3]} intensity={45} color="#16a34a" />
      <pointLight position={[4, -4, 2]} intensity={25} color="#22d3ee" />

      {/* Reflets doux (env map procédurale — aucun asset externe) */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 4, -6]}
          scale={[10, 6, 1]}
          color="#67e8f9"
        />
        <Lightformer
          form="circle"
          intensity={1.6}
          position={[-6, -2, 2]}
          scale={6}
          color="#22c55e"
        />
      </Environment>

      <Helix />

      {/* Ombre de contact procédurale sous l'hélice (réalisme) */}
      <ContactShadows
        position={[0, -HEIGHT / 2 - 0.4, 0]}
        opacity={0.5}
        scale={12}
        blur={2.6}
        far={6}
        color="#00110d"
      />

      <Sparkles
        count={70}
        scale={[12, 10, 6]}
        size={2.2}
        speed={REDUCED ? 0 : 0.3}
        color="#7fffd4"
        opacity={0.5}
      />

      <Rig />
    </Canvas>
  );
}
