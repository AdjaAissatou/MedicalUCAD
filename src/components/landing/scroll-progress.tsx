"use client";

import { useEffect, useState } from "react";

/**
 * Fine barre de progression du défilement, en haut de la page.
 * Mise à jour throttlée via requestAnimationFrame ; purement décorative
 * (aria-hidden). Se masque tant que la page n'a pas de quoi défiler.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-1"
      aria-hidden
      style={{ opacity: progress > 0.5 ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-accent to-[#22d3ee]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
