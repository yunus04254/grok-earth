import { NextResponse } from 'next/server';
import { WOEID_LOCATIONS, getLocationByWoeid } from '@/app/lib/woeid-mapping';

// Configuration
const K_RED_HOTSPOTS = 15;  // Top K locations for red markers
const M_BLUE_ZONES = 15;   // Next M locations for blue heatmap
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// In-memory cache
let cachedData: {
    timestamp: number;
    data: HotspotsResponse | null;
} = { timestamp: 0, data: null };

export interface Hotspot {
    name: string;
    lat: number;
    lng: number;
    volume: number;
    type: 'red' | 'blue';
    topTrend?: string;
}

export interface HotspotsResponse {
    redHotspots: Hotspot[];
    blueZones: Hotspot[];
    lastUpdated: string;
    source: 'api' | 'cache' | 'fallback';
}

// Fallback data when API fails
const FALLBACK_DATA: HotspotsResponse = {
    redHotspots: [
        { name: 'New York', lat: 40.7128, lng: -74.006, volume: 100000, type: 'red' },
        { name: 'London', lat: 51.5074, lng: -0.1276, volume: 95000, type: 'red' },
        { name: 'Tokyo', lat: 35.6895, lng: 139.6917, volume: 90000, type: 'red' },
        { name: 'São Paulo', lat: -23.5505, lng: -46.6333, volume: 85000, type: 'red' },
        { name: 'Mumbai', lat: 19.076, lng: 72.8777, volume: 80000, type: 'red' },
    ],
    blueZones: [
        { name: 'Paris', lat: 48.8566, lng: 2.3522, volume: 75000, type: 'blue' },
        { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, volume: 70000, type: 'blue' },
        { name: 'Seoul', lat: 37.5665, lng: 126.978, volume: 68000, type: 'blue' },
        { name: 'Jakarta', lat: -6.2088, lng: 106.8456, volume: 65000, type: 'blue' },
        { name: 'Mexico City', lat: 19.4326, lng: -99.1332, volume: 62000, type: 'blue' },
        { name: 'Cairo', lat: 30.0444, lng: 31.2357, volume: 60000, type: 'blue' },
        { name: 'Berlin', lat: 52.52, lng: 13.405, volume: 58000, type: 'blue' },
        { name: 'Delhi', lat: 28.6139, lng: 77.209, volume: 55000, type: 'blue' },
        { name: 'Sydney', lat: -33.8688, lng: 151.2093, volume: 52000, type: 'blue' },
        { name: 'Lagos', lat: 6.5244, lng: 3.3792, volume: 50000, type: 'blue' },
        { name: 'Toronto', lat: 43.6532, lng: -79.3832, volume: 48000, type: 'blue' },
        { name: 'Moscow', lat: 55.7558, lng: 37.6173, volume: 45000, type: 'blue' },
        { name: 'Singapore', lat: 1.3521, lng: 103.8198, volume: 42000, type: 'blue' },
        { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, volume: 40000, type: 'blue' },
        { name: 'Dubai', lat: 25.2048, lng: 55.2708, volume: 38000, type: 'blue' },
    ],
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
};

// X API v2 trend format (from screenshot)
interface XTrendV2 {
    trend_name: string;
    tweet_count?: number;
}

interface XTrendsResponseV2 {
    data: XTrendV2[];
}

