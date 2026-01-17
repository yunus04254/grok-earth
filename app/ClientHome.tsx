'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Globe, { GlobeRef } from './components/Globe';
import SidePanel from './components/SidePanel';
import { AnimatePresence, motion } from 'framer-motion';
import MarkerKey from './components/MarkerKey';
import CityTrendsCard from './components/CityTrendsCard';
import Grokipedia from './components/Grokipedia';
import GrokRadio from './components/GrokRadio';
import PredictionMarkets from './components/PredictionMarkets';
import GrokImagine from './components/GrokImagine';
import OverviewCard, { OverviewCardData } from './components/OverviewCard';
import LiveTweetFeed from './components/LiveTweetFeed';
import GrokEarthLogo from './assets/GrokEarth.png';
import { GEInput } from '@/components/GEInput';
import { Hotspot } from '@/app/lib/types';
import { Globe as GlobeIcon } from 'lucide-react';
import { StarlinkSatellite } from '@/app/hooks/useStarlink';
import StarlinkCard from './components/StarlinkCard';

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
  const [showGrokImagine, setShowGrokImagine] = useState(true);
  const [showOverviewCard, setShowOverviewCard] = useState(true);
  const [showLiveTweetFeed, setShowLiveTweetFeed] = useState(true);

  // Starlink State
  const [showStarlink, setShowStarlink] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState<StarlinkSatellite | null>(null);

  // OverviewCard state
  const [overviewCardData, setOverviewCardData] = useState<OverviewCardData | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const globeRef = useRef<GlobeRef>(null);

  // Fetch overview card data for a location
  const fetchOverviewCard = async (locationName: string) => {
    if (!locationName.trim()) return;

    setIsLoadingOverview(true);
    try {
      const response = await fetch('/api/overview-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: locationName }),
      });

      const data = await response.json();

      if (!data.error) {
        setOverviewCardData(data as OverviewCardData);
        setShowOverviewCard(true);
      }
    } catch (error) {
      console.error('Error fetching overview card:', error);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // Handle hotspot selection - opens all panels for the city
  const handleHotspotSelect = (hotspot: Hotspot | null) => {
    setSelectedHotspot(hotspot);
    if (hotspot) {
      setSelectedCity(hotspot.name);
      // Reset all panels to visible when selecting a new city
      setShowGrokipedia(true);
      setShowGrokRadio(true);
      setShowPredictionMarkets(true);
      setShowGrokImagine(true);
      setShowOverviewCard(true);
      setShowLiveTweetFeed(true);
      // Fetch overview card data for the selected hotspot
      fetchOverviewCard(hotspot.name);
    }
  };

  // Close all panels and deselect city
  const handleCloseAll = () => {
    setSelectedHotspot(null);
    setSelectedCity(null);
    setShowGrokipedia(true);
    setShowGrokRadio(true);
    setShowPredictionMarkets(true);
    setShowGrokImagine(true);
    setShowOverviewCard(true);
    setShowLiveTweetFeed(true);
    setOverviewCardData(null);
  };

  // Reset to globe view
  const handleResetView = () => {
    handleCloseAll();
    setInputValue('');
    globeRef.current?.resetView();
  };

  // Geocode location name to coordinates using Mapbox
  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${apiKey}&limit=1`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Handle input submission
  const handleInputSubmit = async (query: string) => {
    if (!query.trim()) return;

    setIsLoadingOverview(true);
    setShowOverviewCard(false);
    setOverviewCardData(null);

    try {
      // Call overview-card API
      const response = await fetch('/api/overview-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      // Check for errors
      if (data.error) {
        console.error('Overview card error:', data.message);
        setIsLoadingOverview(false);
        return;
      }

      // Set the overview card data
      setOverviewCardData(data as OverviewCardData);

      // Extract location name for the cards (use display_name or name)
      const locationName = data.place?.display_name || data.place?.name || query;

      // Set selectedCity to trigger all the other cards (Grokipedia, GrokRadio, PredictionMarkets)
      // This mimics the behavior of clicking a hotspot
      setSelectedCity(locationName);
      setShowGrokipedia(true);
      setShowGrokRadio(true);
      setShowPredictionMarkets(true);
      setShowGrokImagine(true);
      setShowLiveTweetFeed(true);

      // Geocode the location to get coordinates
      const coordinates = await geocodeLocation(locationName);

      if (coordinates) {
        // Fly to the location
        globeRef.current?.flyToCoordinates(coordinates.lat, coordinates.lng, 8);
      }

      // Show the overview card
      setShowOverviewCard(true);

      // Clear the input after successful submission
      setInputValue('');
    } catch (error) {
      console.error('Error fetching overview card:', error);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  return (
    <main className="w-full relative" style={{ height: '117.65vh' }}>
      <Globe
        ref={globeRef}
        apiKey={apiKey}
        onHotspotSelect={handleHotspotSelect}
        showStarlink={showStarlink}
        onStarlinkSelect={setSelectedSatellite}
      />
      <SidePanel
        hasCity={!!selectedCity}
        showGrokipedia={showGrokipedia}
        showGrokRadio={showGrokRadio}
        showPredictionMarkets={showPredictionMarkets}
        showGrokImagine={showGrokImagine}
        showStarlink={showStarlink}
        showLiveTweetFeed={showLiveTweetFeed}
        onToggleGrokipedia={() => setShowGrokipedia(!showGrokipedia)}
        onToggleGrokRadio={() => setShowGrokRadio(!showGrokRadio)}
        onTogglePredictionMarkets={() => setShowPredictionMarkets(!showPredictionMarkets)}
        onToggleGrokImagine={() => setShowGrokImagine(!showGrokImagine)}
        onToggleStarlink={() => setShowStarlink(!showStarlink)}
        onToggleLiveTweetFeed={() => setShowLiveTweetFeed(!showLiveTweetFeed)}
      />
      <MarkerKey />

      {/* Starlink Card */}
      <AnimatePresence>
        {selectedSatellite && (
          <StarlinkCard
            satellite={selectedSatellite}
            onClose={() => setSelectedSatellite(null)}
          />
        )}
      </AnimatePresence>

      {/* City Trends Card - Hidden */}
      {/* <AnimatePresence>
        {selectedHotspot && (
          <CityTrendsCard
            hotspot={selectedHotspot}
            onClose={() => setSelectedHotspot(null)}
            key="city-trends-card"
          />
        )}
      </AnimatePresence> */}

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

      {/* Grok Imagine - opens when a marker is clicked */}
      <AnimatePresence>
        {selectedCity && showGrokImagine && (
          <GrokImagine
            key={`imagine-${selectedCity}`}
            city={selectedCity}
            onClose={() => setShowGrokImagine(false)}
          />
        )}
      </AnimatePresence>

      {/* Overview Card - opens when input is submitted or hotspot is selected */}
      <AnimatePresence>
        {selectedCity && showOverviewCard && (
          <OverviewCard
            key={`overview-${overviewCardData?.place?.name || selectedCity}`}
            data={overviewCardData}
            isLoading={isLoadingOverview}
            onClose={() => {
              setShowOverviewCard(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Live Tweet Feed - opens when a city is selected */}
      <AnimatePresence>
        {selectedCity && showLiveTweetFeed && (
          <LiveTweetFeed
            key={`tweets-${selectedCity}`}
            city={selectedCity}
            onClose={() => setShowLiveTweetFeed(false)}
          />
        )}
      </AnimatePresence>

      {/* Logo in top left */}
      <div className="fixed top-6 left-6 z-20 flex items-center gap-4">
        <Image
          src={GrokEarthLogo}
          alt="Grok Earth"
          width={180}
          height={60}
          priority
          className="h-auto"
        />
        {/* Live indicator */}
        <div className="flex items-center gap-3">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
          <span className="text-lg font-bold text-red-500 tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Globe Reset Button - Bottom Left */}
      <button
        onClick={handleResetView}
        className="fixed bottom-8 left-6 z-30 group"
        aria-label="Reset to globe view"
      >
        <div className="relative">
          {/* Button container with glass effect */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a1d24]/40 via-[#1f2532]/35 to-[#1a1f2e]/40 backdrop-blur-xl backdrop-saturate-150 border-2 border-[#2a2f3a]/40 shadow-[0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:border-[#60a5fa]/60 group-hover:shadow-[0_8px_32px_rgba(96,165,250,0.3),0_2px_8px_rgba(0,0,0,0.2)] active:scale-95">
            <GlobeIcon className="w-6 h-6 text-[#e7e9ea] group-hover:text-white transition-colors duration-300" />
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
            onEnter={handleInputSubmit}
            loading={isLoadingOverview}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </div>
    </main>
  );
}
