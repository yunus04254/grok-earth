// Shared types for hotspot markers and heatmap zones
// Ensures consistent styling across the application

export interface GlobeMarker {
    name: string;
    lat: number;
    lng: number;
    volume: number;       // Tweet volume for red, velocity score for blue
    topTrend?: string;    // Top trending topic at this location
}

export interface RedHotspot extends GlobeMarker {
    type: 'red';
    // Red = High activity (aggregate tweet volumes)
    // Displayed as: pulsing red dot marker with fly-to on click
}

export interface BlueZone extends GlobeMarker {
    type: 'blue';
    // Blue = Emerging/upcoming trends (high velocity, may have lower volume)
    // Displayed as: blue heatmap zone
    emergingTrend?: string; // The specific emerging trend
}

export type Hotspot = RedHotspot | BlueZone;

export interface HotspotsResponse {
    redHotspots: RedHotspot[];   // Top K by volume
    blueZones: BlueZone[];       // Top M by velocity (can overlap with red)
    lastUpdated: string;
    source: 'api' | 'cache' | 'fallback';
}

// Styling constants for consistent appearance
export const MARKER_STYLES = {
    red: {
        dotColor: '#ef4444',
        dotGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        ringColor: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.6)',
        size: 12,
    },
    blue: {
        // Heatmap gradient colors (low to high intensity)
        gradientStops: [
            { density: 0, color: 'rgba(0, 100, 255, 0)' },
            { density: 0.2, color: 'rgba(0, 150, 255, 0.4)' },
            { density: 0.4, color: 'rgba(50, 200, 255, 0.6)' },
            { density: 0.6, color: 'rgba(100, 220, 255, 0.7)' },
            { density: 0.8, color: 'rgba(150, 240, 255, 0.8)' },
            { density: 1, color: 'rgba(200, 255, 255, 0.9)' },
        ],
        radius: { min: 20, max: 40 },
        opacity: { visible: 0.7, fadeStart: 2, fadeEnd: 4 },
    },
} as const;
