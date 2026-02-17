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
  getWeatherLabel,
  getWeatherIcon,
  getWindDirectionLabel,
} from "@/lib/weatherTypes";
import { resorts, type SkiResort } from "@/lib/resorts";
import WeatherWidget from "./WeatherWidget";

export default function WaxRecommender() {
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

  // Minimal-clean specific state
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [weatherExpanded, setWeatherExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"wax" | "quiver">("wax");

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
        cloudCover: 50,
        weatherCode: daily.weather_code[1] ?? 0,
        isDay: true,
        precipitation: daily.precipitation_sum[1] ?? 0,
        humidity: 50,
      };

      setTomorrowConditions(tomorrow);
      setTomorrowTempLow(Math.round(tomorrowLowF));
    } else {
      setTomorrowConditions(null);
      setTomorrowTempLow(null);
    }

    setForecastMode("current");
    setWeatherConditions(conditions);
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
    } else if (mode === "current" && weatherConditions) {
      const tempF = weatherConditions.tempF;
      const tempC = fahrenheitToCelsius(tempF);
      setCurrentTemp({ f: Math.round(tempF), c: Math.round(tempC) });
      applyResults(tempF, weatherConditions);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setWeatherConditions(null);
    setTomorrowConditions(null);
    setTomorrowTempLow(null);
    setForecastMode("current");

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
  const hasResult = !!(recommendation && currentTemp);

  // Build weather summary line
  const weatherSummary = activeConditions
    ? `${getWeatherLabel(activeConditions.weatherCode)} · ${Math.round(activeConditions.tempF)}°F · Wind ${Math.round(activeConditions.windSpeedMph)}mph ${getWindDirectionLabel(activeConditions.windDirection)}`
    : null;

  return (
    <div className={`w-full max-w-lg mx-auto space-y-6 ${hasResult ? "pb-20" : ""}`}>
      {/* ── Collapsed header OR full inputs ── */}
      {inputCollapsed && hasResult ? (
        <button
          onClick={() => setInputCollapsed(false)}
          className="w-full flex items-center justify-between py-2 text-left group"
        >
          <span className="text-sm text-ink font-medium truncate">
            {locationName || "Manual Input"}
            {currentTemp && (
              <span className="text-ink-muted"> · {currentTemp.f}°F</span>
            )}
          </span>
          <svg className="w-4 h-4 text-ink-muted flex-shrink-0 ml-2 group-hover:text-ink transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
      ) : (
        <>
          {/* Auto-detect */}
          <div>
            <button
              onClick={handleAutoDetect}
              disabled={loading}
              className={`w-full bg-ink hover:bg-ink-light disabled:bg-ink-muted disabled:cursor-wait text-white font-medium py-3 px-6 rounded-lg transition-colors min-h-[48px] text-sm ${loading ? "animate-pulse" : ""}`}
            >
              {loading ? "Detecting location..." : "Use My Location"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-ink-muted text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Resort picker */}
          <div className="relative z-30">
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Resort</label>
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
                className="w-full bg-surface-alt border border-border rounded-lg px-4 py-3 text-base sm:text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-transparent"
              />
              {showResortDropdown && (
                <div className="absolute z-40 mt-1 w-full bg-white border border-border rounded-lg max-h-[50vh] sm:max-h-64 overflow-y-auto shadow-lg overscroll-contain">
                  {(() => {
                    const query = resortSearch.toLowerCase();
                    const filtered = resorts.filter((r) =>
                      r.name.toLowerCase().includes(query)
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="px-4 py-3 text-ink-muted text-sm">
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
                        className="flex items-center hover:bg-surface-alt active:bg-border/40 transition-colors"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(resort.name);
                          }}
                          className="pl-4 pr-2 py-3 text-sm flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                          aria-label={
                            favorites.has(resort.name)
                              ? `Unfavorite ${resort.name}`
                              : `Favorite ${resort.name}`
                          }
                        >
                          {favorites.has(resort.name) ? (
                            <span className="text-ink">&#9733;</span>
                          ) : (
                            <span className="text-ink-muted/40 hover:text-ink-muted">&#9734;</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResortSelect(resort)}
                          className="flex-1 text-left pr-4 py-3 text-sm text-ink-light hover:text-ink transition-colors min-h-[44px] flex items-center"
                        >
                          {resort.name}
                        </button>
                      </div>
                    );

                    return (
                      <>
                        {favoriteResorts.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-ink-muted uppercase tracking-wider sticky top-0 bg-white flex items-center gap-1">
                              <span>&#9733;</span> Favorites
                            </div>
                            {favoriteResorts.map(renderResortRow)}
                          </div>
                        )}
                        {regions.map((region) => (
                          <div key={region}>
                            <div className="px-4 py-2 text-xs font-semibold text-ink-muted uppercase tracking-wider sticky top-0 bg-white">
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
            {showResortDropdown && (
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowResortDropdown(false)}
              />
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-ink-muted text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Manual input */}
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Temperature</label>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  placeholder={unit === "F" ? "e.g. 25" : "e.g. -4"}
                  className="flex-1 bg-surface-alt border border-border rounded-lg px-4 py-3 text-base sm:text-sm text-ink placeholder-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-ink/20 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setUnit(unit === "F" ? "C" : "F")}
                  className="bg-surface-alt hover:bg-border/60 border border-border rounded-lg px-4 py-3 text-ink font-medium transition-colors min-w-[60px] min-h-[48px] text-sm"
                >
                  °{unit}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-ink hover:bg-ink-light text-white font-medium py-3 px-6 rounded-lg transition-colors min-h-[48px] text-sm"
              >
                Get Recommendation
              </button>
            </form>
          </div>
        </>
      )}

      {/* Error */}
      {error && (
        <div className="border-l-2 border-red-500 pl-3 py-2 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── TAB: WAX ── */}
      {activeTab === "wax" && (
        <>
          {/* Hero recommendation */}
          {recommendation && currentTemp && (
            <div className="space-y-4">
              {/* Wax name + swatch */}
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: recommendation.colorHex }}
                />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                    {recommendation.color} Wax
                  </div>
                  <div className="text-ink-muted text-sm">{recommendation.name}</div>
                </div>
              </div>

              {/* Temp + location context */}
              <div className="text-sm text-ink-muted">
                {locationName && <span className="text-ink-light">{locationName} · </span>}
                {currentTemp.f}°F / {currentTemp.c}°C
                <span className="text-ink-muted/60"> · Range: {recommendation.tempRangeF}</span>
              </div>

              {/* Condition note */}
              {recommendation.conditionNote && (
                <div className="border-l-2 pl-3 py-1 text-sm text-ink-light" style={{ borderColor: recommendation.colorHex }}>
                  {recommendation.conditionNote}
                </div>
              )}

              {/* Description */}
              <p className="text-ink-light text-sm leading-relaxed">
                {recommendation.description}
              </p>

              {/* Product range */}
              <div>
                <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Product Range
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(productRangeLabels) as ProductRange[]).map(
                    (range) => (
                      <button
                        key={range}
                        onClick={() => setProductRange(range)}
                        className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                          productRange === range
                            ? "bg-ink text-white"
                            : "bg-surface-alt text-ink-muted hover:text-ink hover:bg-border/50"
                        }`}
                      >
                        {productRangeLabels[range]}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                  Suggested Products
                </h3>
                <ul className="space-y-1">
                  {recommendation.products[productRange].map((product) => (
                    <li
                      key={product}
                      className="text-ink-light text-sm flex items-center gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: recommendation.colorHex }}
                      />
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── Weather summary line ── */}
          {activeConditions && hasResult && (
            <div className="pt-2">
              <button
                onClick={() => setWeatherExpanded(!weatherExpanded)}
                className="w-full flex items-center justify-between py-2 text-left group"
              >
                <span className="text-sm text-ink-muted truncate">
                  {weatherSummary}
                </span>
                <svg
                  className={`w-4 h-4 text-ink-muted flex-shrink-0 ml-2 transition-transform duration-200 ${weatherExpanded ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {weatherExpanded && (
                <div className="mt-2 space-y-3">
                  {/* Forecast toggle inside expanded */}
                  {tomorrowConditions && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => switchForecastMode("current")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                          forecastMode === "current"
                            ? "bg-ink text-white"
                            : "bg-surface-alt text-ink-muted hover:text-ink"
                        }`}
                      >
                        Current
                      </button>
                      <button
                        onClick={() => switchForecastMode("tomorrow")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all min-h-[36px] ${
                          forecastMode === "tomorrow"
                            ? "bg-ink text-white"
                            : "bg-surface-alt text-ink-muted hover:text-ink"
                        }`}
                      >
                        Tomorrow
                      </button>
                    </div>
                  )}
                  <WeatherWidget
                    conditions={activeConditions}
                    mode={forecastMode}
                    tempLow={forecastMode === "tomorrow" ? tomorrowTempLow ?? undefined : undefined}
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── TAB: QUIVER ── */}
      {activeTab === "quiver" && quiver && currentTemp && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink tracking-tight">
              Quiver Selector
            </h2>
            <span className="text-xs text-ink-muted">{quiver.condition}</span>
          </div>

          <p className="text-ink-light text-sm">{quiver.description}</p>

          {/* Discipline toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setDiscipline("ski")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                discipline === "ski"
                  ? "bg-ink text-white"
                  : "bg-surface-alt text-ink-muted hover:text-ink"
              }`}
            >
              Skis
            </button>
            <button
              onClick={() => setDiscipline("snowboard")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                discipline === "snowboard"
                  ? "bg-ink text-white"
                  : "bg-surface-alt text-ink-muted hover:text-ink"
              }`}
            >
              Snowboards
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {quiverOptions.map((option) => (
              <div
                key={option.name}
                className="border border-border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-ink font-semibold text-sm">
                    {option.name}
                  </h3>
                  <span className="text-ink-muted text-xs font-medium flex-shrink-0 text-right">
                    {option.bestFor}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-ink-muted">
                    Length: <span className="text-ink-light">{option.length}</span>
                  </div>
                  <div className="text-ink-muted">
                    Waist: <span className="text-ink-light">{option.waistWidth}</span>
                  </div>
                  <div className="text-ink-muted">
                    Shape: <span className="text-ink-light">{option.shape}</span>
                  </div>
                  <div className="text-ink-muted">
                    Camber: <span className="text-ink-light">{option.camber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fixed bottom nav — only after recommendation ── */}
      {hasResult && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border safe-area-bottom z-50">
          <div className="flex max-w-lg mx-auto">
            <button
              onClick={() => setActiveTab("wax")}
              className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[48px] ${
                activeTab === "wax" ? "text-ink" : "text-ink-muted"
              }`}
            >
              Wax
            </button>
            <button
              onClick={() => setActiveTab("quiver")}
              className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[48px] ${
                activeTab === "quiver" ? "text-ink" : "text-ink-muted"
              }`}
            >
              Quiver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
