"use client";

import { TweetList } from "@/components/TweetList";

export default function ICPage() {
  return (
    <div className="min-h-screen bg-[#0f1117] p-8">
      <div className="max-w-3xl mx-auto">
        <TweetList region="China" />
      </div>
    </div>
  );
}
