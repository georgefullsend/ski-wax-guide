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
        <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white text-glow mb-2 sm:mb-3">
              Ski Wax Guide
            </h1>
            <p className="text-sm sm:text-lg tracking-wide text-white/60 max-w-md mx-auto">
              Get the right wax for today&#39;s conditions. Auto-detect your local
              temperature or enter it manually.
            </p>
          </div>
          <WaxRecommender onWeatherChange={setWeatherConditions} />
        </div>
      </main>
    </>
  );
}
