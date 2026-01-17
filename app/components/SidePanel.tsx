'use client';

import React, { useState } from 'react';

// Icons representing the features
function TweetsIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function LiveSpacesIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 3.75c-4.56 0-8.25 3.69-8.25 8.25s3.69 8.25 8.25 8.25 8.25-3.69 8.25-8.25S16.56 3.75 12 3.75zM1.75 12c0-5.66 4.59-10.25 10.25-10.25S22.25 6.34 22.25 12 17.66 22.25 12 22.25 1.75 17.66 1.75 12zm10.25-4.25c-2.35 0-4.25 1.9-4.25 4.25s1.9 4.25 4.25 4.25 4.25-1.9 4.25-4.25-1.9-4.25-4.25-4.25z" />
        </svg>
    );
}

function PodcastIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12v6c0 1.1.9 2 2 2h1c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1H4v-1c0-4.42 3.58-8 8-8s8 3.58 8 8v1h-1c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h1c1.1 0 2-.9 2-2v-6c0-5.52-4.48-10-10-10z" />
        </svg>
    );
}

function RadioIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z" />
        </svg>
    );
}

function GrokipediaIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
    );
}

function PredictionMarketsIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
        </svg>
    );
}

function StarlinkIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
        </svg>
    );
}

function ImagineIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
            <circle cx="8" cy="8.5" r="1.5" />
        </svg>
    );
}

interface IconItem {
    icon: () => React.ReactElement;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    activeColor?: string;
}

interface SidePanelProps {
    hasCity?: boolean;
    showGrokipedia?: boolean;
    showGrokRadio?: boolean;
    showPredictionMarkets?: boolean;
    showGrokImagine?: boolean;
    showStarlink?: boolean;
    onToggleGrokipedia?: () => void;
    onToggleGrokRadio?: () => void;
    onTogglePredictionMarkets?: () => void;
    onToggleGrokImagine?: () => void;
    onToggleStarlink?: () => void;
}

