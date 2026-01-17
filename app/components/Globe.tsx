'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface GlobeProps {
  apiKey: string;
}

export default function Globe({ apiKey }: GlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
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
        
        // Altitude in meters (Higher orbit - 800km to 1200km)
        // Positioned at higher altitude for better visibility
        const altitude = 800000 + Math.random() * 400000; 

        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat], // Just lng/lat, altitude will be via model-translation
          },
          properties: {
            id: `satellite-${i}`,
            altitude: altitude, // Store altitude as property for data-driven styling
            rotation: Math.random() * 360,
          },
        });
      }
      return {
        type: 'FeatureCollection',
        features,
      };
    };

    map.current.on('style.load', () => {
      if (!map.current) return;

      // Add a 3D model source (using satellite GLB model)
      // @ts-ignore
      map.current.addModel(
        'satellite-model',
        '/satellite.glb'
      );
      
      // Check if model loads
      map.current.on('error', (e) => {
        // @ts-ignore
        if (e.sourceId === 'satellite-model' || e.error?.message?.includes('model')) {
             console.error('Model load error:', e);
        }
      });

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
          'model-scale': [20000, 20000, 20000], // Even smaller satellites
          'model-rotation': [0, 0, 0],
          // Use model-translation with [x, y, z] - z is altitude in meters
          // Using data-driven styling to get altitude from feature properties
          'model-translation': [
            0,
            0,
            ['get', 'altitude']
          ],
          'model-opacity': 1,
          'model-type': 'common-3d',
          // @ts-ignore
          'model-color': '#ffffff',
        },
      });

      // We still use the fog setting
      map.current.setFog({
        color: 'rgb(10, 10, 10)',
        'high-color': 'rgb(30, 30, 40)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(5, 5, 10)',
        'star-intensity': 0.6,
      });

      setIsLoading(false);
    });

    // Auto-rotate the globe
    let userInteracting = false;
    let spinEnabled = true;

    const spinGlobe = () => {
      if (!map.current || userInteracting || !spinEnabled) return;
      const center = map.current.getCenter();
      center.lng -= 0.15;
      map.current.easeTo({ center, duration: 100, easing: (n) => n });
    };

    map.current.on('mousedown', () => {
      userInteracting = true;
    });

    map.current.on('mouseup', () => {
      userInteracting = false;
    });

    map.current.on('dragend', () => {
      userInteracting = false;
    });

    map.current.on('touchstart', () => {
      userInteracting = true;
    });

    map.current.on('touchend', () => {
      userInteracting = false;
    });

    // Spin the globe
    const spinInterval = setInterval(spinGlobe, 100);

    return () => {
      clearInterval(spinInterval);
      if (map.current) {
        // Remove satellite layers and source
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
