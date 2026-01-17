'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TweetList } from '@/components/TweetList';
import { MessageSquare, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveTweetFeedProps {
    city: string;
    onClose: () => void;
}

export default function LiveTweetFeed({ city, onClose }: LiveTweetFeedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
            className="fixed left-6 bottom-32 z-40 w-[340px] max-h-[calc(100vh-320px)]"
        >
            <Card
                className={cn(
                    "bg-gradient-to-br from-[#1a1d24]/40 via-[#1f2532]/35 to-[#1a1f2e]/40 backdrop-blur-xl backdrop-saturate-150",
                    "border-2 border-[#2a2f3a]/40",
                    "rounded-2xl",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.3)]",
                    "transition-all duration-200",
                    "relative",
                    "flex flex-col",
                    "max-h-[700px]"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between w-full px-6 pt-6 pb-4 border-b border-[#2a2f3a]/40 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 text-blue-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-semibold uppercase tracking-wider text-[#6b7280] font-mono">
                            X Posts
                        </h3>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[#2a2f3a]/60 transition-colors text-[#6b7280] hover:text-[#e5e7eb]"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4 p-6 overflow-y-auto flex-1 min-h-0">
                    <TweetList
                        region={city}
                        maxTweets={3}
                        autoRotate={true}
                    />
                </div>
            </Card>
        </motion.div>
    );
}
