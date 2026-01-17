'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Loader2, ExternalLink, BarChart3, DollarSign, MapPin } from 'lucide-react';
import { GECard } from '@/components/GECard';
import { motion } from 'framer-motion';

interface PredictionMarketsProps {
  onClose: () => void;
  city: string;
}

interface Market {
  id: string;
  question: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  liquidity: number;
  slug: string;
  url: string;
}

interface MarketsResponse {
  location: string;
  country?: string;
  region?: string;
  markets: Market[];
  summary: string;
  totalFound: number;
  searchTermsUsed?: string[];
  tagsFound?: number;
  citations?: string[];
}

function formatVolume(volume: number | string | undefined): string {
  const num = typeof volume === 'string' ? parseFloat(volume) : (volume ?? 0);
  if (isNaN(num)) return '$0';
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return `$${Math.round(num)}`;
}

function safeNumber(value: number | string | undefined, fallback: number = 0): number {
  if (value === undefined || value === null) return fallback;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? fallback : num;
}

function MarketCard({ market }: { market: Market }) {
  const primaryOutcome = market.outcomes?.[0] || 'Yes';
  const primaryPrice = safeNumber(market.prices?.[0], 50);
  const secondaryPrice = safeNumber(market.prices?.[1], 100 - primaryPrice);
  
  const getBarColor = (price: number) => {
    if (price >= 70) return 'bg-emerald-500';
    if (price >= 50) return 'bg-cyan-500';
    if (price >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="group relative bg-[#0d1117]/60 border border-[#2a2f3a]/50 rounded-xl p-3 hover:border-[#60a5fa]/40 transition-all duration-300">
      <h4 className="text-xs font-medium text-[#e5e7eb] mb-2 line-clamp-2 leading-relaxed">
        {market.question}
      </h4>

      <div className="relative mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#9ca3af] text-[10px]">{primaryOutcome}</span>
          <span className="font-mono font-bold text-[#e5e7eb] text-[10px]">{Math.round(primaryPrice)}%</span>
        </div>
        <div className="h-1.5 bg-[#1a1d24] rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(primaryPrice)} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${primaryPrice}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-[#2a2f3a]/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 text-[10px] text-[#6b7280]">
            <DollarSign className="w-2.5 h-2.5" />
            <span>{formatVolume(market.volume)}</span>
          </div>
        </div>
        <a
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-[#60a5fa] hover:text-[#93c5fd] transition-colors"
        >
          <span>Trade</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}

export default function PredictionMarkets({ onClose, city }: PredictionMarketsProps) {
  const [data, setData] = useState<MarketsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasQueried = useRef(false);

  // Auto-query when component mounts with a city
  useEffect(() => {
    if (city && !hasQueried.current) {
      hasQueried.current = true;
      queryMarkets(city);
    }
  }, [city]);

  const queryMarkets = async (location: string) => {
    if (!location.trim()) return;

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/prediction-markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: MarketsResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="fixed right-6 bottom-32 z-40 w-[340px] max-h-[calc(100vh-320px)]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.15 }}
    >
      <GECard
        icon={<TrendingUp className="h-5 w-5" />}
        title="Prediction Markets"
        onClose={onClose}
        maxHeight={700}
      >
        <div className="space-y-4">
          {/* City Header */}
          <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="p-2 bg-purple-500/20 rounded-full">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-[#9ca3af] uppercase tracking-wide">Markets for</p>
              <p className="text-lg font-semibold text-[#e5e7eb]">{city}</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-[#9ca3af] text-sm">
                Finding prediction markets for {city}...
              </p>
            </div>
          )}

          {/* Results */}
          {data && (
            <div className="space-y-4">
              {/* AI Summary */}
              {data.summary && (
                <div className="p-3 bg-gradient-to-r from-[#60a5fa]/10 to-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#e5e7eb] leading-relaxed">{data.summary}</p>
                  </div>
                </div>
              )}

              {/* Markets */}
              {data.markets.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-[#e5e7eb]">
                      Active Markets ({data.markets.length})
                    </h3>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {data.markets.map((market) => (
                      <MarketCard key={market.id} market={market} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#9ca3af] text-sm">
                    No active markets found for {city}.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-[#2a2f3a]/40">
                <p className="text-xs text-[#6b7280] text-center">
                  Powered by Polymarket • AI by xAI Grok
                </p>
              </div>
            </div>
          )}
        </div>
      </GECard>
    </motion.div>
  );
}
