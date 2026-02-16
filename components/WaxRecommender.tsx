"use client";

import { useState } from "react";
import {
  getWaxRecommendation,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  productRangeLabels,
  type WaxRecommendation,
  type ProductRange,
} from "@/lib/waxData";
import {
  getQuiverRecommendation,
  type ConditionQuiver,
  type Discipline,
} from "@/lib/quiverData";
import {
  type WeatherConditions,
  calcEffectiveTemp,
} from "@/lib/weatherTypes";
import WeatherWidget from "./WeatherWidget";

interface WaxRecommenderProps {
  onWeatherChange?: (conditions: WeatherConditions | null) => void;
}

export default function WaxRecommender({ onWeatherChange }: WaxRecommenderProps) {
  const [tempInput, setTempInput] = useState("");
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [recommendation, setRecommendation] =
    useState<WaxRecommendation | null>(null);
  const [quiver, setQuiver] = useState<ConditionQuiver | null>(null);
  const [discipline, setDiscipline] = useState<Discipline>("ski");
  const [currentTemp, setCurrentTemp] = useState<{
    f: number;
    c: number;
  } | null>(null);
  const [productRange, setProductRange] =
    useState<ProductRange>("performance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationName, setLocationName] = useState("");
  const [weatherConditions, setWeatherConditions] =
    useState<WeatherConditions | null>(null);

  function applyResults(tempF: number, conditions?: WeatherConditions) {
    const effectiveF = conditions ? calcEffectiveTemp(conditions) : tempF;
    setRecommendation(getWaxRecommendation(effectiveF, conditions));
    setQuiver(getQuiverRecommendation(effectiveF));
  }

  async function handleAutoDetect() {
    setError("");
    setLoading(true);
    setLocationName("");
    setWeatherConditions(null);

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
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,is_day,precipitation,relative_humidity_2m&wind_speed_unit=mph&temperature_unit=fahrenheit`
          );
          if (!res.ok) throw new Error("Weather API request failed");
          const data = await res.json();
          const current = data.current;

          const tempF: number = current.temperature_2m;
          const tempC = fahrenheitToCelsius(tempF);

          const conditions: WeatherConditions = {
            tempF,
            tempC,
            windSpeedMph: current.wind_speed_10m,
            windDirection: current.wind_direction_10m,
            cloudCover: current.cloud_cover,
            weatherCode: current.weather_code,
            isDay: current.is_day === 1,
            precipitation: current.precipitation,
            humidity: current.relative_humidity_2m,
          };

          setWeatherConditions(conditions);
          onWeatherChange?.(conditions);
          setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
          applyResults(tempF, conditions);
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
    setWeatherConditions(null);
    onWeatherChange?.(null);

    const value = parseFloat(tempInput);
    if (isNaN(value)) {
      setError("Please enter a valid number.");
      return;
    }

    const tempF = unit === "C" ? celsiusToFahrenheit(value) : value;
    const tempC = unit === "F" ? fahrenheitToCelsius(value) : value;

    setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
    applyResults(tempF);
    setLocationName("");
  }

  const quiverOptions = quiver ? quiver[discipline] : [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Auto-detect section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-mf-blue/30 card-hover">
        <h2 className="text-lg font-semibold text-white mb-3">
          Auto-Detect Weather
        </h2>
        <button
          onClick={handleAutoDetect}
          disabled={loading}
          className={`w-full bg-mf-blue hover:bg-mf-blue-dark disabled:bg-mf-blue-darker disabled:cursor-wait text-white font-medium py-3 px-6 rounded-xl transition-all ${loading ? "animate-pulse" : ""}`}
        >
          {loading ? "Detecting location..." : "Use My Location"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-mf-blue/30" />
        <span className="text-mf-blue/60 text-sm font-medium">or</span>
        <div className="flex-1 h-px bg-mf-blue/30" />
      </div>

      {/* Manual input section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-mf-blue/30 card-hover">
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
              className="flex-1 bg-white/10 border border-mf-blue/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-mf-blue focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setUnit(unit === "F" ? "C" : "F")}
              className="bg-mf-blue/20 hover:bg-mf-blue/30 border border-mf-blue/30 rounded-xl px-4 py-3 text-white font-medium transition-colors min-w-[60px]"
            >
              °{unit}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-mf-green hover:bg-mf-green-dark text-white font-medium py-3 px-6 rounded-xl transition-colors"
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

      {/* Weather Widget — only shown for auto-detect */}
      {weatherConditions && (
        <WeatherWidget conditions={weatherConditions} />
      )}

      {/* Wax Result display */}
      {recommendation && currentTemp && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-mf-green/30 space-y-4 card-hover">
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

          {/* Condition note */}
          {recommendation.conditionNote && (
            <div className="bg-mf-blue/10 border border-mf-blue/20 rounded-xl p-3 text-sm text-white/80">
              {recommendation.conditionNote}
            </div>
          )}

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed">
            {recommendation.description}
          </p>

          {/* Product range selector */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              Product Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(productRangeLabels) as ProductRange[]).map(
                (range) => (
                  <button
                    key={range}
                    onClick={() => setProductRange(range)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      productRange === range
                        ? "bg-mf-green text-white ring-2 ring-mf-green/30 shadow-lg shadow-mf-green/10"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                    }`}
                  >
                    {productRangeLabels[range]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Suggested products */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">
              Suggested Products
            </h3>
            <ul className="space-y-1">
              {recommendation.products[productRange].map((product) => (
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

      {/* Quiver Selector */}
      {quiver && currentTemp && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-mf-blue/30 space-y-4 card-hover">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Quiver Selector
            </h2>
            <span className="text-sm text-white/50">{quiver.condition}</span>
          </div>

          <p className="text-white/70 text-sm">{quiver.description}</p>

          {/* Ski / Snowboard toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setDiscipline("ski")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                discipline === "ski"
                  ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              Skis
            </button>
            <button
              onClick={() => setDiscipline("snowboard")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                discipline === "snowboard"
                  ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              Snowboards
            </button>
          </div>

          {/* Quiver options */}
          <div className="space-y-3">
            {quiverOptions.map((option) => (
              <div
                key={option.name}
                className="bg-white/5 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm">
                    {option.name}
                  </h3>
                  <span className="text-mf-blue text-xs font-medium">
                    {option.bestFor}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-white/50">
                    Length:{" "}
                    <span className="text-white/80">{option.length}</span>
                  </div>
                  <div className="text-white/50">
                    Waist:{" "}
                    <span className="text-white/80">{option.waistWidth}</span>
                  </div>
                  <div className="text-white/50">
                    Shape:{" "}
                    <span className="text-white/80">{option.shape}</span>
                  </div>
                  <div className="text-white/50">
                    Camber:{" "}
                    <span className="text-white/80">{option.camber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
