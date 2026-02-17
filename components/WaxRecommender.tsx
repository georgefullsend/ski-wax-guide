"use client";

import { useState, useEffect } from "react";
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
  getWeatherIcon,
} from "@/lib/weatherTypes";
import { resorts, type SkiResort } from "@/lib/resorts";
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
  const [resortSearch, setResortSearch] = useState("");
  const [showResortDropdown, setShowResortDropdown] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [forecastMode, setForecastMode] = useState<"current" | "tomorrow">("current");
  const [tomorrowConditions, setTomorrowConditions] = useState<WeatherConditions | null>(null);
  const [tomorrowTempLow, setTomorrowTempLow] = useState<number | null>(null);
  const [inputCollapsed, setInputCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favoriteResorts");
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore corrupt localStorage
    }
  }, []);

  function toggleFavorite(resortName: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(resortName)) {
        next.delete(resortName);
      } else {
        next.add(resortName);
      }
      localStorage.setItem("favoriteResorts", JSON.stringify([...next]));
      return next;
    });
  }

  function applyResults(tempF: number, conditions?: WeatherConditions) {
    const effectiveF = conditions ? calcEffectiveTemp(conditions) : tempF;
    setRecommendation(getWaxRecommendation(effectiveF, conditions));
    setQuiver(getQuiverRecommendation(effectiveF));
  }

  const activeConditions = forecastMode === "tomorrow" && tomorrowConditions
    ? tomorrowConditions
    : weatherConditions;

  async function fetchWeatherByCoords(lat: number, lon: number, name: string) {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code,is_day,precipitation,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,precipitation_sum&forecast_days=2&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit`
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

    // Build tomorrow's conditions from daily forecast (index 1)
    const daily = data.daily;
    if (daily && daily.temperature_2m_max?.length > 1) {
      const tomorrowHighF: number = daily.temperature_2m_max[1];
      const tomorrowHighC = fahrenheitToCelsius(tomorrowHighF);
      const tomorrowLowF: number = daily.temperature_2m_min[1];

      const tomorrow: WeatherConditions = {
        tempF: tomorrowHighF,
        tempC: tomorrowHighC,
        windSpeedMph: daily.wind_speed_10m_max[1] ?? 0,
        windDirection: daily.wind_direction_10m_dominant[1] ?? 0,
        cloudCover: 50, // not available in daily
        weatherCode: daily.weather_code[1] ?? 0,
        isDay: true, // forecast is for daytime skiing
        precipitation: daily.precipitation_sum[1] ?? 0,
        humidity: 50, // not available in daily
      };

      setTomorrowConditions(tomorrow);
      setTomorrowTempLow(Math.round(tomorrowLowF));
    } else {
      setTomorrowConditions(null);
      setTomorrowTempLow(null);
    }

    setForecastMode("current");
    setWeatherConditions(conditions);
    onWeatherChange?.(conditions);
    setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
    applyResults(tempF, conditions);
    setTempInput(
      unit === "F"
        ? Math.round(tempF).toString()
        : Math.round(tempC).toString()
    );
    setLocationName(name);
    setInputCollapsed(true);
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
          await fetchWeatherByCoords(
            latitude,
            longitude,
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

  async function handleResortSelect(resort: SkiResort) {
    setResortSearch(resort.name);
    setShowResortDropdown(false);
    setError("");
    setLoading(true);
    setLocationName("");
    setWeatherConditions(null);

    try {
      await fetchWeatherByCoords(resort.lat, resort.lon, resort.name);
    } catch {
      setError(`Failed to fetch weather for ${resort.name}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  function switchForecastMode(mode: "current" | "tomorrow") {
    setForecastMode(mode);
    if (mode === "tomorrow" && tomorrowConditions) {
      const tempF = tomorrowConditions.tempF;
      const tempC = fahrenheitToCelsius(tempF);
      setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
      applyResults(tempF, tomorrowConditions);
      onWeatherChange?.(tomorrowConditions);
    } else if (mode === "current" && weatherConditions) {
      const tempF = weatherConditions.tempF;
      const tempC = fahrenheitToCelsius(tempF);
      setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
      applyResults(tempF, weatherConditions);
      onWeatherChange?.(weatherConditions);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setWeatherConditions(null);
    setTomorrowConditions(null);
    setTomorrowTempLow(null);
    setForecastMode("current");
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
    setInputCollapsed(true);
  }

  const quiverOptions = quiver ? quiver[discipline] : [];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 sm:space-y-6">

      {/* Collapsed input header OR full inputs */}
      {inputCollapsed && recommendation ? (
        <button
          onClick={() => setInputCollapsed(false)}
          className="w-full bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-5 flex items-center justify-between border border-mf-blue/30 liquid-card card-hover text-left"
        >
          <div className="flex items-center gap-2.5">
            {activeConditions && (
              <span className="text-xl">{getWeatherIcon(activeConditions.weatherCode, activeConditions.isDay)}</span>
            )}
            <span className="text-white font-medium text-base sm:text-lg">
              {locationName || "Manual Input"}
              {currentTemp && <span className="text-white/60"> — {currentTemp.f}°F</span>}
            </span>
          </div>
          <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
      ) : (
        <>
          {/* Auto-detect section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-blue/30 liquid-card card-hover">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
              Auto-Detect Weather
            </h2>
            <button
              onClick={handleAutoDetect}
              disabled={loading}
              className={`w-full bg-mf-blue hover:bg-mf-blue-dark active:bg-mf-blue-darker disabled:bg-mf-blue-darker disabled:cursor-wait text-white font-medium py-3.5 sm:py-3 px-6 rounded-2xl transition-all min-h-[48px] liquid-btn ${loading ? "animate-pulse" : ""}`}
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

          {/* Resort picker section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-blue/30 liquid-card card-hover relative z-30">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
              Pick a Resort
            </h2>
            <div className="relative">
              <input
                type="text"
                value={resortSearch}
                onChange={(e) => {
                  setResortSearch(e.target.value);
                  setShowResortDropdown(true);
                }}
                onFocus={() => setShowResortDropdown(true)}
                placeholder="Search resorts..."
                className="w-full bg-white/10 border border-mf-blue/30 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-mf-blue focus:border-transparent"
              />
              {showResortDropdown && (
                <div className="absolute z-40 mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-mf-blue/30 rounded-xl max-h-[50vh] sm:max-h-64 overflow-y-auto shadow-xl overscroll-contain -webkit-overflow-scrolling-touch">
                  {(() => {
                    const query = resortSearch.toLowerCase();
                    const filtered = resorts.filter((r) =>
                      r.name.toLowerCase().includes(query)
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="px-4 py-3 text-white/40 text-sm">
                          No resorts found
                        </div>
                      );
                    }

                    const favoriteResorts = filtered.filter((r) =>
                      favorites.has(r.name)
                    );
                    const regions = [...new Set(filtered.map((r) => r.region))];

                    const renderResortRow = (resort: SkiResort) => (
                      <div
                        key={resort.name}
                        className="flex items-center hover:bg-white/10 active:bg-white/15 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(resort.name);
                          }}
                          className="pl-4 pr-2 py-3 text-base sm:text-sm flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={
                            favorites.has(resort.name)
                              ? `Unfavorite ${resort.name}`
                              : `Favorite ${resort.name}`
                          }
                        >
                          {favorites.has(resort.name) ? (
                            <span className="text-yellow-400">&#9733;</span>
                          ) : (
                            <span className="text-white/30 hover:text-yellow-400/60">&#9734;</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResortSelect(resort)}
                          className="flex-1 text-left pr-4 py-3 text-sm text-white/80 hover:text-white active:text-white transition-colors min-h-[44px] flex items-center"
                        >
                          {resort.name}
                        </button>
                      </div>
                    );

                    return (
                      <>
                        {favoriteResorts.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-yellow-400/70 uppercase tracking-wider sticky top-0 bg-slate-800/95 flex items-center gap-1">
                              <span>&#9733;</span> Favorites
                            </div>
                            {favoriteResorts.map(renderResortRow)}
                          </div>
                        )}
                        {regions.map((region) => (
                          <div key={region}>
                            <div className="px-4 py-2 text-xs font-semibold text-mf-blue/70 uppercase tracking-wider sticky top-0 bg-slate-800/95">
                              {region}
                            </div>
                            {filtered
                              .filter((r) => r.region === region)
                              .map(renderResortRow)}
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            {/* Click outside to close */}
            {showResortDropdown && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowResortDropdown(false)}
              />
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-mf-blue/30" />
            <span className="text-mf-blue/60 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-mf-blue/30" />
          </div>

          {/* Manual input section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-blue/30 liquid-card card-hover">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-3">
              Enter Temperature
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  placeholder={unit === "F" ? "e.g. 25" : "e.g. -4"}
                  className="flex-1 bg-white/10 border border-mf-blue/30 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-mf-blue focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setUnit(unit === "F" ? "C" : "F")}
                  className="bg-mf-blue/20 hover:bg-mf-blue/30 active:bg-mf-blue/40 border border-mf-blue/30 rounded-xl px-4 py-3 text-white font-medium transition-colors min-w-[60px] min-h-[48px]"
                >
                  °{unit}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-mf-green hover:bg-mf-green-dark active:bg-mf-green-darker text-white font-medium py-3.5 sm:py-3 px-6 rounded-2xl transition-colors min-h-[48px] liquid-btn"
              >
                Get Recommendation
              </button>
            </form>
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Wax Result display — HERO position, above weather */}
      {recommendation && currentTemp && (
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-green/30 space-y-3 sm:space-y-4 liquid-card card-hover">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Recommended Wax
            </h2>
            <div className="text-right text-xs sm:text-sm text-white/70 flex-shrink-0">
              {locationName && <div className="truncate max-w-[140px] sm:max-w-none">{locationName}</div>}
              <div>
                {currentTemp.f}°F / {currentTemp.c}°C
              </div>
            </div>
          </div>

          {/* Wax color indicator + name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: recommendation.colorHex }}
            />
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {recommendation.color} Wax
              </div>
              <div className="text-white/70 text-sm">{recommendation.name}</div>
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(Object.keys(productRangeLabels) as ProductRange[]).map(
                (range) => (
                  <button
                    key={range}
                    onClick={() => setProductRange(range)}
                    className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[40px] ${
                      productRange === range
                        ? "bg-mf-green text-white ring-2 ring-mf-green/30 shadow-lg shadow-mf-green/10"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:bg-white/15"
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

      {/* Forecast mode toggle + Weather Widget — below recommendation */}
      {weatherConditions && (
        <>
          {tomorrowConditions && (
            <div className="flex gap-2">
              <button
                onClick={() => switchForecastMode("current")}
                className={`flex-1 py-3 sm:py-2.5 px-4 rounded-2xl text-sm font-medium transition-all min-h-[44px] ${
                  forecastMode === "current"
                    ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:bg-white/15"
                }`}
              >
                Current Conditions
              </button>
              <button
                onClick={() => switchForecastMode("tomorrow")}
                className={`flex-1 py-3 sm:py-2.5 px-4 rounded-2xl text-sm font-medium transition-all min-h-[44px] ${
                  forecastMode === "tomorrow"
                    ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:bg-white/15"
                }`}
              >
                Tomorrow's Forecast
              </button>
            </div>
          )}
          <WeatherWidget
            conditions={forecastMode === "tomorrow" && tomorrowConditions ? tomorrowConditions : weatherConditions}
            mode={forecastMode}
            tempLow={forecastMode === "tomorrow" ? tomorrowTempLow ?? undefined : undefined}
          />
        </>
      )}

      {/* Quiver Selector */}
      {quiver && currentTemp && (
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-blue/30 space-y-3 sm:space-y-4 liquid-card card-hover">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-white">
              Quiver Selector
            </h2>
            <span className="text-xs sm:text-sm text-white/50 flex-shrink-0">{quiver.condition}</span>
          </div>

          <p className="text-white/70 text-sm">{quiver.description}</p>

          {/* Ski / Snowboard toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setDiscipline("ski")}
              className={`flex-1 py-3 sm:py-2.5 px-4 rounded-2xl text-sm font-medium transition-all min-h-[44px] ${
                discipline === "ski"
                  ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:bg-white/15"
              }`}
            >
              Skis
            </button>
            <button
              onClick={() => setDiscipline("snowboard")}
              className={`flex-1 py-3 sm:py-2.5 px-4 rounded-2xl text-sm font-medium transition-all min-h-[44px] ${
                discipline === "snowboard"
                  ? "bg-mf-blue text-white ring-2 ring-mf-blue/30 shadow-lg shadow-mf-blue/10"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 active:bg-white/15"
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
                className="bg-white/5 rounded-xl p-3 sm:p-4 space-y-2"
              >
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <h3 className="text-white font-semibold text-sm">
                    {option.name}
                  </h3>
                  <span className="text-mf-blue text-xs font-medium flex-shrink-0 text-right">
                    {option.bestFor}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
