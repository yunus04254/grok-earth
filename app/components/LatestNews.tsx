"use client";

import { useState, useEffect, useRef } from "react";
import { GECard } from "@/components/GECard";
import { Newspaper, Loader2, ExternalLink, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface LatestNewsProps {
  onClose: () => void;
  city: string;
}

interface NewsStory {
  headline: string;
  summary: string;
  url: string | null;
  timestamp?: string;
}

interface LatestNewsResponse {
  stories: NewsStory[];
  citations?: string[];
  error?: boolean;
  message?: string;
}

export default function LatestNews({ onClose, city }: LatestNewsProps) {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queriedCity = useRef<string | null>(null);

  // Auto-query when component mounts with a city (only if city changed)
  useEffect(() => {
    if (city && city !== queriedCity.current) {
      queriedCity.current = city;
      fetchLatestNews(city);
    }
  }, [city]);

  const fetchLatestNews = async (cityName: string) => {
    if (!cityName.trim()) return;

    setIsLoading(true);
    setError(null);
    setStories([]);

    try {
      const response = await fetch('/api/latest-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city: cityName }),
      });

      const data: LatestNewsResponse = await response.json();

      if (data.error) {
        setError(data.message || 'Failed to fetch latest news');
        return;
      }

      if (data.stories && Array.isArray(data.stories)) {
        setStories(data.stories);
      } else {
        setError('No news stories found');
      }
    } catch (err) {
      console.error('Error fetching latest news:', err);
      setError('Failed to fetch latest news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div 
      className="fixed right-[524px] top-24 z-40 w-[340px] max-h-[calc(100vh-280px)]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
    >
      <GECard
        icon={<Newspaper className="h-5 w-5" />}
        title="Latest News"
        onClose={onClose}
        maxHeight={700}
      >
        <div className="space-y-4">
          {/* City Header */}
          <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="p-2 bg-orange-500/20 rounded-full">
              <MapPin className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-[#9ca3af] uppercase tracking-wide">News for</p>
              <p className="text-lg font-semibold text-[#e5e7eb]">{city}</p>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-[#9ca3af] text-sm">
                Fetching latest news for {city}...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* News stories */}
          {!isLoading && !error && stories.length > 0 && (
            <div className="space-y-3">
              {stories.map((story, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    group relative p-4 rounded-xl border transition-all duration-200
                    ${story.url 
                      ? 'bg-[#0f1419]/60 border-[#2a2f3a]/40 hover:bg-[#0f1419]/80 hover:border-[#60a5fa]/40 cursor-pointer' 
                      : 'bg-[#0f1419]/60 border-[#2a2f3a]/40'
                    }
                  `}
                  onClick={() => handleStoryClick(story.url)}
                >
                  {/* Headline */}
                  <h4 className="text-sm font-semibold text-[#e5e7eb] mb-2 leading-tight group-hover:text-[#60a5fa] transition-colors">
                    {story.headline}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-[#9ca3af] leading-relaxed mb-3 line-clamp-3">
                    {story.summary}
                  </p>

                  {/* Footer with timestamp and link icon */}
                  <div className="flex items-center justify-between">
                    {story.timestamp && (
                      <div className="flex items-center gap-1.5 text-[#6b7280]">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{story.timestamp}</span>
                      </div>
                    )}
                    {story.url && (
                      <div className="flex items-center gap-1.5 text-[#6b7280] group-hover:text-[#60a5fa] transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        <span className="text-xs">Read more</span>
                      </div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  {story.url && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#60a5fa]/0 to-[#60a5fa]/0 group-hover:from-[#60a5fa]/5 group-hover:to-transparent transition-all duration-200 pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && stories.length === 0 && (
            <div className="text-center py-8">
              <Newspaper className="w-12 h-12 text-[#6b7280] mx-auto mb-3 opacity-50" />
              <p className="text-[#9ca3af] text-sm">
                No recent news found for {city}
              </p>
            </div>
          )}
        </div>
      </GECard>
    </motion.div>
  );
}
