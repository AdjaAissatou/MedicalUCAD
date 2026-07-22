"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { HeartPulse, LogIn } from "lucide-react";

const HospitalWalkthrough = dynamic(() => import("./hospital-walkthrough"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 grid place-items-center bg-[#dce8f4] text-sm text-[#33506e]">
      Préparation de la visite…
    </div>
  ),
});

/** Landing « visite d'hôpital » : en-tête fixe + expérience 3D plein écran. */
export function HospitalLanding() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5 text-[#0a2540]">
            <HeartPulse className="h-6 w-6 text-[#2563eb]" />
            <span className="text-base font-semibold">UCAD Santé</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Link>
        </div>
      </header>
      <HospitalWalkthrough />
    </>
  );
}
