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
        
        // Altitude in meters (Starlink orbit - 340km to 550km)
        // Real Starlink satellites orbit at these altitudes
        const altitude = 340000 + Math.random() * 210000; 

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

      // Setup lighting for 3D models
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

      // Add a 3D model source (using Starlink satellite GLB model)
      // @ts-ignore - model API might not be fully typed
      if (map.current.addModel) {
        try {
          // @ts-ignore
          map.current.addModel(
            'satellite-model',
            '/starlink.glb'
          );
        } catch (error) {
          console.error('Error adding model:', error);
        }
      }
      
      // Add satellite source
      const satelliteData = generateSatelliteGeoJSON(42);
      map.current.addSource('satellites', {
        type: 'geojson',
        data: satelliteData as any,
      });

      // Add model layer
      // @ts-ignore - model layer type might not be fully typed
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
          // Use model-translation with [x, y, z] - z is altitude in meters
          // Using data-driven styling to get altitude from feature properties
          'model-translation': [
            0,
            0,
            ['get', 'altitude']
          ],
          'model-opacity': 1,
          'model-type': 'common-3d',
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

    // Handle map errors
    map.current.on('error', (e) => {
      console.warn('Map error:', e.error?.message || 'Unknown error');
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
        if (map.current.hasModel('satellite-model')) {
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
