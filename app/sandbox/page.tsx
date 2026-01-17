"use client";

import { useState } from "react";
import { GECard } from "@/components/GECard";
import { GEInput } from "@/components/GEInput";
import { GEButton } from "@/components/GEButton";
import { Info, BookOpen, Headphones, Download, Send, Trash2, Check } from "lucide-react";

export default function Sandbox() {
  const [isLoading, setIsLoading] = useState(true);
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
