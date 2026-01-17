'use client';

import React from 'react';

export default function MarkerKey() {
    return (
        <div className="fixed bottom-6 right-6 z-20 rounded-2xl p-4 flex flex-col gap-3 min-w-[200px] bg-gradient-to-br from-[#1a1d24]/40 via-[#1f2532]/35 to-[#1a1f2e]/40 backdrop-blur-xl backdrop-saturate-150 border-2 border-[#2a2f3a]/40 shadow-[0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)]">
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
