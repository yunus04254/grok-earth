"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Heart, Repeat2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface Tweet {
  id: string;
  content: string;
  handle: string;
  avatar: string;
  likes: number;
  retweets: number;
  createdAt: string;
}

interface TweetCardProps {
  id: string;
  avatar: string;
  handle: string;
  content: string;
  likes: number;
  retweets: number;
}

const TweetCard = React.forwardRef<HTMLDivElement, TweetCardProps>(
  ({ id, avatar, handle, content, likes, retweets }, ref) => {
    const username = handle.replace('@', '');
    const tweetUrl = `https://twitter.com/${username}/status/${id}`;
    
    return (
      <a 
        href={tweetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block no-underline"
      >
        <Card
          ref={ref}
          className="bg-transparent border-[#2a2f3a]/40 rounded-xl transition-all duration-200 hover:border-[#2a2f3a]/80 hover:bg-[#1a1d24]/30 hover:shadow-lg cursor-pointer"
        >
        <CardContent className="flex gap-2 p-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={avatar}
              alt={handle}
              className="w-10 h-10 rounded-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Handle */}
            <div className="text-[#6b7280] font-medium text-sm mb-0.5">
              {handle}
            </div>

            {/* Tweet Content */}
            <div className="text-white text-sm mb-2 line-clamp-2">
              {content}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-[#6b7280]">
              {/* Retweets */}
              <div className="flex items-center gap-1.5">
                <Repeat2 className="h-3.5 w-3.5" />
                <span className="text-xs">{retweets}</span>
              </div>

              {/* Likes */}
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                <span className="text-xs">{likes}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </a>
    );
  }
);

TweetCard.displayName = "TweetCard";

interface TweetListProps {
  region: string;
  maxTweets?: number;
  autoRotate?: boolean;
}

export const TweetList: React.FC<TweetListProps> = ({ region, maxTweets = 3, autoRotate = true }) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await fetch(`/api/fetch-tweets?location=${encodeURIComponent(region)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tweets');
        }
        const data = await response.json();
        setTweets(data.tweets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [region]);

  // Auto-rotate tweets every 3 seconds
  useEffect(() => {
    if (!autoRotate || tweets.length <= maxTweets) return; // Don't rotate if disabled or not enough tweets

    const interval = setInterval(() => {
      setOffset((prev) => (prev + 1) % tweets.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [tweets.length, autoRotate, maxTweets]);

  if (loading) {
    return (
      <div className="text-[#6b7280] text-center py-8">Loading tweets...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">Error: {error}</div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div className="text-[#6b7280] text-center py-8">No tweets found</div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {Array.from({ length: maxTweets }).map((_, i) => {
            const tweetIndex = (offset + i) % tweets.length;
            const tweet = tweets[tweetIndex];
            if (!tweet) return null;
            
            return (
              <motion.div
                key={tweet.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  layout: { duration: 0.5, ease: "easeInOut" },
                  opacity: { duration: 0.3 },
                  y: { duration: 0.3 }
                }}
                className="mb-2"
              >
                <TweetCard
                  id={tweet.id}
                  avatar={tweet.avatar}
                  handle={tweet.handle}
                  content={tweet.content}
                  likes={tweet.likes}
                  retweets={tweet.retweets}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
