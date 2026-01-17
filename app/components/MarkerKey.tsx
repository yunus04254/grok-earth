'use client';

import React from 'react';

export default function MarkerKey() {
    return (
        <div className="fixed bottom-6 right-6 z-20 glass-panel rounded-xl p-4 flex flex-col gap-3 min-w-[200px]">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                Live Activity
            </div>

            {/* Red Hotspot Item */}
            <div className="flex items-center gap-3">
                <div className="relative w-4 h-4 flex items-center justify-center">
                    <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10" />
                    <div className="absolute w-full h-full border border-red-500/50 rounded-full animate-pulse" />
                </div>
                <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                    High Volume
                </span>
            </div>

            {/* Blue Zone Item */}
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-[rgba(50,200,255,0.4)] blur-[2px] shadow-[0_0_10px_rgba(50,200,255,0.6)]" />
                <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                    Emerging Trends
                </span>
            </div>

            {/* Live Spaces Item */}
            <div className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                    Spaces
                </span>
            </div>
        </div>
    );
}
