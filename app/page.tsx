"use client";

import WaxRecommender from "@/components/WaxRecommender";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-8 sm:py-16">
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            Ski Wax Guide
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Wax recommendation for current conditions.
          </p>
        </div>
        <WaxRecommender />
      </div>
    </main>
  );
}
