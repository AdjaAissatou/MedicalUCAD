import { cn } from "@/lib/utils";

/**
 * Enveloppe qui révèle son contenu au montage (fondu + glissement).
 * `index` crée l'effet de cascade en décalant l'animation.
 * Purement CSS — aucun JS d'exécution, respecte prefers-reduced-motion.
 */
export function Reveal({
  children,
  index = 0,
  variant = "up",
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  index?: number;
  variant?: "up" | "fade" | "scale";
  className?: string;
  as?: React.ElementType;
}) {
  const cls =
    variant === "fade"
      ? "reveal-fade"
      : variant === "scale"
        ? "reveal-scale"
        : "reveal";

  return (
    <Tag
      className={cn(cls, className)}
      style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
      {children}
    </Tag>
  );
}
