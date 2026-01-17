import Globe from './components/Globe';
import SidePanel from './components/SidePanel';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  return (
    <main className="w-full h-screen">
      <Globe apiKey={apiKey} />
      <SidePanel />
    </main>
  );
}
