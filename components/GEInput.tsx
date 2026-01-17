"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GEInputProps extends React.ComponentProps<"input"> {
  className?: string;
}

const GEInput = React.forwardRef<HTMLInputElement, GEInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          // Foundational styling - Palantir-esque gunmetal dark gray aesthetic
          // Background: dark blue-gray gradient with subtle transparency
          "bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95 backdrop-blur-sm",
          // Border: subtle gunmetal border with slight glow
          "border border-[#2a2f3a]/60",
          // Border radius: more rounded for sleek, modern feel
          "rounded-2xl",
          // Text colors matching SidePanel/GECard style
          "text-[#e5e7eb] placeholder:text-[#9ca3af]",
          // Shadow: deep, floating card effect
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          // Focus states with subtle glow
          "focus-visible:border-[#2a2f3a] focus-visible:ring-2 focus-visible:ring-[#2a2f3a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1d24]",
          // Transition for smooth interactions
          "transition-all duration-200",
          // Height and padding
          "h-12 px-4 py-3",
          className
        )}
        {...props}
      />
    );
  }
);
GEInput.displayName = "GEInput";

export { GEInput };
