'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface GlobeProps {
  apiKey: string;
}

// City marker locations (with pulsing dots)
const CITY_MARKERS = [
  // Original 5
  { name: 'London', lng: -0.1276, lat: 51.5074, intensity: 0.9 },
  { name: 'New York', lng: -74.006, lat: 40.7128, intensity: 1.0 },
  { name: 'Tokyo', lng: 139.6917, lat: 35.6895, intensity: 0.95 },
  { name: 'Lagos', lng: 3.3792, lat: 6.5244, intensity: 0.7 },
  { name: 'Sydney', lng: 151.2093, lat: -33.8688, intensity: 0.8 },
  // 5 new markers - capitals further away
  { name: 'Pau', lng: -0.3708, lat: 43.2951, intensity: 0.85 }, // France
  { name: 'Buenos Aires', lng: -58.3816, lat: -34.6037, intensity: 0.75 }, // Argentina
  { name: 'Cairo', lng: 31.2357, lat: 30.0444, intensity: 0.8 }, // Egypt
  { name: 'Moscow', lng: 37.6173, lat: 55.7558, intensity: 0.85 }, // Russia
  { name: 'Wellington', lng: 174.7762, lat: -41.2865, intensity: 0.7 }, // New Zealand
];

// Heatmap-only cities (more orange, no markers)
const HEATMAP_ONLY_CITIES = [
  { lng: -99.1332, lat: 19.4326, intensity: 0.95 }, // Mexico City
  { lng: 106.8456, lat: -6.2088, intensity: 0.9 }, // Jakarta
  { lng: 126.978, lat: 37.5665, intensity: 0.92 }, // Seoul
  { lng: 13.405, lat: 52.52, intensity: 0.88 }, // Berlin
  { lng: 72.8777, lat: 19.076, intensity: 0.9 }, // Mumbai
];

// Generate heatmap data with trending areas
const generateHeatmapData = () => {
  const features = [];

  // Add city centers with high intensity (for marker cities)
  CITY_MARKERS.forEach(city => {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      properties: { intensity: city.intensity }
    });

    // Add surrounding points for spread effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 2 + Math.random() * 3;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            city.lng + Math.cos(angle) * distance,
            city.lat + Math.sin(angle) * distance
          ]
        },
        properties: { intensity: city.intensity * (0.3 + Math.random() * 0.3) }
      });
    }
  });

  // Add heatmap-only cities (more orange - higher intensity)
  HEATMAP_ONLY_CITIES.forEach(spot => {
    // Higher intensity for more orange/red appearance
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [spot.lng, spot.lat] },
      properties: { intensity: spot.intensity }
    });

    // Add surrounding spread for these cities too
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 1.5 + Math.random() * 2;
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            spot.lng + Math.cos(angle) * distance,
            spot.lat + Math.sin(angle) * distance
          ]
        },
        properties: { intensity: spot.intensity * (0.5 + Math.random() * 0.3) }
      });
    }
  });

  return { type: 'FeatureCollection', features };
};


export default function Globe({ apiKey }: GlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      console.error('Mapbox API key is required');
      return;
    }

    if (map.current) return; // Initialize map only once

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

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Generate random satellite positions as GeoJSON with orbital distribution and altitude
    const generateSatelliteGeoJSON = (count: number) => {
      const features = [];
      for (let i = 0; i < count; i++) {
        const lat = Math.asin((Math.random() * 2 - 1) * 0.9) * (180 / Math.PI);
        const lng = (Math.random() * 360) - 180;

        // Altitude in meters (Starlink orbit - 340km to 550km)
        const altitude = 340000 + Math.random() * 210000;

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          properties: {
            id: `satellite-${i}`,
            altitude: altitude,
            rotation: Math.random() * 360,
          },
        });
      }
      return { type: 'FeatureCollection', features };
    };

    // Create pulsing marker elements
    const createPulsingMarker = (city: typeof CITY_MARKERS[0]) => {
      const el = document.createElement('div');
      el.className = 'pulse-marker';
      el.innerHTML = `
        <div class="pulse-dot"></div>
        <div class="pulse-ring"></div>
      `;
      el.title = city.name;
      el.style.cursor = 'pointer';

      // Click handler for fly-to animation
      el.addEventListener('click', () => {
        if (map.current) {
          map.current.flyTo({
            center: [city.lng, city.lat],
            zoom: 8,
            pitch: 45,
            duration: 2000,
            essential: true
          });
        }
      });

      return el;
    };

    map.current.on('style.load', () => {
      if (!map.current) return;

      // Add a 3D model source (using satellite GLB model)
      // @ts-ignore
      map.current.addModel('satellite-model', '/satellite.glb');

      // Setup atmospheric lighting for 3D models
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

      // Add satellite source
      const satelliteData = generateSatelliteGeoJSON(42);
      map.current.addSource('satellites', {
        type: 'geojson',
        data: satelliteData as any,
      });

      // Add model layer with proper altitude
      // @ts-ignore
      map.current.addLayer({
        id: 'satellites-model',
        type: 'model',
        source: 'satellites',
        layout: {
          'model-id': 'satellite-model',
        },
        paint: {
          'model-scale': [100000, 100000, 100000],
          'model-rotation': [0, 0, 0],
          'model-translation': [0, 0, ['get', 'altitude']],
          'model-opacity': 1,
          'model-type': 'common-3d',
          // @ts-ignore
          'model-color': '#ffffff',
        },
      });

      // Add heatmap source
      map.current.addSource('heatmap-data', {
        type: 'geojson',
        data: generateHeatmapData() as any,
      });

      // Add heatmap layer - visible at low zoom, fades at zoom 3+
      map.current.addLayer({
        id: 'trending-heatmap',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          // Increase weight based on intensity property
          'heatmap-weight': ['get', 'intensity'],
          // Increase intensity as zoom decreases
          'heatmap-intensity': [
            'interpolate', ['linear'], ['zoom'],
            0, 1,
            3, 0.5,
            5, 0
          ],
          // Color gradient from blue to red
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgba(0, 100, 255, 0.4)',
            0.4, 'rgba(0, 200, 255, 0.6)',
            0.6, 'rgba(255, 255, 0, 0.7)',
            0.8, 'rgba(255, 150, 0, 0.8)',
            1, 'rgba(255, 50, 50, 0.9)'
          ],
          // Radius increases with zoom
          'heatmap-radius': [
            'interpolate', ['linear'], ['zoom'],
            0, 30,
            3, 20,
            5, 10
          ],
          // Opacity fades out at zoom level 3+
          'heatmap-opacity': [
            'interpolate', ['linear'], ['zoom'],
            0, 0.7,
            2, 0.5,
            3, 0.2,
            4, 0
          ]
        }
      }, 'satellites-model'); // Place below satellites

      // Add pulsing markers for each city
      CITY_MARKERS.forEach(city => {
        const marker = new mapboxgl.Marker({
          element: createPulsingMarker(city),
          anchor: 'center'
        })
          .setLngLat([city.lng, city.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Set fog/atmosphere
      map.current.setFog({
        color: 'rgb(10, 10, 10)',
        'high-color': 'rgb(30, 30, 40)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(5, 5, 10)',
        'star-intensity': 0.6,
      });

      setIsLoading(false);
    });

    // Rotation disabled by default - user can still interact manually
    let userInteracting = false;
    const spinEnabled = false; // Disabled rotation

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

      // Remove markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      if (map.current) {
        // Remove layers and sources
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
      map.current?.remove();
      map.current = null;
    };
  }, [apiKey]);

  return (
    <div className="relative w-full h-screen">
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
}
