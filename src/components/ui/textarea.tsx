import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldBaseClass } from "@/components/ui/input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBaseClass, "min-h-20 resize-y", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
