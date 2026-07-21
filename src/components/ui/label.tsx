import * as React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Ajoute un astérisque + annonce « requis » aux lecteurs d'écran. */
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-destructive">
          <span aria-hidden="true">*</span>
          <span className="sr-only"> (requis)</span>
        </span>
      )}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
