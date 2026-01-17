"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TweetList } from "@/components/TweetList";

export interface GETweetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  region: string;
  maxHeight?: string | number;
  maxTweets?: number;
  autoRotate?: boolean;
}

const GETweetCard = React.forwardRef<HTMLDivElement, GETweetCardProps>(
  ({ className, region, maxHeight, maxTweets = 3, autoRotate = true, ...props }, ref) => {
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
          "bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95 backdrop-blur-sm",
          "border border-[#2a2f3a]/60",
          "rounded-2xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
          "transition-all duration-200",
          "relative",
          "flex flex-col",
          className
        )}
        style={{ ...maxHeightStyle, ...props.style }}
        {...props}
      >
        <div 
          className={cn(
            "p-4",
            "overflow-y-auto flex-1 min-h-0"
          )}
        >
          <TweetList region={region} maxTweets={maxTweets} autoRotate={autoRotate} />
        </div>
      </Card>
    );
  }
);

GETweetCard.displayName = "GETweetCard";

export { GETweetCard };
