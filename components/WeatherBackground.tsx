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
  default: "from-[#E8DCC8] via-[#DDD0B8] to-[#D5C8A8]",
  clearDay: "from-[#87CEEB]/40 via-[#E8DCC8] to-[#DDD0B8]",
  clearNight: "from-[#2C1810] via-[#3E2723] to-[#1A0F0A]",
  partlyCloudy: "from-[#C8BCA8] via-[#D5C8B0] to-[#C0B498]",
  overcast: "from-[#B8AE9A] via-[#C0B8A8] to-[#B0A898]",
  snow: "from-[#D8D0C0] via-[#E0D8C8] to-[#D0C8B8]",
  rain: "from-[#5D4037] via-[#4E342E] to-[#3E2723]",
  thunderstorm: "from-[#3E2723] via-[#2C1810] to-[#1A0F0A]",
};

interface WeatherBackgroundProps {
  conditions: WeatherConditions | null;
}

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

function Cloud({ size, opacity, className, style }: {
  size: number;
  opacity: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const w = size;
  const h = size * 0.5;
  return (
    <div className={className} style={{ width: w, height: h, position: "relative", ...style }}>
      <div
        className="absolute rounded-full bg-amber-50"
        style={{ width: w * 0.6, height: h * 0.7, bottom: 0, left: w * 0.2, opacity }}
      />
      <div
        className="absolute rounded-full bg-amber-50"
        style={{ width: w * 0.4, height: h * 0.65, bottom: h * 0.15, left: w * 0.05, opacity }}
      />
      <div
        className="absolute rounded-full bg-amber-50"
        style={{ width: w * 0.45, height: h * 0.7, bottom: h * 0.1, right: w * 0.05, opacity }}
      />
      <div
        className="absolute rounded-full bg-amber-50"
        style={{ width: w * 0.35, height: h * 0.6, bottom: h * 0.35, left: w * 0.3, opacity }}
      />
      <div
        className="absolute rounded-full bg-amber-50"
        style={{ width: w * 0.25, height: h * 0.45, bottom: h * 0.3, left: w * 0.55, opacity }}
      />
    </div>
  );
}

function DarkCloud({ size, opacity, className, style }: {
  size: number;
  opacity: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const w = size;
  const h = size * 0.5;
  return (
    <div className={className} style={{ width: w, height: h, position: "relative", ...style }}>
      <div
        className="absolute rounded-full bg-stone-600"
        style={{ width: w * 0.6, height: h * 0.7, bottom: 0, left: w * 0.2, opacity }}
      />
      <div
        className="absolute rounded-full bg-stone-500"
        style={{ width: w * 0.4, height: h * 0.65, bottom: h * 0.15, left: w * 0.05, opacity }}
      />
      <div
        className="absolute rounded-full bg-stone-600"
        style={{ width: w * 0.45, height: h * 0.7, bottom: h * 0.1, right: w * 0.05, opacity }}
      />
      <div
        className="absolute rounded-full bg-stone-500"
        style={{ width: w * 0.35, height: h * 0.6, bottom: h * 0.35, left: w * 0.3, opacity }}
      />
      <div
        className="absolute rounded-full bg-stone-600"
        style={{ width: w * 0.25, height: h * 0.45, bottom: h * 0.3, left: w * 0.55, opacity }}
      />
    </div>
  );
}

export default function WeatherBackground({ conditions }: WeatherBackgroundProps) {
  const scene = getScene(conditions);
  const isNight = conditions ? !conditions.isDay : false;

  const stars = useMemo(() => seededPositions(50, 7), []);
  const snowflakes = useMemo(() => seededPositions(50, 13), []);
  const raindrops = useMemo(() => seededPositions(60, 19), []);

  const showStars = scene === "clearNight" || (isNight && scene !== "default");
  const showSun = scene === "clearDay" || scene === "partlyCloudy";
  const showMoon = isNight && scene !== "default" && scene !== "thunderstorm";
  const showWhiteClouds = scene === "partlyCloudy" || scene === "overcast" || scene === "snow";
  const showDarkClouds = scene === "rain" || scene === "thunderstorm";
  const showSnow = scene === "snow";
  const showRain = scene === "rain" || scene === "thunderstorm";
  const showFlash = scene === "thunderstorm";

  const cloudOpacity = scene === "overcast" ? 0.85 : scene === "snow" ? 0.7 : 0.5;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradients[scene]} transition-all duration-[1500ms] ease-in-out`}
      />

      {showStars && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {stars.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-100 animate-twinkle"
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

      {showSun && !isNight && (
        <div className="absolute top-[8%] right-[15%] transition-opacity duration-1000">
          <div className="w-32 h-32 rounded-full bg-amber-300/80 animate-sun-pulse blur-sm" />
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-amber-200/40 animate-sun-pulse blur-2xl scale-150" />
        </div>
      )}

      {showMoon && (
        <div className="absolute top-[10%] right-[18%] transition-opacity duration-1000">
          <div className="w-20 h-20 rounded-full bg-amber-100/80 blur-[1px]" />
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-amber-100/20 blur-xl scale-[2]" />
        </div>
      )}

      {showWhiteClouds && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <Cloud size={320} opacity={cloudOpacity} className="absolute animate-cloud-drift"
            style={{ top: "5%", left: "-10%", animationDuration: "50s", animationDelay: "0s" }} />
          <Cloud size={260} opacity={cloudOpacity * 0.9} className="absolute animate-cloud-drift"
            style={{ top: "12%", left: "15%", animationDuration: "60s", animationDelay: "8s" }} />
          <Cloud size={380} opacity={cloudOpacity} className="absolute animate-cloud-drift"
            style={{ top: "2%", left: "40%", animationDuration: "45s", animationDelay: "3s" }} />
          <Cloud size={290} opacity={cloudOpacity * 0.85} className="absolute animate-cloud-drift"
            style={{ top: "18%", left: "60%", animationDuration: "55s", animationDelay: "12s" }} />
          <Cloud size={340} opacity={cloudOpacity * 0.95} className="absolute animate-cloud-drift"
            style={{ top: "8%", left: "80%", animationDuration: "48s", animationDelay: "6s" }} />
          {scene === "overcast" && (
            <>
              <Cloud size={400} opacity={cloudOpacity * 0.7} className="absolute animate-cloud-drift"
                style={{ top: "25%", left: "-5%", animationDuration: "65s", animationDelay: "2s" }} />
              <Cloud size={350} opacity={cloudOpacity * 0.65} className="absolute animate-cloud-drift"
                style={{ top: "30%", left: "35%", animationDuration: "58s", animationDelay: "15s" }} />
              <Cloud size={300} opacity={cloudOpacity * 0.6} className="absolute animate-cloud-drift"
                style={{ top: "22%", left: "70%", animationDuration: "52s", animationDelay: "9s" }} />
            </>
          )}
        </div>
      )}

      {showDarkClouds && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <DarkCloud size={380} opacity={0.8} className="absolute animate-cloud-drift"
            style={{ top: "3%", left: "-10%", animationDuration: "40s", animationDelay: "0s" }} />
          <DarkCloud size={320} opacity={0.75} className="absolute animate-cloud-drift"
            style={{ top: "10%", left: "20%", animationDuration: "50s", animationDelay: "5s" }} />
          <DarkCloud size={420} opacity={0.85} className="absolute animate-cloud-drift"
            style={{ top: "0%", left: "45%", animationDuration: "38s", animationDelay: "2s" }} />
          <DarkCloud size={350} opacity={0.7} className="absolute animate-cloud-drift"
            style={{ top: "15%", left: "70%", animationDuration: "45s", animationDelay: "10s" }} />
          <DarkCloud size={400} opacity={0.8} className="absolute animate-cloud-drift"
            style={{ top: "20%", left: "30%", animationDuration: "55s", animationDelay: "7s" }} />
          <DarkCloud size={300} opacity={0.65} className="absolute animate-cloud-drift"
            style={{ top: "25%", left: "-5%", animationDuration: "48s", animationDelay: "12s" }} />
        </div>
      )}

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

      {showRain && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          {raindrops.map((r, i) => (
            <div
              key={i}
              className="absolute bg-stone-400/40 animate-rainfall rounded-full"
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

      {showFlash && (
        <div className="absolute inset-0 bg-white/0 animate-lightning-flash" />
      )}
    </div>
  );
}
