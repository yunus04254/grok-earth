import ClientHome from './ClientHome';

export default function Home() {
  const apiKey = process.env.MAPBOX_API_KEY || '';

  return <ClientHome apiKey={apiKey} />;
}
