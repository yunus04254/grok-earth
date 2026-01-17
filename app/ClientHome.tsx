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
import { Globe as GlobeIcon } from 'lucide-react';

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

  // Reset to globe view
  const handleResetView = () => {
    handleCloseAll();
    globeRef.current?.resetView();
  };

  return (
    <main className="w-full relative" style={{ height: '117.65vh' }}>
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

      {/* Globe Reset Button - Bottom Left */}
      <button
        onClick={handleResetView}
        className="fixed bottom-8 left-6 z-30 group"
        aria-label="Reset to globe view"
      >
        <div className="relative">
          {/* Button container with glass effect */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1d24]/95 via-[#1f2532]/95 to-[#1a1f2e]/95 backdrop-blur-xl border border-[#2a2f3a]/60 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#60a5fa]/60 group-hover:shadow-[0_8px_32px_rgba(96,165,250,0.3),0_2px_8px_rgba(0,0,0,0.2)] active:scale-95">
            <GlobeIcon className="w-6 h-6 text-[#9ca3af] group-hover:text-[#60a5fa] transition-colors duration-300" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <div className="px-3 py-2 rounded-lg bg-[#1a1d24]/95 border border-[#2a2f3a]/60 backdrop-blur-xl shadow-lg">
              <span className="text-sm font-medium text-white">Reset View</span>
            </div>
          </div>
        </div>
      </button>

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
