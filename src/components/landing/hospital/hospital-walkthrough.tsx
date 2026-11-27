"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { HospitalScene } from "./hospital-scene";
import { ArrowRight, LogIn } from "lucide-react";

// Post-traitement (bloom, vignette) : GPU-lourd. Désactivé par défaut pour
// garantir un rendu sur tout matériel ; activable via NEXT_PUBLIC_HOSPITAL_FX=1
// (à tester sur une vraie carte graphique).
const FX = process.env.NEXT_PUBLIC_HOSPITAL_FX === "1";

type Salle = {
  top: string;
  eyebrow: string;
  titre: string;
  desc: string;
  align: "left" | "center" | "right";
};

const SALLES: Salle[] = [
  {
    top: "10vh",
    eyebrow: "Bienvenue",
    titre: "Entrez dans UCAD Medical",
    desc: "Visitez la plateforme comme si vous parcouriez l'hôpital. Faites défiler pour avancer.",
    align: "center",
  },
  {
    top: "120vh",
    eyebrow: "Accueil",
    titre: "Une prise en charge dès l'entrée",
    desc: "Rendez-vous, orientation, dossier : tout commence ici, sans file d'attente.",
    align: "right",
  },
  {
    top: "230vh",
    eyebrow: "Consultation",
    titre: "Le soin, au cœur du parcours",
    desc: "Constantes, diagnostics et historique réunis pour chaque patient.",
    align: "left",
  },
  {
    top: "340vh",
    eyebrow: "Pharmacie",
    titre: "Des traitements sous contrôle",
    desc: "Stock, alertes et dispensation reliés au dossier, en temps réel.",
    align: "right",
  },
  {
    top: "450vh",
    eyebrow: "Laboratoire",
    titre: "Des résultats qui circulent",
    desc: "Examens et orientations partagés en un clic avec l'équipe soignante.",
    align: "left",
  },
  {
    top: "560vh",
    eyebrow: "Dossier",
    titre: "Toute l'information, réunie",
    desc: "Du premier rendez-vous à la pharmacie, un dossier unique et sécurisé.",
    align: "right",
  },
];

export default function HospitalWalkthrough() {
  return (
    <div className="fixed inset-0 bg-[#dce8f4]">
      <Canvas
        flat={FX}
        shadows
        dpr={[1, 1.8]}
        camera={{ position: [0, 1.55, 3], fov: 55, near: 0.1, far: 80 }}
        gl={{ antialias: true }}
      >
        <ScrollControls pages={7} damping={0.28}>
          <Suspense fallback={null}>
            <HospitalScene />
          </Suspense>
          {FX && (
            <EffectComposer>
              <Bloom
                intensity={0.6}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.25}
                mipmapBlur
              />
              <Vignette eskil={false} offset={0.2} darkness={0.5} />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}
          <Scroll html style={{ width: "100%" }}>
            {SALLES.map((s) => (
              <div
                key={s.titre}
                style={{ top: s.top }}
                className={[
                  "absolute w-full px-6",
                  s.align === "left"
                    ? "flex justify-start"
                    : s.align === "right"
                      ? "flex justify-end"
                      : "flex justify-center",
                ].join(" ")}
              >
                <div className="max-w-md rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-[#1e3a8a]/10 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
                    {s.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0a2540] sm:text-3xl">
                    {s.titre}
                  </h2>
                  <p className="mt-2 text-[#33506e]">{s.desc}</p>
                </div>
              </div>
            ))}

            {/* Appel à l'action final */}
            <div
              style={{ top: "660vh" }}
              className="absolute flex w-full flex-col items-center px-6 text-center"
            >
              <h2 className="max-w-xl text-3xl font-bold tracking-tight text-[#0a2540] sm:text-4xl">
                Prêt à entrer pour de vrai ?
              </h2>
              <p className="mt-3 max-w-md text-[#33506e]">
                Accédez à l&apos;espace de travail du service médical de l&apos;UCAD.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-6 py-3 font-medium text-white shadow-lg shadow-[#2563eb]/30 transition-colors hover:bg-[#1d4ed8]"
              >
                <LogIn className="h-4 w-4" />
                Accéder à la plateforme
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
