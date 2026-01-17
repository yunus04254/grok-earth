'use client';

import { useState } from 'react';
import Globe from './components/Globe';
import SidePanel from './components/SidePanel';
import Grokipedia from './components/Grokipedia';

interface ClientHomeProps {
  apiKey: string;
}

export default function ClientHome({ apiKey }: ClientHomeProps) {
  const [showGrokipedia, setShowGrokipedia] = useState(false);

  return (
    <main className="w-full h-screen">
      <Globe apiKey={apiKey} />
      <SidePanel onGrokipediaClick={() => setShowGrokipedia(true)} />
      {showGrokipedia && (
        <Grokipedia onClose={() => setShowGrokipedia(false)} />
      )}
    </main>
  );
}
