"use client";

import { useState, useEffect } from "react";
import { GECard } from "@/components/GECard";
import { Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Helper function to get weather icon code from conditions (fallback)
function getWeatherIconCode(conditions: string | undefined): string {
  if (!conditions) return "01d";
  
  const lowerConditions = conditions.toLowerCase();
  
  // Map common weather conditions to OpenWeatherMap icon codes
  if (lowerConditions.includes("clear") || lowerConditions.includes("sunny")) {
    return "01d";
  } else if (lowerConditions.includes("few clouds") || lowerConditions.includes("partly cloudy")) {
    return "02d";
  } else if (lowerConditions.includes("scattered clouds")) {
    return "03d";
  } else if (lowerConditions.includes("cloudy") || lowerConditions.includes("overcast") || lowerConditions.includes("broken clouds")) {
    return "04d";
  } else if (lowerConditions.includes("shower") || lowerConditions.includes("drizzle")) {
    return "09d";
  } else if (lowerConditions.includes("rain") || lowerConditions.includes("rainy")) {
    return "10d";
  } else if (lowerConditions.includes("thunder") || lowerConditions.includes("storm")) {
    return "11d";
  } else if (lowerConditions.includes("snow") || lowerConditions.includes("snowy")) {
    return "13d";
  } else if (lowerConditions.includes("mist") || lowerConditions.includes("fog") || lowerConditions.includes("haze")) {
    return "50d";
  }
  
  // Default to clear sky
  return "01d";
}

// Hook to get real-time in a specific IANA timezone
function useRealTime(ianaTimezone: string | undefined) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    if (!ianaTimezone) return;

    const updateTime = () => {
      const now = new Date();
      
      // Format time in the specified timezone
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: ianaTimezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const hour = parts.find(p => p.type === 'hour')?.value;
      const minute = parts.find(p => p.type === 'minute')?.value;
      const second = parts.find(p => p.type === 'second')?.value;

      // Format as: DD/MM/YYYY, HH:MM:SS (matching the example format)
      const formatted = `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
      setFormattedTime(formatted);
      
      // Also store ISO string for reference
      setCurrentTime(now.toISOString());
    };

    // Update immediately
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [ianaTimezone]);

  return { formattedTime, currentTime };
}

export type OverviewCardData = {
  card_type?: "OVERVIEW";
  place?: {
    type: "city" | "country" | "continent" | "state" | "province" | "region" | "territory";
    name: string;
    display_name: string;
    country: {
      name: string | null;
      iso2: string | null;
    };
  };
  time?: {
    primary: {
      iana: string;
      local_time_iso: string;
    };
    alternates: Array<{
      label: string;
      iana: string;
      local_time_iso: string;
    }>;
  };
  population?: {
    value: number;
    metadata_year: string;
  };
  weather?: {
    conditions: string;
    temperature_c: number;
    icon?: string;
  } | null;
  leader?: {
    metadata_role: string;
    name: string;
    metadata_asof: string;
  } | null;
  summary?: {
    text: string;
    metadata_asof: string;
  };
};

interface OverviewCardProps {
  data: OverviewCardData | null;
  isLoading?: boolean;
  onClose?: () => void;
  onExpand?: () => void;
}

export default function OverviewCard({ data, isLoading = false, onClose, onExpand }: OverviewCardProps) {
  const iso2 = data?.place?.country?.iso2;
  const flagUrl = iso2 
    ? `https://flagsapi.com/${iso2}/shiny/64.png`
    : null;

  // Get real-time for the location's timezone
  const { formattedTime } = useRealTime(data?.time?.primary.iana);

  // Show loading state
  if (isLoading || !data) {
    return (
      <motion.div 
        className="fixed left-[800px] top-24 z-40 w-[340px] max-h-[calc(100vh-280px)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
      >
        <GECard
          icon={<Info className="h-6 w-6" />}
          title="Region Overview"
          onClose={onClose}
          onExpand={onExpand}
        >
          <div className="space-y-4">
            {/* Loading skeleton */}
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#60a5fa] animate-spin" />
              <p className="text-[#9ca3af] text-sm">
                Loading region overview...
              </p>
            </div>

            {/* Skeleton placeholders with shimmer effect */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Location</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-sm skeleton-shimmer relative overflow-hidden" />
                  <div className="flex-1">
                    <div className="h-4 rounded w-3/4 mb-2 skeleton-shimmer relative overflow-hidden" />
                    <div className="h-3 rounded w-1/2 skeleton-shimmer relative overflow-hidden" />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Local Time</p>
                <div className="h-4 rounded w-2/3 skeleton-shimmer relative overflow-hidden" />
              </div>

              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Population</p>
                <div className="h-4 rounded w-1/2 skeleton-shimmer relative overflow-hidden" />
              </div>

              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Weather</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded skeleton-shimmer relative overflow-hidden" />
                  <div className="h-4 rounded w-24 skeleton-shimmer relative overflow-hidden" />
                </div>
              </div>

              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Leader</p>
                <div className="h-4 rounded w-3/4 mb-2 skeleton-shimmer relative overflow-hidden" />
                <div className="h-3 rounded w-1/2 skeleton-shimmer relative overflow-hidden" />
              </div>

              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Summary</p>
                <div className="space-y-2">
                  <div className="h-3 rounded w-full skeleton-shimmer relative overflow-hidden" />
                  <div className="h-3 rounded w-full skeleton-shimmer relative overflow-hidden" />
                  <div className="h-3 rounded w-5/6 skeleton-shimmer relative overflow-hidden" />
                </div>
              </div>
            </div>
          </div>
        </GECard>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="fixed left-[800px] top-24 z-40 w-[340px] max-h-[calc(100vh-280px)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: 0.1 }}
    >
      <GECard
        icon={<Info className="h-6 w-6" />}
        title="Region Overview"
        onClose={onClose}
        onExpand={onExpand}
      >
      <div className="space-y-4">
        {/* Location with Flag */}
        <div>
          <p className="text-sm text-[#9ca3af] mb-1.5">Location</p>
          <div className="flex items-center gap-3">
            {flagUrl && (
              <img 
                src={flagUrl} 
                alt={`Flag of ${data.place?.country?.name || data.place?.name}`}
                className="w-8 h-8 rounded-sm object-cover shadow-sm"
              />
            )}
            <div className="flex-1">
              <p className="text-base text-[#e5e7eb] font-medium">
                {data.place?.display_name || data.place?.name}
              </p>
              <p className="text-sm text-[#9ca3af] mt-0.5">
                {data.place?.type ? data.place.type.charAt(0).toUpperCase() + data.place.type.slice(1) : 'Location'} • {data.place?.country?.name || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Local Time - Real-time */}
        {data.time && (
          <div>
            <p className="text-sm text-[#9ca3af] mb-1.5">Local Time</p>
            <p className="text-base text-[#e5e7eb]">
              {formattedTime || 'Loading...'}
            </p>
            <p className="text-sm text-[#9ca3af] mt-1">
              {data.time.primary.iana}
            </p>
          </div>
        )}

        {/* Population */}
        {data.population && (
          <div>
            <p className="text-sm text-[#9ca3af] mb-1.5">Population</p>
            <p className="text-base text-[#e5e7eb]">
              {data.population.value.toLocaleString()}
            </p>
            <p className="text-sm text-[#9ca3af] mt-1">
              Data from {data.population.metadata_year}
            </p>
          </div>
        )}

        {/* Weather - Only show for cities, states, provinces, regions, territories, and countries, not continents */}
        {data.weather && data.place?.type !== 'continent' && (
          <div>
            <p className="text-sm text-[#9ca3af] mb-1.5">Weather</p>
            <div className="flex items-center gap-2">
              {(data.weather.icon || data.weather.conditions) && (
                <img 
                  src={`https://openweathermap.org/img/wn/${data.weather.icon || getWeatherIconCode(data.weather.conditions)}@2x.png`}
                  alt={data.weather.conditions}
                  className="w-6 h-6 flex-shrink-0"
                />
              )}
              <p className="text-base text-[#e5e7eb]">
                {data.weather.conditions} • {data.weather.temperature_c}°C
              </p>
            </div>
          </div>
        )}

        {/* Leader - Show for cities, states, provinces, regions, territories, and countries, not continents */}
        {data.leader && data.place?.type !== 'continent' && (
          <div>
            <p className="text-sm text-[#9ca3af] mb-1.5">Leader</p>
            <p className="text-base text-[#e5e7eb]">
              {data.leader.name}
            </p>
            <p className="text-sm text-[#9ca3af] mt-1">
              {data.leader.metadata_role.replace(/_/g, ' ')} • Since {data.leader.metadata_asof}
            </p>
          </div>
        )}

        {/* Summary */}
        {data.summary && (
          <div>
            <p className="text-sm text-[#9ca3af] mb-1.5">Summary</p>
            <p className="text-base text-[#e5e7eb] leading-relaxed">
              {data.summary.text}
            </p>
          </div>
        )}
      </div>
    </GECard>
    </motion.div>
  );
}
