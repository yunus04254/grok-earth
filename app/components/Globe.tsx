'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import type { Hotspot, HotspotsResponse } from '@/app/lib/types';
import { MARKER_STYLES } from '@/app/lib/types';
import { TweetList } from '@/components/TweetList';

export interface GlobeRef {
  flyToHotspot: (hotspot: Hotspot) => void;
}

interface GlobeProps {
  apiKey: string;
  onHotspotSelect?: (hotspot: Hotspot) => void;
}

// Fallback data while API loads or fails
const FALLBACK_HOTSPOTS: HotspotsResponse = {
  redHotspots: [
    { name: 'New York', lat: 40.7128, lng: -74.006, volume: 100000, type: 'red' },
    { name: 'London', lat: 51.5074, lng: -0.1276, volume: 95000, type: 'red' },
    { name: 'Tokyo', lat: 35.6895, lng: 139.6917, volume: 90000, type: 'red' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, volume: 85000, type: 'red' },
    { name: 'Mumbai', lat: 19.076, lng: 72.8777, volume: 80000, type: 'red' },
  ],
  blueZones: [
    { name: 'Paris', lat: 48.8566, lng: 2.3522, volume: 0.8, type: 'blue' },
    { name: 'Seoul', lat: 37.5665, lng: 126.978, volume: 0.75, type: 'blue' },
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456, volume: 0.7, type: 'blue' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, volume: 0.65, type: 'blue' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, volume: 0.6, type: 'blue' },
    { name: 'Berlin', lat: 52.52, lng: 13.405, volume: 0.55, type: 'blue' },
    { name: 'Delhi', lat: 28.6139, lng: 77.209, volume: 0.5, type: 'blue' },
    { name: 'Lagos', lat: 6.5244, lng: 3.3792, volume: 0.45, type: 'blue' },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, volume: 0.42, type: 'blue' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, volume: 0.4, type: 'blue' },
  ],
  lastUpdated: new Date().toISOString(),
  source: 'fallback',
};

// GECard locations spread around the globe
const GECARD_LOCATIONS = [
  { name: 'New York', lat: 40.7128, lng: -74.006, region: 'New York' },
  { name: 'London', lat: 51.5074, lng: -0.1276, region: 'London' },
  { name: 'Tokyo', lat: 35.6895, lng: 139.6917, region: 'Tokyo' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Sydney' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'São Paulo' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, region: 'Mumbai' },
];

// Generate heatmap data from blue zones (emerging trends)
function generateHeatmapFeatures(blueZones: Hotspot[]) {
  const features: any[] = [];

  blueZones.forEach(zone => {
    // Normalize volume to 0-1 range for intensity
    const maxVolume = Math.max(...blueZones.map(z => z.volume));
    const intensity = zone.volume / maxVolume;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [zone.lng, zone.lat] },
      properties: { intensity }
    });

    // Add surrounding points for spread effect
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 2 + Math.random() * 3;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            zone.lng + Math.cos(angle) * distance,
            zone.lat + Math.sin(angle) * distance
          ]
        },
        properties: { intensity: intensity * (0.4 + Math.random() * 0.3) }
      });
    }
  });

  return { type: 'FeatureCollection', features };
}

