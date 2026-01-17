// WOEID (Where On Earth ID) to coordinate mapping for major cities
// These are the locations we'll query for trends to stay within API rate limits

export interface WoeidLocation {
    woeid: number;
    name: string;
    lat: number;
    lng: number;
    country?: string;
}

// ~30 major global locations for sampling
export const WOEID_LOCATIONS: WoeidLocation[] = [
    // Americas
    { woeid: 2459115, name: 'New York', lat: 40.7128, lng: -74.006, country: 'USA' },
    { woeid: 2442047, name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
    { woeid: 2514815, name: 'Washington DC', lat: 38.9072, lng: -77.0369, country: 'USA' },
    { woeid: 4118, name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
    { woeid: 468739, name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
    { woeid: 455819, name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' },
    { woeid: 455825, name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },

    // Europe
    { woeid: 44418, name: 'London', lat: 51.5074, lng: -0.1276, country: 'UK' },
    { woeid: 615702, name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
    { woeid: 638242, name: 'Berlin', lat: 52.52, lng: 13.405, country: 'Germany' },
    { woeid: 727232, name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
    { woeid: 721943, name: 'Rome', lat: 41.9028, lng: 12.4964, country: 'Italy' },
    { woeid: 2122265, name: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
    { woeid: 610264, name: 'Pau', lat: 43.2951, lng: -0.3708, country: 'France' },

    // Middle East & Africa
    { woeid: 1521894, name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
    { woeid: 1940345, name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
    { woeid: 1580913, name: 'Lagos', lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
    { woeid: 1582504, name: 'Johannesburg', lat: -26.2041, lng: 28.0473, country: 'South Africa' },

    // Asia
    { woeid: 1118370, name: 'Tokyo', lat: 35.6895, lng: 139.6917, country: 'Japan' },
    { woeid: 1132599, name: 'Seoul', lat: 37.5665, lng: 126.978, country: 'South Korea' },
    { woeid: 2151330, name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
    { woeid: 1047378, name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
    { woeid: 2295019, name: 'Hong Kong', lat: 22.3193, lng: 114.1694, country: 'Hong Kong' },
    { woeid: 1252431, name: 'Delhi', lat: 28.6139, lng: 77.209, country: 'India' },
    { woeid: 2295411, name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'India' },
    { woeid: 1225448, name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
    { woeid: 2151849, name: 'Manila', lat: 14.5995, lng: 120.9842, country: 'Philippines' },
    { woeid: 1166140, name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
    { woeid: 2161838, name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },

    // Oceania
    { woeid: 2348079, name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
];

// Lookup function
export function getLocationByWoeid(woeid: number): WoeidLocation | undefined {
    return WOEID_LOCATIONS.find(loc => loc.woeid === woeid);
}

// Get all WOEIDs as array for API calls
export function getAllWoeids(): number[] {
    return WOEID_LOCATIONS.map(loc => loc.woeid);
}
