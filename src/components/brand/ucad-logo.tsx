import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Logo UCAD Medical — reconstitution vectorielle (SVG) de la marque :
 * cœur bicolore vert→or, croix médicale + tracé ECG, étoile dorée, livre ouvert.
 * Vectoriel : net à toute taille, sans dépendance d'image, lisible clair/sombre.
 */
export function UcadLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="UCAD Medical"
    >
      <defs>
        <linearGradient id="ucadHeartGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#12A58F" />
          <stop offset="45%" stopColor="#0E7A6B" />
          <stop offset="72%" stopColor="#BC8E39" />
          <stop offset="100%" stopColor="#E7C877" />
        </linearGradient>
      </defs>

      {/* Étoile dorée */}
      <path
        d="M24 5.2 L25.1 7.6 27.8 7.9 25.8 9.8 26.3 12.5 24 11.2 21.7 12.5 22.2 9.8 20.2 7.9 22.9 7.6 Z"
        fill="#E0B85E"
      />

      {/* Cœur bicolore (vert → or) */}
      <path
        d="M24 39 C 11 30 8.5 21.5 14.5 16.5 C 19 12.8 24 15.2 24 19.2 C 24 15.2 29 12.8 33.5 16.5 C 39.5 21.5 37 30 24 39 Z"
        fill="none"
        stroke="url(#ucadHeartGrad)"
        strokeWidth="3.3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Croix médicale */}
      <rect x="21.4" y="17.6" width="5.2" height="14.4" rx="1.5" fill="#0C6B60" />
      <rect x="16.8" y="21.9" width="14.4" height="5.2" rx="1.5" fill="#0C6B60" />

      {/* Tracé ECG sur la barre horizontale */}
      <path
        d="M17.4 24.5 h2.8 l1.5 -3 1.8 5.4 1.5 -2.6 h3.2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Livre ouvert (identité universitaire) */}
      <path
        d="M24 37.4 C 20.5 35.4 16.9 35.8 14.9 36.9 L14.9 40.6 C 17.7 39.4 21 39.6 24 41.4 Z"
        fill="#0F7A6B"
      />
      <path
        d="M24 37.4 C 27.5 35.4 31.1 35.8 33.1 36.9 L33.1 40.6 C 30.3 39.4 27 39.6 24 41.4 Z"
        fill="#0B4F47"
      />
    </svg>
  );
}

/** Verrou logo + nom, pour les en-têtes d'authentification. */
export function UcadLogo({
  className,
  markClassName = "h-10 w-10",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <UcadLogoMark className={markClassName} />
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        UCAD <span className="text-gold">Medical</span>
      </span>
    </span>
  );
}
