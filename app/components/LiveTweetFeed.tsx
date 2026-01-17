'use client';

import React from 'react';
import { GECard } from '@/components/GECard';
import { TweetList } from '@/components/TweetList';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveTweetFeedProps {
    city: string;
    onClose: () => void;
}

export default function LiveTweetFeed({ city, onClose }: LiveTweetFeedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-24 right-6 z-30"
        >
            <GECard
                title={`X Posts in ${city}`}
                icon={<MessageSquare className="w-5 h-5 text-blue-400" />}
                onClose={onClose}
                className="w-[400px] max-h-[calc(100vh-300px)]"
                maxHeight={600}
            >
                <div className="flex flex-col gap-4">
                    <TweetList
                        region={city}
                        maxTweets={3}
                        autoRotate={true}
                    />
                </div>
            </GECard>
        </motion.div>
    );
}
