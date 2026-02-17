"use client";

import { useState } from "react";
import WaxRecommender from "@/components/WaxRecommender";
import WeatherBackground from "@/components/WeatherBackground";
import type { WeatherConditions } from "@/lib/weatherTypes";

export default function Home() {
  const [weatherConditions, setWeatherConditions] =
    useState<WeatherConditions | null>(null);

  return (
    <>
      <WeatherBackground conditions={weatherConditions} />
      <main className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-12 relative">
        <div className="w-full max-w-xl mx-auto bg-zinc-900/95 backdrop-blur-md rounded-lg p-4 sm:p-8 border border-zinc-700/50 shadow-2xl neon-border">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white text-glow mb-2 sm:mb-3">
              Ski Wax Guide
            </h1>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-zinc-500 max-w-md mx-auto">
              Maximize each run with the best wax for the conditions.
            </p>
          </div>
          <WaxRecommender onWeatherChange={setWeatherConditions} />
        </div>
      </main>
    </>
  );
}
