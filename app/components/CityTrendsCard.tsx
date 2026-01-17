'use client';

import React from 'react';
import { GECard } from '@/components/GECard';
import { TweetList } from '@/components/TweetList';
import { Hotspot } from '@/app/lib/types';
import { TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface CityTrendsCardProps {
    hotspot: Hotspot;
    onClose: () => void;
}

export default function CityTrendsCard({ hotspot, onClose }: CityTrendsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-24 right-6 z-30"
        >
            <GECard
                title={hotspot.name}
                icon={<Activity className="w-5 h-5 text-red-500 animate-pulse" />}
                live={true}
                onClose={onClose}
                className="w-[400px] max-h-[calc(100vh-120px)]"
                maxHeight={800}
            >
                <div className="flex flex-col gap-6">
                    {/* Stats Row */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1d24]/50 border border-[#2a2f3a]/40">
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Volume (24h)</div>
                            <div className="text-2xl font-mono text-white font-bold">
                                {hotspot.volume.toLocaleString()}
                            </div>
                        </div>
                        {hotspot.topTrend && (
                            <div className="flex-1 border-l border-[#2a2f3a]/40 pl-4">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Top Trend</div>
                                <div className="text-sm font-medium text-blue-400 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" />
                                    {hotspot.topTrend}
                                </div>
                            </div>
                        )}
                    </div>

                    
                </div>
            </GECard>
        </motion.div>
    );
}
