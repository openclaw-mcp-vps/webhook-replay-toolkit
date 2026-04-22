import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-800/80 text-slate-200",
        secondary: "border-slate-800 bg-slate-900/80 text-slate-300",
        success: "border-emerald-700/70 bg-emerald-950/70 text-emerald-200",
        warning: "border-amber-700/70 bg-amber-950/60 text-amber-200",
        info: "border-sky-700/70 bg-sky-950/60 text-sky-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
