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
        <div className="w-full max-w-xl mx-auto bg-cream/85 backdrop-blur-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-amber/15 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-bark text-glow mb-2 sm:mb-3">
              Ski Wax Guide
            </h1>
            <p className="text-sm sm:text-base text-bark-light/70 max-w-md mx-auto leading-relaxed">
              Maximize each run with the best wax for the conditions.
            </p>
          </div>
          <WaxRecommender onWeatherChange={setWeatherConditions} />
        </div>
      </main>
    </>
  );
}
