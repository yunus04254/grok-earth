'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Globe, { GlobeRef } from './components/Globe';
import SidePanel from './components/SidePanel';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
  const [showGrokipedia, setShowGrokipedia] = useState(false);
  const [showGrokRadio, setShowGrokRadio] = useState(false);
  const [showPredictionMarkets, setShowPredictionMarkets] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const globeRef = useRef<GlobeRef>(null);

  // Example of using the reusable flyTo function:
  // const handleSearch = (location: string) => {
  //   // logic to find hotspot...
  //   if (foundHotspot && globeRef.current) {
  //     globeRef.current.flyToHotspot(foundHotspot);
  //   }
  // }

  return (
    <main className="w-full h-screen relative">
      <Globe
        ref={globeRef}
        apiKey={apiKey}
        onHotspotSelect={setSelectedHotspot}
      />
      <SidePanel
        onGrokipediaClick={() => setShowGrokipedia(true)}
        onGrokRadioClick={() => setShowGrokRadio(true)}
        onPredictionMarketsClick={() => setShowPredictionMarkets(true)}
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

      {showGrokipedia && (
        <Grokipedia onClose={() => setShowGrokipedia(false)} />
      )}

      {showGrokRadio && (
        <GrokRadio onClose={() => setShowGrokRadio(false)} />
      )}

      {showPredictionMarkets && (
        <PredictionMarkets onClose={() => setShowPredictionMarkets(false)} />
      )}

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
