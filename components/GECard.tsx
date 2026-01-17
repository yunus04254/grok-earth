"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { X, Maximize2, Move } from "lucide-react";

export interface GECardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title?: string;
  live?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
  maxHeight?: string | number;
}

const GECard = React.forwardRef<HTMLDivElement, GECardProps>(
  ({ className, children, icon, title, live, onClose, onExpand, maxHeight, ...props }, ref) => {
    const maxHeightStyle = maxHeight 
      ? typeof maxHeight === 'number' 
        ? { maxHeight: `${maxHeight}px` }
        : { maxHeight }
      : undefined;

    return (
      <Card
        ref={ref}
        className={cn(
          // Foundational styling - Palantir-esque gunmetal dark gray aesthetic
          // Background: dark blue-gray gradient with subtle transparency
          "bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95 backdrop-blur-sm",
          // Border: subtle gunmetal border with slight glow
          "border border-[#2a2f3a]/60",
          // Border radius: more rounded for sleek, modern feel
          "rounded-2xl",
          // Shadow: deep, floating card effect with multiple layers
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          // Subtle hover effect for interactivity
          "transition-all duration-200",
          "relative",
          // Hide scrollbar class
          "ge-card",
          // Flexbox layout when maxHeight is set
          maxHeight && "flex flex-col",
          className
        )}
        style={{ ...maxHeightStyle, ...props.style }}
        {...props}
      >
        {/* Top Section: Title Container */}
        {(icon || title || live) && (
          <div className={cn(
            "flex items-center justify-between w-full px-6 pt-6 pb-4 border-b border-[#2a2f3a]/40",
            maxHeight && "flex-shrink-0"
          )}>
            {/* Left side: Icon + Title */}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex-shrink-0 text-[#6b7280] text-xl">
                  {icon}
                </div>
              )}
              {title && (
                <h3 className="text-lg font-semibold uppercase tracking-wider text-[#6b7280] font-mono">
                  {title}
                </h3>
              )}
            </div>

            {/* Right side: LIVE indicator */}
            {live && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1d24] border border-[#2a2f3a]/60">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-sm font-medium text-red-500">LIVE</span>
              </div>
            )}
          </div>
        )}

        {/* Body content - flexible and lenient */}
        {children && (
          <div 
            className={cn(
              (icon || title || live) ? "px-6 pt-4" : "px-6 pt-6",
              "ge-card-content",
              // Make content scrollable when maxHeight is set
              maxHeight && "overflow-y-auto flex-1 min-h-0"
            )}
          >
            {children}
          </div>
        )}

        {/* Control Icons Tool Tray - Bottom, aligned with card content */}
        <div className={cn(
          "px-6 pb-6 flex items-center justify-end gap-2",
          children ? "pt-4" : (icon || title || live) ? "pt-4" : "pt-6",
          maxHeight && "flex-shrink-0"
        )}>
          {/* Move/Drag Indicator */}
          <div className="flex items-center justify-center w-9 h-9 cursor-move group">
            <Move className="h-5 w-5 text-[#6b7280] group-hover:text-[#60a5fa] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
          </div>

          {/* Expand Icon */}
          {onExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExpand?.();
              }}
              className="flex items-center justify-center w-9 h-9 cursor-pointer group active:scale-95 transition-all duration-300"
            >
              <Maximize2 className="h-5 w-5 text-[#6b7280] group-hover:text-[#34d399] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </button>
          )}

          {/* Close Icon */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              className="flex items-center justify-center w-9 h-9 cursor-pointer group active:scale-95 transition-all duration-300"
            >
              <X className="h-5 w-5 text-[#6b7280] group-hover:text-[#f87171] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
            </button>
          )}
        </div>
      </Card>
    );
  }
);
GECard.displayName = "GECard";

export { GECard };
