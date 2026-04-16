import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-[#30363d] bg-[#1f6feb22] text-[#58a6ff]",
      success: "border-[#2ea04355] bg-[#2ea04322] text-[#3fb950]",
      warning: "border-[#d2992255] bg-[#d2992222] text-[#d29922]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
