"use client";

import { useState } from "react";
import { GECard } from "@/components/GECard";
import { GEInput } from "@/components/GEInput";
import { GEButton } from "@/components/GEButton";
import OverviewCard, { OverviewCardData } from "@/app/components/OverviewCard";
import { Info, BookOpen, Headphones, Download, Send, Trash2, Check } from "lucide-react";

type OverviewCardResponse = OverviewCardData & {
  error?: boolean;
  message?: string;
};

export default function Sandbox() {
  const [isLoading, setIsLoading] = useState(true);
  const [overviewQuery, setOverviewQuery] = useState("");
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState(false);
  const [overviewErrorMessage, setOverviewErrorMessage] = useState("");
  const [overviewData, setOverviewData] = useState<OverviewCardResponse | null>(null);
  return (
    <div 
      className="bg-zinc-50 font-sans dark:bg-black"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <main className="w-full max-w-3xl mx-auto flex flex-col py-16 px-8 sm:px-16 bg-white dark:bg-black">
        
        <div className="w-full space-y-6 pb-8">
          {/* Overview Card API Test - Standalone Input */}
          <div className="w-full space-y-4">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!overviewQuery.trim() || overviewLoading) return;

                setOverviewLoading(true);
                setOverviewError(false);
                setOverviewErrorMessage("");
                setOverviewData(null);

                try {
                  const response = await fetch('/api/overview-card', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: overviewQuery }),
                  });

                  const data: OverviewCardResponse = await response.json();

                  if (data.error) {
                    setOverviewError(true);
                    setOverviewErrorMessage(data.message || 'An error occurred');
                    setOverviewData(null);
                  } else {
                    setOverviewError(false);
                    setOverviewErrorMessage("");
                    setOverviewData(data);
                  }
                } catch (err) {
                  setOverviewError(true);
                  setOverviewErrorMessage(err instanceof Error ? err.message : 'Failed to fetch overview data');
                  setOverviewData(null);
                } finally {
                  setOverviewLoading(false);
                }
              }}
              className="space-y-4"
            >
              <GEInput
                value={overviewQuery}
                onChange={(e) => {
                  setOverviewQuery(e.target.value);
                  setOverviewError(false);
                  setOverviewErrorMessage("");
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Show me what's happening in Venezuela"
                loading={overviewLoading}
                error={overviewError}
                errorMessage={overviewErrorMessage}
                disabled={overviewLoading}
              />
              <div className="flex gap-3">
                <GEButton
                  type="submit"
                  disabled={overviewLoading || !overviewQuery.trim()}
                  variant="default"
                >
                  <Send className="h-4 w-4" />
                  Query Overview
                </GEButton>
                <GEButton
                  type="button"
                  onClick={() => {
                    setOverviewQuery("");
                    setOverviewError(false);
                    setOverviewErrorMessage("");
                    setOverviewData(null);
                  }}
                  variant="outline"
                  disabled={overviewLoading}
                >
                  Clear
                </GEButton>
              </div>
            </form>

            {/* Render OverviewCard when data is ready */}
            {overviewData && !overviewData.error && (
              <OverviewCard 
                data={overviewData}
                onClose={() => {
                  setOverviewData(null);
                  setOverviewQuery("");
                }}
                onExpand={() => console.log("Expand clicked")}
              />
            )}
          </div>

          {/* Example with icon, title, LIVE indicator, and control icons */}
          <GECard
            icon={<Info className="h-6 w-6" />}
            title="Region Overview"
            live={true}
            onClose={() => console.log("Close clicked")}
            onExpand={() => console.log("Expand clicked")}
            region="China"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Location</p>
                <p className="text-base text-[#e5e7eb]">Tehran, Iran</p>
              </div>
              <div>
                <p className="text-sm text-[#9ca3af] mb-1.5">Leader</p>
                <p className="text-base text-[#e5e7eb]">Ebrahim Raisi</p>
              </div>
            </div>
          </GECard>

          {/* Example with icon and title, no LIVE */}
          <GECard
            icon={<BookOpen className="h-6 w-6" />}
            title="Grokipedia"
            region="New York"
          >
            <p className="text-base text-[#9ca3af]">
              Historical overview and verified information about the region.
            </p>
          </GECard>

          {/* Example with LIVE indicator */}
          <GECard
            icon={<Headphones className="h-6 w-6" />}
            title="AI Podcast"
            live={true}
            region="London"
          >
            <div className="space-y-2">
              <p className="text-base font-medium text-[#e5e7eb]">
                Current Events: Iran Analysis
              </p>
              <p className="text-sm text-[#9ca3af]">
                AI TTS agent discussing current events in the region.
              </p>
            </div>
          </GECard>

          {/* Example without top section - fully flexible */}
          <GECard>
            <div className="space-y-2">
              <p className="text-base text-[#e5e7eb]">
                This card has no icon, title, or LIVE indicator - completely flexible content.
              </p>
            </div>
          </GECard>

          {/* Overview Card API Test */}
          <GECard
            icon={<Info className="h-6 w-6" />}
            title="Overview Card API Test"
          >
            <div className="space-y-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!overviewQuery.trim() || overviewLoading) return;

                  setOverviewLoading(true);
                  setOverviewError(false);
                  setOverviewErrorMessage("");
                  setOverviewData(null);

                  try {
                    const response = await fetch('/api/overview-card', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ question: overviewQuery }),
                    });

                    const data: OverviewCardResponse = await response.json();

                    if (data.error) {
                      setOverviewError(true);
                      setOverviewErrorMessage(data.message || 'An error occurred');
                      setOverviewData(null);
                    } else {
                      setOverviewError(false);
                      setOverviewErrorMessage("");
                      setOverviewData(data);
                    }
                  } catch (err) {
                    setOverviewError(true);
                    setOverviewErrorMessage(err instanceof Error ? err.message : 'Failed to fetch overview data');
                    setOverviewData(null);
                  } finally {
                    setOverviewLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <GEInput
                  value={overviewQuery}
                  onChange={(e) => {
                    setOverviewQuery(e.target.value);
                    setOverviewError(false);
                    setOverviewErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Show me what's happening in Venezuela"
                  loading={overviewLoading}
                  error={overviewError}
                  errorMessage={overviewErrorMessage}
                  disabled={overviewLoading}
                />
                <div className="flex gap-3">
                  <GEButton
                    type="submit"
                    disabled={overviewLoading || !overviewQuery.trim()}
                    variant="default"
                  >
                    <Send className="h-4 w-4" />
                    Query Overview
                  </GEButton>
                  <GEButton
                    type="button"
                    onClick={() => {
                      setOverviewQuery("");
                      setOverviewError(false);
                      setOverviewErrorMessage("");
                      setOverviewData(null);
                    }}
                    variant="outline"
                    disabled={overviewLoading}
                  >
                    Clear
                  </GEButton>
                </div>
              </form>

              {overviewData && !overviewData.error && (
                <div className="mt-6 p-4 bg-[#1a1d24]/50 rounded-xl border border-[#2a2f3a]/60 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#9ca3af] mb-1">Location</p>
                      <p className="text-base text-[#e5e7eb] font-medium">
                        {overviewData.place?.display_name || overviewData.place?.name}
                      </p>
                      <p className="text-sm text-[#9ca3af] mt-1">
                        {overviewData.place?.type} • {overviewData.place?.country?.name || 'N/A'}
                      </p>
                    </div>

                    {overviewData.time && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1">Local Time</p>
                        <p className="text-base text-[#e5e7eb]">
                          {new Date(overviewData.time.primary.local_time_iso).toLocaleString()}
                        </p>
                        <p className="text-sm text-[#9ca3af] mt-1">
                          {overviewData.time.primary.iana}
                        </p>
                      </div>
                    )}

                    {overviewData.population && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1">Population</p>
                        <p className="text-base text-[#e5e7eb]">
                          {overviewData.population.value.toLocaleString()}
                        </p>
                        <p className="text-sm text-[#9ca3af] mt-1">
                          Data from {overviewData.population.metadata_year}
                        </p>
                      </div>
                    )}

                    {overviewData.weather && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1">Weather</p>
                        <p className="text-base text-[#e5e7eb]">
                          {overviewData.weather.conditions} • {overviewData.weather.temperature_c}°C
                        </p>
                      </div>
                    )}

                    {overviewData.leader && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1">Leader</p>
                        <p className="text-base text-[#e5e7eb]">
                          {overviewData.leader.name}
                        </p>
                        <p className="text-sm text-[#9ca3af] mt-1">
                          {overviewData.leader.metadata_role.replace(/_/g, ' ')} • Since {overviewData.leader.metadata_asof}
                        </p>
                      </div>
                    )}

                    {overviewData.summary && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1">Summary</p>
                        <p className="text-base text-[#e5e7eb] leading-relaxed">
                          {overviewData.summary.text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2a2f3a]/60">
                    <details className="text-xs">
                      <summary className="text-[#9ca3af] cursor-pointer hover:text-[#e5e7eb] transition-colors">
                        View Raw JSON
                      </summary>
                      <pre className="mt-2 p-3 bg-[#0a0d14] rounded-lg overflow-auto text-[#9ca3af] text-xs">
                        {JSON.stringify(overviewData, null, 2)}
                      </pre>
                    </details>
                  </div>
                </div>
              )}
            </div>
          </GECard>

          {/* GEInput Example */}
          <div className="w-full space-y-4 pt-4">
            <GEInput 
              autoType={true}
            />
            <GEInput 
              placeholder="Type something here..."
              loading={isLoading}
              onChange={() => {
                // Simulate loading state
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000);
              }}
            />
          </div>

          {/* GEButton Examples */}
          <GECard
            icon={<Info className="h-6 w-6" />}
            title="GEButton Examples"
          >
            <div className="space-y-6">
              {/* Variants */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] font-mono mb-2">
                  Variants
                </p>
                <div className="flex flex-wrap gap-3">
                  <GEButton variant="default">Default</GEButton>
                  <GEButton variant="outline">Outline</GEButton>
                  <GEButton variant="ghost">Ghost</GEButton>
                  <GEButton variant="destructive">Destructive</GEButton>
                  <GEButton variant="success">Success</GEButton>
                  <GEButton variant="accent">Accent</GEButton>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] font-mono mb-2">
                  Sizes
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <GEButton size="sm">Small</GEButton>
                  <GEButton size="default">Default</GEButton>
                  <GEButton size="lg">Large</GEButton>
                  <GEButton size="icon">
                    <Download className="h-4 w-4" />
                  </GEButton>
                </div>
              </div>

              {/* With Icons */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] font-mono mb-2">
                  With Icons
                </p>
                <div className="flex flex-wrap gap-3">
                  <GEButton variant="default">
                    <Download className="h-4 w-4" />
                    Download
                  </GEButton>
                  <GEButton variant="outline">
                    <Send className="h-4 w-4" />
                    Send
                  </GEButton>
                  <GEButton variant="success">
                    <Check className="h-4 w-4" />
                    Confirm
                  </GEButton>
                  <GEButton variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </GEButton>
                </div>
              </div>

              {/* Disabled States */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] font-mono mb-2">
                  Disabled States
                </p>
                <div className="flex flex-wrap gap-3">
                  <GEButton variant="default" disabled>Disabled</GEButton>
                  <GEButton variant="outline" disabled>Disabled</GEButton>
                  <GEButton variant="ghost" disabled>Disabled</GEButton>
                </div>
              </div>

              {/* Interactive Example */}
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280] font-mono mb-2">
                  Interactive
                </p>
                <div className="flex flex-wrap gap-3">
                  <GEButton 
                    variant="default"
                    onClick={() => alert("Default button clicked!")}
                  >
                    Click Me
                  </GEButton>
                  <GEButton 
                    variant="accent"
                    onClick={() => alert("Accent button clicked!")}
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </GEButton>
                </div>
              </div>
            </div>
          </GECard>
        </div>
      </main>
    </div>
  );
}
