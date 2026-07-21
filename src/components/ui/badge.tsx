import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Anneau interne (ring-inset) pour définir le badge sur toute surface et
// renforcer le contraste — utile pour les statuts médicaux.
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground ring-secondary-foreground/15",
        primary: "bg-primary/10 text-primary ring-primary/20",
        success: "bg-green-100 text-green-800 ring-green-600/20",
        warning: "bg-amber-100 text-amber-800 ring-amber-600/25",
        destructive: "bg-red-100 text-red-800 ring-red-600/20",
        info: "bg-cyan-100 text-cyan-800 ring-cyan-600/20",
        neutral: "bg-muted text-muted-foreground ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const dotColor: Record<string, string> = {
  default: "bg-secondary-foreground/60",
  primary: "bg-primary",
  success: "bg-green-600",
  warning: "bg-amber-600",
  destructive: "bg-red-600",
  info: "bg-cyan-600",
  neutral: "bg-muted-foreground",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Affiche un point de statut coloré avant le contenu. */
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            dotColor[variant ?? "default"]
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
