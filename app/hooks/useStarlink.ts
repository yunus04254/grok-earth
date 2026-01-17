import { useState, useEffect, useCallback } from 'react';
import * as satellite from 'satellite.js';

export interface StarlinkSatellite {
    id: string;
    name: string;
    lat: number;
    lng: number;
    height: number;
    tle1: string;
    tle2: string;
    launchDate?: string;
}

export function useStarlink() {
    const [satellites, setSatellites] = useState<StarlinkSatellite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSatellites = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch directly from SpaceX API V4
            const response = await fetch('https://api.spacexdata.com/v4/starlink');
            if (!response.ok) throw new Error('Failed to fetch Starlink data');

            const rawData = await response.json();

            // Current time for static position calculation
            const now = new Date();

            const processed = rawData
                .filter((sat: any) => {
                    // Strict filter: Must have TLE and NOT be decayed
                    // spaceTrack object contains the reliable data
                    return sat.spaceTrack &&
                        sat.spaceTrack.TLE_LINE1 &&
                        sat.spaceTrack.TLE_LINE2 &&
                        sat.spaceTrack.DECAYED === false; // Must be active
                })
                .map((sat: any) => {
                    try {
                        const tle1 = sat.spaceTrack.TLE_LINE1;
                        const tle2 = sat.spaceTrack.TLE_LINE2;

                        // Calculate Position ONCE (Static)
                        const satrec = satellite.twoline2satrec(tle1, tle2);
                        const positionAndVelocity = satellite.propagate(satrec, now);

                        // Check if propagation succeeded
                        if (!positionAndVelocity || !positionAndVelocity.position) return null;

                        const positionEci = positionAndVelocity.position;

                        if (!positionEci || typeof positionEci === 'boolean') return null;

                        const gmst = satellite.gstime(now);
                        const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);

                        // Convert radians to degrees
                        const lng = satellite.degreesLong(positionGd.longitude);
                        const lat = satellite.degreesLat(positionGd.latitude);
                        const height = positionGd.height; // km

                        return {
                            id: sat.id, // Internal ID
                            noradId: sat.spaceTrack.NORAD_CAT_ID, // Useful for scraping
                            name: sat.spaceTrack.OBJECT_NAME || sat.version || 'Starlink',
                            lat,
                            lng,
                            height,
                            tle1,
                            tle2,
                            launchDate: sat.spaceTrack.LAUNCH_DATE || sat.launch
                        };
                    } catch (e) {
                        return null;
                    }
                })
                .filter((sat: any) => sat !== null) as StarlinkSatellite[]; // Filter out calculation errors

            setSatellites(processed);
            console.log(`Loaded ${processed.length} active Starlink satellites`);

        } catch (err) {
            console.error('Starlink fetch error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSatellites();
    }, [fetchSatellites]);

    return { satellites, loading, error };
}
