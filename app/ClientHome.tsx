'use client';

import { useState } from 'react';
import Image from 'next/image';
import Globe from './components/Globe';
import SidePanel from './components/SidePanel';
import Grokipedia from './components/Grokipedia';
import GrokRadio from './components/GrokRadio';
import GrokEarthLogo from './assets/GrokEarth.png';

interface ClientHomeProps {
  apiKey: string;
}

export default function ClientHome({ apiKey }: ClientHomeProps) {
  const [showGrokipedia, setShowGrokipedia] = useState(false);
  const [showGrokRadio, setShowGrokRadio] = useState(false);

  return (
    <main className="w-full h-screen relative">
      <Globe apiKey={apiKey} />
      <SidePanel 
        onGrokipediaClick={() => setShowGrokipedia(true)} 
        onGrokRadioClick={() => setShowGrokRadio(true)}
      />
      {showGrokipedia && (
        <Grokipedia onClose={() => setShowGrokipedia(false)} />
      )}
      {showGrokRadio && (
        <GrokRadio onClose={() => setShowGrokRadio(false)} />
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
    </main>
  );
}
