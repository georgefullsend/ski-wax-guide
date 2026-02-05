"use client";

import { useState } from "react";
import {
  getWaxRecommendation,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  type WaxRecommendation,
} from "@/lib/waxData";

export default function WaxRecommender() {
  const [tempInput, setTempInput] = useState("");
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [recommendation, setRecommendation] =
    useState<WaxRecommendation | null>(null);
  const [currentTemp, setCurrentTemp] = useState<{
    f: number;
    c: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationName, setLocationName] = useState("");

  async function handleAutoDetect() {
    setError("");
    setLoading(true);
    setLocationName("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
          );
          if (!res.ok) throw new Error("Weather API request failed");
          const data = await res.json();
          const tempF: number = data.current_weather.temperature;
          const tempC = fahrenheitToCelsius(tempF);

          setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
          setRecommendation(getWaxRecommendation(tempF));
          setTempInput(
            unit === "F"
              ? Math.round(tempF).toString()
              : Math.round(tempC).toString()
          );
          setLocationName(
            `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`
          );
        } catch {
          setError("Failed to fetch weather data. Please try manual input.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(
          "Location access denied. Please allow location access or enter temperature manually."
        );
        setLoading(false);
      }
    );
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const value = parseFloat(tempInput);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }

    const tempF = unit === "C" ? celsiusToFahrenheit(value) : value;
    const tempC = unit === "F" ? fahrenheitToCelsius(value) : value;

    setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
    setRecommendation(getWaxRecommendation(tempF));
    setLocationName("");
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Auto-detect section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-3">
          Auto-Detect Weather
        </h2>
        <button
          onClick={handleAutoDetect}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-medium py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? "Detecting location..." : "Use My Location"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/60 text-sm font-medium">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Manual input section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-3">
          Enter Temperature
        </h2>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="number"
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              placeholder={unit === "F" ? "e.g. 25" : "e.g. -4"}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setUnit(unit === "F" ? "C" : "F")}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-3 text-white font-medium transition-colors min-w-[60px]"
            >
              °{unit}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Get Recommendation
          </button>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Result display */}
      {recommendation && currentTemp && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Recommended Wax
            </h2>
            <div className="text-right text-sm text-white/70">
              {locationName && <div>{locationName}</div>}
              <div>
                {currentTemp.f}°F / {currentTemp.c}°C
              </div>
            </div>
          </div>

          {/* Wax color indicator + name */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: recommendation.colorHex }}
            />
            <div>
              <div className="text-2xl font-bold text-white">
                {recommendation.color} Wax
              </div>
              <div className="text-white/70">{recommendation.name}</div>
            </div>
          </div>

          {/* Temp range */}
          <div className="bg-white/5 rounded-xl p-3 text-sm text-white/80">
            <span className="font-medium text-white">Range:</span>{" "}
            {recommendation.tempRangeF} ({recommendation.tempRangeC})
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed">
            {recommendation.description}
          </p>

          {/* Suggested products */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              Suggested Products
            </h3>
            <ul className="space-y-1">
              {recommendation.products.map((product) => (
                <li
                  key={product}
                  className="text-white/70 text-sm flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: recommendation.colorHex }}
                  />
                  {product}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
