"use client";

import { useMemo } from "react";
import type { WeatherConditions } from "@/lib/weatherTypes";

type Scene = "default" | "clearDay" | "clearNight" | "partlyCloudy" | "overcast" | "snow" | "rain" | "thunderstorm";

function getScene(conditions: WeatherConditions | null): Scene {
  if (!conditions) return "default";
  const { weatherCode, isDay } = conditions;

  if (weatherCode >= 95) return "thunderstorm";
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return "snow";
  if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return "rain";
  if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) return "overcast";
  if (weatherCode === 2) return "partlyCloudy";
  if (weatherCode <= 1 && isDay) return "clearDay";
  if (weatherCode <= 1 && !isDay) return "clearNight";
  return "default";
}

const gradients: Record<Scene, string> = {
  default: "from-slate-900 via-[#1a2744] to-slate-900",
  clearDay: "from-sky-400 via-blue-500 to-sky-600",
  clearNight: "from-[#0a1628] via-[#111d3a] to-[#0d1529]",
  partlyCloudy: "from-sky-500 via-blue-400 to-slate-500",
  overcast: "from-slate-500 via-slate-600 to-slate-700",
  snow: "from-slate-400 via-[#6b7fa3] to-slate-600",
  rain: "from-slate-600 via-slate-700 to-slate-800",
  thunderstorm: "from-slate-800 via-[#1a1a2e] to-slate-900",
};

interface WeatherBackgroundProps {
  conditions: WeatherConditions | null;
}

// Generate deterministic "random" positions for particles
function seededPositions(count: number, seed: number) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const s = (seed + i * 137.5) % 100;
    const d = ((seed + i * 73.1) % 3) + 2;
    const delay = ((seed + i * 41.3) % 4);
    items.push({ left: s, duration: d, delay });
  }
  return items;
}

export default function WeatherBackground({ conditions }: WeatherBackgroundProps) {
  const scene = getScene(conditions);

  const stars = useMemo(() => seededPositions(50, 7), []);
  const snowflakes = useMemo(() => seededPositions(50, 13), []);
  const raindrops = useMemo(() => seededPositions(60, 19), []);
  const clouds = useMemo(() => [
    { left: -5, top: 8, width: 300, opacity: 0.15, duration: 45, delay: 0 },
    { left: 20, top: 15, width: 250, opacity: 0.12, duration: 55, delay: 10 },
    { left: 50, top: 5, width: 350, opacity: 0.18, duration: 50, delay: 5 },
    { left: 70, top: 20, width: 280, opacity: 0.1, duration: 60, delay: 15 },
  ], []);

  const showStars = scene === "default" || scene === "clearNight";
  const showSun = scene === "clearDay";
  const showMoon = scene === "clearNight";
  const showClouds = scene === "partlyCloudy" || scene === "overcast";
  const showSnow = scene === "snow";
  const showRain = scene === "rain" || scene === "thunderstorm";
  const showFlash = scene === "thunderstorm";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient base */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradients[scene]} transition-all duration-[1500ms] ease-in-out`}
      />

      {/* Stars */}
      {showStars && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {stars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${s.left}%`,
                top: `${(s.delay * 20 + s.duration * 5) % 90}%`,
                width: `${(i % 3) + 1}px`,
                height: `${(i % 3) + 1}px`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration + 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sun */}
      {showSun && (
        <div className="absolute top-[8%] right-[15%] transition-opacity duration-1000">
          <div className="w-32 h-32 rounded-full bg-yellow-300/80 animate-sun-pulse blur-sm" />
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-yellow-200/40 animate-sun-pulse blur-2xl scale-150" />
        </div>
      )}

      {/* Moon */}
      {showMoon && (
        <div className="absolute top-[10%] right-[18%] transition-opacity duration-1000">
          <div className="w-20 h-20 rounded-full bg-slate-200/80 blur-[1px]" />
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-slate-200/20 blur-xl scale-[2]" />
        </div>
      )}

      {/* Clouds */}
      {showClouds && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {clouds.map((c, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/80 blur-3xl animate-cloud-drift"
              style={{
                left: `${c.left}%`,
                top: `${c.top}%`,
                width: `${c.width}px`,
                height: `${c.width * 0.4}px`,
                opacity: scene === "overcast" ? c.opacity * 2 : c.opacity,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow */}
      {showSnow && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {snowflakes.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-snowfall"
              style={{
                left: `${s.left}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                opacity: 0.4 + (i % 4) * 0.15,
                animationDuration: `${s.duration + 3}s`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Rain */}
      {showRain && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {raindrops.map((r, i) => (
            <div
              key={i}
              className="absolute bg-blue-200/40 animate-rainfall rounded-full"
              style={{
                left: `${r.left}%`,
                width: "1.5px",
                height: `${8 + (i % 6) * 3}px`,
                animationDuration: `${r.duration * 0.3 + 0.4}s`,
                animationDelay: `${r.delay * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning flash */}
      {showFlash && (
        <div className="absolute inset-0 bg-white/0 animate-lightning-flash" />
      )}
    </div>
  );
}
