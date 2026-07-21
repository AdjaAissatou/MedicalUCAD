import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBaseClass } from "@/components/ui/input";

// Chevron cohérent (couleur --muted-foreground) en remplacement de la flèche
// native, dont l'apparence varie d'un navigateur à l'autre.
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2355716f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, style, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      fieldBaseClass,
      "h-10 cursor-pointer appearance-none bg-no-repeat pr-9",
      className
    )}
    style={{
      backgroundImage: CHEVRON,
      backgroundPosition: "right 0.65rem center",
      ...style,
    }}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
