"use client";

import { GECard } from "@/components/GECard";
import { GEInput } from "@/components/GEInput";
import { Info, BookOpen, Headphones } from "lucide-react";

export default function Sandbox() {
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

          {/* GEInput Example */}
          <div className="w-full space-y-4 pt-4">
            <GEInput 
              autoType={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