async function fetchTrendsForLocation(woeid: number, apiKey: string): Promise<{
    woeid: number;
    totalVolume: number;
    velocityScore: number;
    topTrend: string;
    emergingTrend: string;
} | null> {
    try {
        // X API v2 trends endpoint with max_trends param
        const response = await fetch(
            `https://api.x.com/2/trends/by/woeid/${woeid}?max_trends=20`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        const result: XTrendsResponseV2 = await response.json();

        if (!result || !result.data || result.data.length === 0) {
            return null;
        }

        const trends = result.data;
        let totalVolume = 0;
        let velocityScore = 0;
        let topTrend = trends[0]?.trend_name || '';
        let emergingTrend = '';

        // Calculate total volume from tweet_count
        for (const trend of trends) {
            if (trend.tweet_count) {
                totalVolume += trend.tweet_count;
            }
        }

        // Calculate velocity score:
        // Trends at top with LOW/NO volume = emerging (high velocity)
        let emergingCount = 0;
        for (let i = 0; i < Math.min(trends.length, 10); i++) {
            const trend = trends[i];
            const positionWeight = (10 - i) / 10;

            if (!trend.tweet_count || trend.tweet_count < 10000) {
                velocityScore += positionWeight * 100;
                emergingCount++;
                if (!emergingTrend) emergingTrend = trend.trend_name;
            } else {
                velocityScore += positionWeight * 10;
            }
        }


        velocityScore *= (1 + emergingCount * 0.1);

        if (totalVolume === 0) {
            totalVolume = trends.length * 1000;
        }

        return { woeid, totalVolume, velocityScore, topTrend, emergingTrend: emergingTrend || topTrend };
    } catch (error) {
        console.error(`Error fetching trends for WOEID ${woeid}:`, error);
        return null;
    }
}

async function fetchAllHotspots(apiKey: string): Promise<HotspotsResponse> {
    const batchSize = 10;
    const results: { woeid: number; totalVolume: number; velocityScore: number; topTrend: string; emergingTrend: string }[] = [];

    for (let i = 0; i < WOEID_LOCATIONS.length; i += batchSize) {
        const batch = WOEID_LOCATIONS.slice(i, i + batchSize);
        const batchPromises = batch.map(loc => fetchTrendsForLocation(loc.woeid, apiKey));
        const batchResults = await Promise.all(batchPromises);

        for (const result of batchResults) {
            if (result) {
                results.push(result);
            }
        }

        if (i + batchSize < WOEID_LOCATIONS.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    if (results.length === 0) {
        console.warn('No trends data received, using fallback');
        return FALLBACK_DATA;
    }

    // RED: Sort by VOLUME (highest activity) - these take priority
    const byVolume = [...results].sort((a, b) => b.totalVolume - a.totalVolume);
    const redHotspots = byVolume.slice(0, K_RED_HOTSPOTS)
        .map(result => {
            const location = getLocationByWoeid(result.woeid);
            if (!location) return null;
            return {
                name: location.name,
                lat: location.lat,
                lng: location.lng,
                volume: result.totalVolume,
                type: 'red' as const,
                topTrend: result.topTrend,
            };
        })
        .filter(Boolean) as Hotspot[];

    // Get the WOEIDs of red hotspots to exclude from blue
    const redWoeids = new Set(byVolume.slice(0, K_RED_HOTSPOTS).map(r => r.woeid));

    // BLUE: Sort by VELOCITY (emerging trends) - exclude cities already in red
    const byVelocity = [...results]
        .filter(r => !redWoeids.has(r.woeid)) // Exclude red hotspots
        .sort((a, b) => b.velocityScore - a.velocityScore);

    const blueZones = byVelocity.slice(0, M_BLUE_ZONES)
        .map(result => {
            const location = getLocationByWoeid(result.woeid);
            if (!location) return null;
            return {
                name: location.name,
                lat: location.lat,
                lng: location.lng,
                volume: result.velocityScore,
                type: 'blue' as const,
                topTrend: result.emergingTrend,
            };
        })
        .filter(Boolean) as Hotspot[];

    return {
        redHotspots,
        blueZones,
        lastUpdated: new Date().toISOString(),
        source: 'api',
    };
}

export async function GET() {
    try {
        // Check cache first
        const now = Date.now();
        if (cachedData.data && (now - cachedData.timestamp) < CACHE_TTL_MS) {
            return NextResponse.json({
                ...cachedData.data,
                source: 'cache',
            });
        }

        // Get API key from environment
        const apiKey = process.env.X_API_KEY;

        if (!apiKey) {
            return NextResponse.json(FALLBACK_DATA);
        }

        // Fetch fresh data
        const data = await fetchAllHotspots(apiKey);

        // Update cache
        cachedData = {
            timestamp: now,
            data,
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error('Trends API error:', error);
        return NextResponse.json(FALLBACK_DATA);
    }
}