const Globe = forwardRef<GlobeRef, GlobeProps>(({ apiKey, onHotspotSelect }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const geCardMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hotspots, setHotspots] = useState<HotspotsResponse>(FALLBACK_HOTSPOTS);

  // Expose flyTo capability to parent
  useImperativeHandle(ref, () => ({
    flyToHotspot: (hotspot: Hotspot) => {
      // 1. Notify parent (opens UI)
      if (onHotspotSelect) {
        onHotspotSelect(hotspot);
      }

      // 2. Fly to location
      if (map.current) {
        map.current.flyTo({
          center: [hotspot.lng, hotspot.lat],
          zoom: 8,
          pitch: 45,
          duration: 2000,
          essential: true
        });
      }
    }
  }));

  // Fetch hotspots from API
  useEffect(() => {
    async function fetchHotspots() {
      try {
        const response = await fetch('/api/trends');
        if (response.ok) {
          const data: HotspotsResponse = await response.json();
          setHotspots(data);
        }
      } catch (error) {
        console.warn('Failed to fetch hotspots, using fallback:', error);
      }
    }
    fetchHotspots();
  }, []);

  // Create consistent pulsing marker element (RED style)
  const createRedMarker = useCallback((hotspot: Hotspot) => {
    const el = document.createElement('div');
    el.className = 'pulse-marker';
    el.innerHTML = `
      <div class="pulse-dot" style="
        background: ${MARKER_STYLES.red.dotGradient};
        box-shadow: 0 0 8px ${MARKER_STYLES.red.glowColor};
      "></div>
      <div class="pulse-ring" style="
        border-color: ${MARKER_STYLES.red.ringColor};
      "></div>
    `;
    el.title = `${hotspot.name}${hotspot.topTrend ? ` - ${hotspot.topTrend}` : ''}`;
    el.style.cursor = 'pointer';

    el.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click events if any
      if (onHotspotSelect) {
        onHotspotSelect(hotspot);
      }

      if (map.current) {
        map.current.flyTo({
          center: [hotspot.lng, hotspot.lat],
          zoom: 8,
          pitch: 45,
          duration: 2000,
          essential: true
        });
      }
    });

    return el;
  }, [onHotspotSelect]);

  // Create tweet feed marker element
  const createGECardMarker = useCallback((location: typeof GECARD_LOCATIONS[0]) => {
    const el = document.createElement('div');
    el.style.width = '200px';
    el.style.pointerEvents = 'auto';
    el.style.fontSize = '0.75rem';
    el.style.transform = 'scale(0.9)';
    el.style.transformOrigin = 'bottom left';

    const root = createRoot(el);
    root.render(
      <TweetList
        region={location.region}
        maxTweets={1}
        autoRotate={true}
      />
    );

    return el;
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!apiKey) {
      console.error('Mapbox API key is required');
      return;
    }

    if (map.current) return;

    mapboxgl.accessToken = apiKey;

    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: { name: 'globe' },
      zoom: 1.5,
      center: [0, 20],
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    // Satellite generation
    const generateSatelliteGeoJSON = (count: number) => {
      const features = [];
      for (let i = 0; i < count; i++) {
        const lat = Math.asin((Math.random() * 2 - 1) * 0.9) * (180 / Math.PI);
        const lng = (Math.random() * 360) - 180;

        // Altitude in meters (Higher orbit - 800km to 1200km)
        // Positioned at higher altitude for better visibility
        const altitude = 800000 + Math.random() * 400000;

        features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { id: `satellite-${i}`, altitude, rotation: Math.random() * 360 },
        });
      }
      return { type: 'FeatureCollection', features };
    };

    map.current.on('style.load', () => {
      if (!map.current) return;

      // @ts-ignore
      map.current.addModel('satellite-model', '/satellite.glb');

      if (!map.current.getLayer('sky')) {
        map.current.addLayer({
          id: 'sky',
          type: 'sky',
          paint: {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 90.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      }

      const satelliteData = generateSatelliteGeoJSON(42);
      map.current.addSource('satellites', {
        type: 'geojson',
        data: satelliteData as any,
      });

      // @ts-ignore
      map.current.addLayer({
        id: 'satellites-model',
        type: 'model',
        source: 'satellites',
        layout: { 'model-id': 'satellite-model' },
        paint: {
          'model-scale': [20000, 20000, 20000], // Even smaller satellites
          'model-rotation': [0, 0, 0],
          'model-translation': [0, 0, ['get', 'altitude']],
          'model-opacity': 1,
          'model-type': 'common-3d',
          // @ts-ignore
          'model-color': '#ffffff',
        },
      });

      // Add empty heatmap source (will be populated by separate effect)
      map.current.addSource('heatmap-data', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
      });

      // Blue heatmap layer for emerging trends
      map.current.addLayer({
        id: 'trending-heatmap',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': ['get', 'intensity'],
          // Keep intensity visible at all zoom levels
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 1,
            3, 0.8,
            6, 0.6,
            10, 0.4
          ],
          // Blue gradient for emerging trends
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 100, 255, 0)',
            0.2, 'rgba(0, 150, 255, 0.4)',
            0.4, 'rgba(50, 200, 255, 0.6)',
            0.6, 'rgba(100, 220, 255, 0.7)',
            0.8, 'rgba(150, 240, 255, 0.8)',
            1, 'rgba(200, 255, 255, 0.9)'
          ],
          // Radius shrinks as you zoom in for precision
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 40,
            3, 30,
            6, 20,
            10, 15
          ],
          // Keep opacity visible at all zoom levels
          'heatmap-opacity': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.7,
            3, 0.6,
            6, 0.5,
            10, 0.4
          ]
        }
      }, 'satellites-model');

      // Add tweet feed markers around the globe
      GECARD_LOCATIONS.forEach(location => {
        const marker = new mapboxgl.Marker({
          element: createGECardMarker(location),
          anchor: 'bottom-left',
          offset: [10, -10]
        })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!);

        geCardMarkersRef.current.push(marker);
      });

      map.current.setFog({
        color: 'rgb(10, 10, 10)',
        'high-color': 'rgb(30, 30, 40)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(5, 5, 10)',
        'star-intensity': 0.6,
      });

      setIsLoading(false);
    });

    // Rotation disabled
    let userInteracting = false;
    const spinEnabled = false;

    const spinGlobe = () => {
      if (!map.current || userInteracting || !spinEnabled) return;
      const center = map.current.getCenter();
      center.lng -= 0.15;
      map.current.easeTo({ center, duration: 100, easing: (n) => n });
    };

    map.current.on('mousedown', () => { userInteracting = true; });
    map.current.on('mouseup', () => { userInteracting = false; });
    map.current.on('dragend', () => { userInteracting = false; });
    map.current.on('touchstart', () => { userInteracting = true; });
    map.current.on('touchend', () => { userInteracting = false; });

    const spinInterval = setInterval(spinGlobe, 100);

    return () => {
      clearInterval(spinInterval);
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      geCardMarkersRef.current.forEach(marker => marker.remove());
      geCardMarkersRef.current = [];

      if (map.current) {
        try {
          // Only attempt cleanup if the map style is loaded and valid
          const style = map.current.getStyle();
          if (style) {
            if (map.current.getLayer('trending-heatmap')) {
              map.current.removeLayer('trending-heatmap');
            }
            if (map.current.getSource('heatmap-data')) {
              map.current.removeSource('heatmap-data');
            }
            if (map.current.getLayer('satellites-model')) {
              map.current.removeLayer('satellites-model');
            }
            // @ts-ignore
            if (map.current.hasModel && map.current.hasModel('satellite-model')) {
              // @ts-ignore
              map.current.removeModel('satellite-model');
            }
            if (map.current.getSource('satellites')) {
              map.current.removeSource('satellites');
            }
          }
        } catch (e) {
          // Map may already be in an invalid state during cleanup, ignore errors
          console.warn('Map cleanup warning:', e);
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, [apiKey, createGECardMarker]);

  // Update markers and heatmap when hotspots change (separate effect)
  useEffect(() => {
    if (!map.current || isLoading) return;

    // Remove existing red markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add RED markers for high-volume hotspots
    hotspots.redHotspots.forEach(hotspot => {
      const marker = new mapboxgl.Marker({
        element: createRedMarker(hotspot),
        anchor: 'center'
      })
        .setLngLat([hotspot.lng, hotspot.lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Update heatmap data
    const source = map.current.getSource('heatmap-data') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(generateHeatmapFeatures(hotspots.blueZones) as any);
    }
  }, [hotspots, createRedMarker, isLoading]);

  return (
    <div className="relative w-full" style={{ height: '117.65vh' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 text-lg">Loading Earth...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
});

export default Globe;
