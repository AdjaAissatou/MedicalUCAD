import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Style partagé par Input / Textarea / Select.
 * - Focus : anneau 2px cohérent (WCAG 2.4.7).
 * - Erreur : bordure + anneau rouge dès que `aria-invalid` est présent.
 * - Désactivé : opacité réduite + curseur explicite.
 */
export const fieldBaseClass =
  "flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-[color,box-shadow,border-color] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/30 aria-[invalid=true]:focus-visible:ring-destructive/40";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      fieldBaseClass,
      "h-10",
      // `file:` — style de l'entrée fichier ; `[color-scheme]` aligne le
      // sélecteur de date natif sur la palette claire.
      "file:border-0 file:bg-transparent file:text-sm file:font-medium [color-scheme:light]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
