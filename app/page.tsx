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
        {/* Liquid morphism blob accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-64 h-64 bg-mf-blue/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-40 -right-16 w-48 h-48 bg-mf-green/6 rounded-full blur-[80px]" />
        </div>
        <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-md rounded-[22px] sm:rounded-[28px] p-4 sm:p-8 border border-white/10 liquid-card">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white text-glow mb-2 sm:mb-3">
              Ski Wax Guide
            </h1>
            <p className="text-sm sm:text-lg tracking-wide text-white/60 max-w-md mx-auto">
              Maximize each run with the best wax for the conditions.
            </p>
          </div>
          <WaxRecommender onWeatherChange={setWeatherConditions} />
        </div>
      </main>
    </>
  );
}
