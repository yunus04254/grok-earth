'use client';

import { useState } from 'react';
import Image from 'next/image';
import Globe from './components/Globe';
import SidePanel from './components/SidePanel';
import Grokipedia from './components/Grokipedia';
import GrokEarthLogo from './assets/GrokEarth.png';

interface ClientHomeProps {
  apiKey: string;
}

export default function ClientHome({ apiKey }: ClientHomeProps) {
  const [showGrokipedia, setShowGrokipedia] = useState(false);

  return (
    <main className="w-full h-screen relative">
      <Globe apiKey={apiKey} />
      <SidePanel onGrokipediaClick={() => setShowGrokipedia(true)} />
      {showGrokipedia && (
        <Grokipedia onClose={() => setShowGrokipedia(false)} />
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
