"use client";

import * as React from "react";
import { Button, ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const geButtonVariants = cva(
  // Base styles matching GECard aesthetic
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: cn(
          // Gunmetal dark gradient background
          "bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95",
          "border border-[#2a2f3a]/60",
          "text-[#e5e7eb]",
          "shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_4px_rgba(0,0,0,0.15)]",
          "hover:bg-gradient-to-br hover:from-[#1f2532]/95 hover:via-[#252a38]/95 hover:to-[#1f2532]/95",
          "hover:border-[#3a3f4a]/80",
          "hover:shadow-[0_6px_24px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          "active:scale-[0.98]"
        ),
        outline: cn(
          "bg-transparent",
          "border border-[#2a2f3a]/60",
          "text-[#6b7280]",
          "hover:bg-[#1a1d24]/50",
          "hover:border-[#3a3f4a]/80",
          "hover:text-[#e5e7eb]",
          "active:scale-[0.98]"
        ),
        ghost: cn(
          "bg-transparent",
          "text-[#6b7280]",
          "hover:bg-[#1a1d24]/50",
          "hover:text-[#e5e7eb]",
          "active:scale-[0.98]"
        ),
        destructive: cn(
          "bg-gradient-to-br from-[#7f1d1d]/95 via-[#991b1b]/95 to-[#7f1d1d]/95",
          "border border-[#dc2626]/60",
          "text-[#fee2e2]",
          "shadow-[0_4px_16px_rgba(220,38,38,0.2),0_1px_4px_rgba(220,38,38,0.1)]",
          "hover:bg-gradient-to-br hover:from-[#991b1b]/95 hover:via-[#b91c1c]/95 hover:to-[#991b1b]/95",
          "hover:border-[#ef4444]/80",
          "hover:shadow-[0_6px_24px_rgba(220,38,38,0.3),0_2px_8px_rgba(220,38,38,0.15)]",
          "active:scale-[0.98]"
        ),
        success: cn(
          "bg-gradient-to-br from-[#064e3b]/95 via-[#065f46]/95 to-[#064e3b]/95",
          "border border-[#10b981]/60",
          "text-[#d1fae5]",
          "shadow-[0_4px_16px_rgba(16,185,129,0.2),0_1px_4px_rgba(16,185,129,0.1)]",
          "hover:bg-gradient-to-br hover:from-[#065f46]/95 hover:via-[#047857]/95 hover:to-[#065f46]/95",
          "hover:border-[#34d399]/80",
          "hover:shadow-[0_6px_24px_rgba(16,185,129,0.3),0_2px_8px_rgba(16,185,129,0.15)]",
          "active:scale-[0.98]"
        ),
        accent: cn(
          "bg-gradient-to-br from-[#1e3a5f]/95 via-[#1e40af]/95 to-[#1e3a5f]/95",
          "border border-[#3b82f6]/60",
          "text-[#dbeafe]",
          "shadow-[0_4px_16px_rgba(59,130,246,0.2),0_1px_4px_rgba(59,130,246,0.1)]",
          "hover:bg-gradient-to-br hover:from-[#1e40af]/95 hover:via-[#2563eb]/95 hover:to-[#1e40af]/95",
          "hover:border-[#60a5fa]/80",
          "hover:shadow-[0_6px_24px_rgba(59,130,246,0.3),0_2px_8px_rgba(59,130,246,0.15)]",
          "active:scale-[0.98]"
        ),
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 px-3 rounded-lg text-sm",
        lg: "h-12 px-8 rounded-2xl text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GEButtonProps
  extends Omit<ButtonProps, "variant" | "size">,
    VariantProps<typeof geButtonVariants> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

const GEButton = React.forwardRef<HTMLButtonElement, GEButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(geButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
GEButton.displayName = "GEButton";

export { GEButton, geButtonVariants };
