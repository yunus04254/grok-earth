'use client';

import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface GETooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    contentClassName?: string;
}

export function GETooltipProvider({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider delayDuration={200}>
            {children}
        </TooltipProvider>
    );
}

export function GETooltip({
    children,
    content,
    side = 'right',
    className,
    contentClassName,
}: GETooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild className={className}>
                {children}
            </TooltipTrigger>
            <TooltipContent
                side={side}
                className={cn(
                    // Match GECard styling
                    "bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95 backdrop-blur-sm",
                    "border border-[#2a2f3a]/60",
                    "rounded-2xl",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]",
                    "px-3 py-1.5",
                    "text-sm font-mono text-white",
                    "z-50",
                    contentClassName
                )}
            >
                {content}
            </TooltipContent>
        </Tooltip>
    );
}
