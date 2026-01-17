'use client';

import { useState } from 'react';
import { Search, TrendingUp, Loader2, ExternalLink, BarChart3, DollarSign } from 'lucide-react';
import { GECard } from '@/components/GECard';

interface PredictionMarketsProps {
  onClose: () => void;
  initialLocation?: string;
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
  
  // Determine color based on probability
  const getBarColor = (price: number) => {
    if (price >= 70) return 'bg-emerald-500';
    if (price >= 50) return 'bg-cyan-500';
    if (price >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="group relative bg-[#0d1117]/60 border border-[#2a2f3a]/50 rounded-xl p-4 hover:border-[#60a5fa]/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(96,165,250,0.1)]">
      {/* Question */}
      <h4 className="text-sm font-medium text-[#e5e7eb] mb-3 line-clamp-2 leading-relaxed">
        {market.question}
      </h4>

      {/* Probability Bar */}
      <div className="relative mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#9ca3af]">{primaryOutcome}</span>
          <span className="font-mono font-bold text-[#e5e7eb]">{Math.round(primaryPrice)}%</span>
        </div>
        <div className="h-2.5 bg-[#1a1d24] rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor(primaryPrice)} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${primaryPrice}%` }}
          />
        </div>
        {market.outcomes.length > 1 && (
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className="text-[#6b7280]">{market.outcomes[1] || 'No'}</span>
            <span className="font-mono text-[#6b7280]">{Math.round(secondaryPrice)}%</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2a2f3a]/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            <DollarSign className="w-3 h-3" />
            <span>{formatVolume(market.volume)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            <BarChart3 className="w-3 h-3" />
            <span>{formatVolume(market.liquidity)}</span>
          </div>
        </div>
        <a
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#60a5fa] hover:text-[#93c5fd] transition-colors opacity-0 group-hover:opacity-100"
        >
          <span>Trade</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default function PredictionMarkets({ onClose, initialLocation = '' }: PredictionMarketsProps) {
  const [location, setLocation] = useState(initialLocation);
  const [data, setData] = useState<MarketsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <GECard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Prediction Markets"
          live={isLoading}
          onClose={onClose}
          maxHeight={700}
        >
          <div className="space-y-6">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city, country, or team (e.g., Paris, USA, Lakers)"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1d24]/50 border border-[#2a2f3a]/60 rounded-lg text-[#e5e7eb] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#60a5fa]/50 focus:border-[#60a5fa]"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!location.trim() || isLoading}
                className="px-6 py-3 bg-[#60a5fa] hover:bg-[#3b82f6] disabled:bg-[#2a2f3a] disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!data && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="p-4 bg-[#60a5fa]/10 rounded-full">
                  <TrendingUp className="w-12 h-12 text-[#60a5fa]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">
                    Explore Prediction Markets by Location
                  </h3>
                  <p className="text-[#9ca3af] max-w-md text-sm">
                    Enter a city, country, team, or region to discover active prediction markets.
                    We&apos;ll search for politics, sports, economics, and events related to that area.
                  </p>
                </div>
              </div>
            )}

            {/* Results */}
            {data && (
              <div className="space-y-6">
                {/* AI Summary */}
                {data.summary && (
                  <div className="p-4 bg-gradient-to-r from-[#60a5fa]/10 to-[#34d399]/10 border border-[#60a5fa]/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#60a5fa]/20 rounded-lg flex-shrink-0">
                        <BarChart3 className="w-4 h-4 text-[#60a5fa]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#60a5fa] mb-1">AI Analysis</h4>
                        <p className="text-sm text-[#e5e7eb] leading-relaxed">{data.summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Context */}
                {(data.country || data.region) && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[#6b7280]">Searching:</span>
                    {data.country && (
                      <span className="px-2 py-1 bg-[#1a1d24] border border-[#60a5fa]/30 rounded-full text-[#60a5fa]">
                        {data.country}
                      </span>
                    )}
                    {data.region && (
                      <span className="px-2 py-1 bg-[#1a1d24] border border-[#34d399]/30 rounded-full text-[#34d399]">
                        {data.region}
                      </span>
                    )}
                    {data.tagsFound !== undefined && data.tagsFound > 0 && (
                      <span className="text-[#6b7280]">
                        ({data.tagsFound} tags matched)
                      </span>
                    )}
                  </div>
                )}

                {/* Search Terms Used */}
                {data.searchTermsUsed && data.searchTermsUsed.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#6b7280]">Terms:</span>
                    {data.searchTermsUsed.map((term, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 text-xs bg-[#1a1d24] border border-[#2a2f3a]/60 rounded-full text-[#9ca3af]"
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}

                {/* Polymarket Citations */}
                {data.citations && data.citations.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[#6b7280]">Sources:</span>
                    {data.citations.slice(0, 3).map((url, idx) => (
                      <a 
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs bg-[#1a1d24] border border-[#2a2f3a]/60 rounded-full text-[#60a5fa] hover:text-[#93c5fd] hover:border-[#60a5fa]/40 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">
                          {url.replace('https://polymarket.com/event/', '')}
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Markets Grid */}
                {data.markets.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-[#e5e7eb]">
                        Active Markets ({data.markets.length})
                      </h3>
                      <span className="text-xs text-[#6b7280]">
                        {data.totalFound} total found
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.markets.map((market) => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#9ca3af]">
                      No active prediction markets found for &quot;{data.location}&quot;.
                    </p>
                    <p className="text-sm text-[#6b7280] mt-2">
                      Try a different location or broader search term.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-[#2a2f3a]/40">
                  <p className="text-xs text-[#6b7280] text-center">
                    Data powered by{' '}
                    <a 
                      href="https://polymarket.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#60a5fa] hover:underline"
                    >
                      Polymarket
                    </a>
                    {' '}• AI analysis by xAI Grok
                  </p>
                </div>
              </div>
            )}
          </div>
        </GECard>
      </div>
    </div>
  );
}