export default function SidePanel({
    hasCity = false,
    showGrokipedia = false,
    showGrokRadio = false,
    showPredictionMarkets = false,
    showGrokImagine = false,
    showStarlink = false,
    onToggleGrokipedia,
    onToggleGrokRadio,
    onTogglePredictionMarkets,
    onToggleGrokImagine,
    onToggleStarlink,
}: SidePanelProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const ICON_ITEMS: IconItem[] = [
        { icon: TweetsIcon, label: 'Tweets' },
        { icon: LiveSpacesIcon, label: 'X Live Spaces' },
        { icon: PodcastIcon, label: 'Podcast' },
        {
            icon: RadioIcon,
            label: 'Grok Radio',
            onClick: hasCity ? onToggleGrokRadio : undefined,
            isActive: hasCity && showGrokRadio,
            activeColor: 'emerald'
        },
        {
            icon: GrokipediaIcon,
            label: 'Grokipedia',
            onClick: hasCity ? onToggleGrokipedia : undefined,
            isActive: hasCity && showGrokipedia,
            activeColor: 'blue'
        },
        {
            icon: PredictionMarketsIcon,
            label: 'Prediction Markets',
            onClick: hasCity ? onTogglePredictionMarkets : undefined,
            isActive: hasCity && showPredictionMarkets,
            activeColor: 'purple'
        },
        {
            icon: ImagineIcon,
            label: 'Grok Imagine',
            onClick: hasCity ? onToggleGrokImagine : undefined,
            isActive: hasCity && showGrokImagine,
            activeColor: 'cyan'
        },
        {
            icon: StarlinkIcon,
            label: 'Starlink',
            onClick: onToggleStarlink,
            isActive: showStarlink,
            activeColor: 'emerald'
        },
    ];

    const iconSize = 40;
    const iconGap = 10;
    const totalIconsHeight = ICON_ITEMS.length * iconSize + (ICON_ITEMS.length - 1) * iconGap;
    const paddingY = 18;
    const paddingLeft = 14;
    const paddingRight = 10;
    const curveHeight = 30;
    const cornerRadius = 24;
    const totalHeight = totalIconsHeight + (paddingY * 2) + (curveHeight * 2);
    const panelWidth = 60;

    const getActiveStyles = (item: IconItem, isHovered: boolean) => {
        if (item.isActive) {
            const colorMap: Record<string, string> = {
                emerald: 'rgba(52, 211, 153, 0.3)',
                blue: 'rgba(96, 165, 250, 0.3)',
                purple: 'rgba(168, 85, 247, 0.3)',
                cyan: 'rgba(34, 211, 238, 0.3)',
            };
            const glowMap: Record<string, string> = {
                emerald: '0 0 12px rgba(52, 211, 153, 0.5)',
                blue: '0 0 12px rgba(96, 165, 250, 0.5)',
                purple: '0 0 12px rgba(168, 85, 247, 0.5)',
                cyan: '0 0 12px rgba(34, 211, 238, 0.5)',
            };
            return {
                background: colorMap[item.activeColor || 'blue'],
                boxShadow: glowMap[item.activeColor || 'blue'],
            };
        }
        return {};
    };

    return (
        <div
            className="fixed left-0 top-1/2 z-10"
            style={{
                transform: 'translateY(-50%)',
                width: panelWidth,
                height: totalHeight
            }}
        >
            {/* SVG background - stays fixed width */}
            <svg
                className="absolute overflow-visible"
                width={panelWidth}
                height={totalHeight}
                viewBox={`0 0 ${panelWidth} ${totalHeight}`}
                style={{ left: 0 }}
            >
                <defs>
                    <linearGradient id="sidebarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(26, 29, 36, 0.4)" />
                        <stop offset="100%" stopColor="rgba(26, 31, 46, 0.4)" />
                    </linearGradient>
                </defs>
                <path
                    d={`
                        M0,0 
                        L0,${curveHeight}
                        Q${curveHeight * 0.6},${curveHeight} ${panelWidth - cornerRadius},${curveHeight}
                        Q${panelWidth},${curveHeight} ${panelWidth},${curveHeight + cornerRadius}
                        L${panelWidth},${totalHeight - curveHeight - cornerRadius}
                        Q${panelWidth},${totalHeight - curveHeight} ${panelWidth - cornerRadius},${totalHeight - curveHeight}
                        Q${curveHeight * 0.6},${totalHeight - curveHeight} 0,${totalHeight - curveHeight}
                        L0,${totalHeight}
                        Z
                    `}
                    fill="url(#sidebarGradient)"
                    stroke="rgba(42, 47, 58, 0.6)"
                    strokeWidth="2"
                />
            </svg>

            {/* Icons container */}
            <div
                className="relative flex flex-col items-center justify-center h-full"
                style={{
                    paddingTop: curveHeight + paddingY,
                    paddingBottom: curveHeight + paddingY,
                    paddingLeft: paddingLeft,
                    paddingRight: paddingRight,
                    gap: iconGap
                }}
            >
                {ICON_ITEMS.map((item, index) => (
                    <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Icon button */}
                        <button
                            className={`icon-button relative z-10 rounded-xl transition-all duration-200 ${item.isActive ? 'ring-1 ring-white/20' : ''
                                } ${!item.onClick && hasCity ? 'opacity-40' : ''}`}
                            style={{
                                width: iconSize,
                                height: iconSize,
                                transform: hoveredIndex === index ? 'scale(1.15)' : 'scale(1)',
                                transition: 'transform 0.15s ease-out, background 0.2s, box-shadow 0.2s',
                                ...getActiveStyles(item, hoveredIndex === index),
                            }}
                            onClick={item.onClick}
                            disabled={!item.onClick}
                        >
                            <item.icon />
                        </button>

                        {/* Connected tooltip - extends from sidebar */}
                        <div
                            className="absolute flex items-center pointer-events-none"
                            style={{
                                left: 0,
                                top: 0,
                                height: iconSize,
                                paddingLeft: iconSize + 8,
                                paddingRight: hoveredIndex === index ? 16 : 0,
                                background: 'rgba(15, 20, 25, 0.98)',
                                borderRadius: '0 20px 20px 0',
                                borderTop: 'none',
                                borderBottom: 'none',
                                borderLeft: 'none',
                                borderRight: hoveredIndex === index ? '1px solid rgba(47, 51, 54, 0.6)' : 'none',
                                width: hoveredIndex === index ? 'auto' : iconSize,
                                minWidth: iconSize,
                                opacity: hoveredIndex === index ? 1 : 0,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 5,
                            }}
                        >
                            {/* Label */}
                            <span
                                className="text-sm font-medium text-white whitespace-nowrap flex items-center gap-2"
                                style={{
                                    opacity: hoveredIndex === index ? 1 : 0,
                                    transition: hoveredIndex === index
                                        ? 'opacity 0.15s ease-out 0.1s'
                                        : 'opacity 0.15s ease-out 0s',
                                }}
                            >
                                {item.label}
                                {item.isActive && (
                                    <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-white/70">ON</span>
                                )}
                                {hasCity && item.onClick && !item.isActive && (
                                    <span className="text-xs px-1.5 py-0.5 bg-white/5 rounded text-white/40">OFF</span>
                                )}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
