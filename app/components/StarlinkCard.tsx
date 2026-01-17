import React, { useState } from 'react';
import { GECard } from '@/components/GECard';
import { Satellite, Activity, Ruler, Info, Calendar, Rocket } from 'lucide-react';
import { StarlinkSatellite } from '@/app/hooks/useStarlink';

// Extended satellite interface with fake data
interface ExtendedSatellite extends StarlinkSatellite {
    velocity?: string;
    mass?: string;
    busType?: string;
    manufacturer?: string;
    noradId?: number;
}

interface StarlinkCardProps {
    satellite: ExtendedSatellite;
    onClose: () => void;
}

export default function StarlinkCard({ satellite, onClose }: StarlinkCardProps) {
    const [activeTab, setActiveTab] = useState<'casual' | 'nerd'>('casual');

    // Use data directly from satellite object (generated in Globe.tsx)
    const velocity = satellite.velocity || '7.50 km/s';
    const altitude = `${Math.round(satellite.height)} km`;
    const mass = satellite.mass || '260 kg';
    const busType = satellite.busType || 'Starlink v1.5';
    const manufacturer = satellite.manufacturer || 'SpaceX';
    const launchDate = satellite.launchDate || 'Unknown';

    return (
        <div className="fixed top-24 right-6 z-40 w-96">
            <GECard
                title={satellite.name}
                icon={<Satellite className="w-5 h-5 text-emerald-400" />}
                onClose={onClose}
                className="backdrop-blur-xl"
            >
                {/* Connection Status Header */}
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    </div>
                    <div>
                        <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Signal Status</div>
                        <div className="text-sm font-medium text-emerald-100">Active • Tracking</div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 mb-6 rounded-lg bg-[#000000]/40 border border-[#2a2f3a]/40">
                    <button
                        onClick={() => setActiveTab('casual')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'casual'
                            ? 'bg-[#2a2f3a] text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Casual
                    </button>
                    <button
                        onClick={() => setActiveTab('nerd')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'nerd'
                            ? 'bg-[#2a2f3a] text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Nerd Stats
                    </button>
                </div>

                {/* Casual View */}
                {activeTab === 'casual' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-xs">Speed</span>
                                </div>
                                <div className="text-xl font-bold text-white font-mono">
                                    {velocity}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                    <Ruler className="w-4 h-4" />
                                    <span className="text-xs">Altitude</span>
                                </div>
                                <div className="text-xl font-bold text-white font-mono">
                                    {altitude}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                            <div className="flex items-center gap-2 mb-3 text-gray-400">
                                <Info className="w-4 h-4" />
                                <span className="text-xs">Mission Context</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Part of the Starlink constellation providing high-speed, low-latency broadband internet across the globe.
                                Orbiting in Low Earth Orbit (LEO) to ensure minimal signal delay.
                            </p>
                        </div>
                    </div>
                )}

                {/* Nerd View */}
                {activeTab === 'nerd' && (
                    <div className="space-y-4 font-mono text-sm">
                        <div className="space-y-2">
                            <div className="text-xs text-gray-500 uppercase tracking-widest pl-1">Telemetry</div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-3 rounded-lg bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                    <div className="text-[10px] text-gray-500 mb-1">LATITUDE</div>
                                    <div className="text-emerald-400">{satellite.lat.toFixed(4)}°</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                    <div className="text-[10px] text-gray-500 mb-1">LONGITUDE</div>
                                    <div className="text-emerald-400">{satellite.lng.toFixed(4)}°</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                    <div className="text-[10px] text-gray-500 mb-1">MASS</div>
                                    <div className="text-white">{mass}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-[#1a1d24]/40 border border-[#2a2f3a]/40">
                                    <div className="text-[10px] text-gray-500 mb-1">BUS TYPE</div>
                                    <div className="text-white">{busType}</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="text-xs text-gray-500 uppercase tracking-widest pl-1">Launch Data</div>
                            <div className="p-4 rounded-lg bg-[#1a1d24]/40 border border-[#2a2f3a]/40 space-y-3">
                                <div className="flex justify-between items-center border-b border-[#2a2f3a]/40 pb-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-xs">LAUNCH DATE</span>
                                    </div>
                                    <span className="text-white">{launchDate}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Rocket className="w-3 h-3" />
                                        <span className="text-xs">MANUFACTURER</span>
                                    </div>
                                    <span className="text-white">{manufacturer}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="text-[10px] text-gray-600 font-mono break-all opacity-50">
                                TLE1: {satellite.tle1}
                            </div>
                        </div>
                    </div>
                )}
            </GECard>
        </div>
    );
}
