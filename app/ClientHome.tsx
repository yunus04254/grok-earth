'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Globe, { GlobeRef } from './components/Globe';
import SidePanel from './components/SidePanel';
import { AnimatePresence } from 'framer-motion';
import MarkerKey from './components/MarkerKey';
import CityTrendsCard from './components/CityTrendsCard';
import Grokipedia from './components/Grokipedia';
import GrokRadio from './components/GrokRadio';
import PredictionMarkets from './components/PredictionMarkets';
import GrokEarthLogo from './assets/GrokEarth.png';
import { GEInput } from '@/components/GEInput';
import { Hotspot } from '@/app/lib/types';

interface ClientHomeProps {
  apiKey: string;
}

export default function ClientHome({ apiKey }: ClientHomeProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  
  // Panel visibility states
  const [showGrokipedia, setShowGrokipedia] = useState(true);
  const [showGrokRadio, setShowGrokRadio] = useState(true);
  const [showPredictionMarkets, setShowPredictionMarkets] = useState(true);
  
  const globeRef = useRef<GlobeRef>(null);

  // Handle hotspot selection - opens all panels for the city
  const handleHotspotSelect = (hotspot: Hotspot | null) => {
    setSelectedHotspot(hotspot);
    if (hotspot) {
      setSelectedCity(hotspot.name);
      // Reset all panels to visible when selecting a new city
      setShowGrokipedia(true);
      setShowGrokRadio(true);
      setShowPredictionMarkets(true);
    }
  };

  // Close all panels and deselect city
  const handleCloseAll = () => {
    setSelectedHotspot(null);
    setSelectedCity(null);
    setShowGrokipedia(true);
    setShowGrokRadio(true);
    setShowPredictionMarkets(true);
  };

  return (
    <main className="w-full h-screen relative">
      <Globe
        ref={globeRef}
        apiKey={apiKey}
        onHotspotSelect={handleHotspotSelect}
      />
      <SidePanel
        hasCity={!!selectedCity}
        showGrokipedia={showGrokipedia}
        showGrokRadio={showGrokRadio}
        showPredictionMarkets={showPredictionMarkets}
        onToggleGrokipedia={() => setShowGrokipedia(!showGrokipedia)}
        onToggleGrokRadio={() => setShowGrokRadio(!showGrokRadio)}
        onTogglePredictionMarkets={() => setShowPredictionMarkets(!showPredictionMarkets)}
      />
      <MarkerKey />

      {/* City Trends Card */}
      <AnimatePresence>
        {selectedHotspot && (
          <CityTrendsCard
            hotspot={selectedHotspot}
            onClose={() => setSelectedHotspot(null)}
            key="city-trends-card"
          />
        )}
      </AnimatePresence>

      {/* Grokipedia - opens when a marker is clicked */}
      <AnimatePresence>
        {selectedCity && showGrokipedia && (
          <Grokipedia 
            key={`grokipedia-${selectedCity}`}
            city={selectedCity} 
            onClose={() => setShowGrokipedia(false)} 
          />
        )}
      </AnimatePresence>

      {/* Grok Radio - opens when a marker is clicked */}
      <AnimatePresence>
        {selectedCity && showGrokRadio && (
          <GrokRadio 
            key={`radio-${selectedCity}`}
            city={selectedCity}
            onClose={() => setShowGrokRadio(false)} 
          />
        )}
      </AnimatePresence>

      {/* Prediction Markets - opens when a marker is clicked */}
      <AnimatePresence>
        {selectedCity && showPredictionMarkets && (
          <PredictionMarkets 
            key={`markets-${selectedCity}`}
            city={selectedCity}
            onClose={() => setShowPredictionMarkets(false)} 
          />
        )}
      </AnimatePresence>

      {/* Logo in top left */}
      <div className="fixed top-6 left-6 z-20">
        <Image
          src={GrokEarthLogo}
          alt="Grok Earth"
          width={180}
          height={60}
          priority
          className="h-auto"
        />
      </div>

      {/* Floating input at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
        <div className="relative group">
          <GEInput
            autoType={true}
            typingTexts={[
              "What's happening in Venezuela?",
              "Show me the latest in the Middle East",
              "What happened today in the world?",
              "Tell me about current events in Asia",
            ]}
            placeholder="Ask anything about what's happening in the world..."
            className="w-full group-hover:scale-[1.02] group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_0_0_rgba(255,255,255,0.15),0_12px_48px_rgba(0,0,0,0.6),0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out"
          />
        </div>
      </div>
    </main>
  );
}
