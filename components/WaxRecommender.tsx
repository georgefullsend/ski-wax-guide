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
  const [quiverOpen, setQuiverOpen] = useState(false);

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
            `${latitude.toFixed(2)}\u00B0N, ${longitude.toFixed(2)}\u00B0W`
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
  const activeConditions = forecastMode === "tomorrow" && tomorrowConditions ? tomorrowConditions : weatherConditions;

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 sm:space-y-6">

      {/* Collapsed Input Header — shown after recommendation */}
      {inputCollapsed && recommendation ? (
        <button
          onClick={() => setInputCollapsed(false)}
          className="w-full bg-cream-dark/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between border border-amber/15 shadow-sm card-hover text-left"
        >
          <div className="flex items-center gap-2.5">
            {activeConditions && (
              <span className="text-xl">{getWeatherIcon(activeConditions.weatherCode, activeConditions.isDay)}</span>
            )}
            <span className="font-heading text-bark font-medium text-base sm:text-lg">
              {locationName || "Manual Input"}
              {currentTemp && <span className="text-bark-light"> \u2014 {currentTemp.f}\u00B0F</span>}
            </span>
          </div>
          <svg className="w-5 h-5 text-bark-light/60 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
          </svg>
        </button>
      ) : (
        /* Full Input Sections */
        <>
          {/* Auto-detect section */}
          <div className="bg-cream/90 rounded-2xl p-4 sm:p-6 border border-amber/15 shadow-md card-hover">
            <h2 className="font-heading text-base sm:text-lg font-semibold text-bark mb-3">
              Auto-Detect Weather
            </h2>
            <button
              onClick={handleAutoDetect}
              disabled={loading}
              className={`w-full bg-amber hover:bg-amber-dark active:bg-amber-dark disabled:bg-amber/50 disabled:cursor-wait text-white font-medium py-3.5 sm:py-3 px-6 rounded-xl transition-all min-h-[48px] ${loading ? "animate-pulse" : ""}`}
            >
              {loading ? "Detecting location..." : "Use My Location"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-amber/20" />
            <span className="text-bark-light/50 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-amber/20" />
          </div>

          {/* Resort picker section */}
          <div className="bg-cream/90 rounded-2xl p-4 sm:p-6 border border-amber/15 shadow-md card-hover relative z-30">
            <h2 className="font-heading text-base sm:text-lg font-semibold text-bark mb-3">
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
                className="w-full bg-cream border border-amber/20 rounded-xl px-4 py-3 text-base sm:text-sm text-bark placeholder-bark-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-transparent"
              />
              {showResortDropdown && (
                <div className="absolute z-40 mt-2 w-full bg-cream/98 backdrop-blur-md border border-amber/20 rounded-xl max-h-[50vh] sm:max-h-64 overflow-y-auto shadow-xl overscroll-contain -webkit-overflow-scrolling-touch">
                  {(() => {
                    const query = resortSearch.toLowerCase();
                    const filtered = resorts.filter((r) =>
                      r.name.toLowerCase().includes(query)
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="px-4 py-3 text-bark-light/50 text-sm">
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
                        className="flex items-center hover:bg-amber/8 active:bg-amber/12 transition-colors"
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
                            <span className="text-amber">&#9733;</span>
                          ) : (
                            <span className="text-bark-light/30 hover:text-amber/60">&#9734;</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResortSelect(resort)}
                          className="flex-1 text-left pr-4 py-3 text-sm text-bark-light hover:text-bark active:text-bark transition-colors min-h-[44px] flex items-center"
                        >
                          {resort.name}
                        </button>
                      </div>
                    );

                    return (
                      <>
                        {favoriteResorts.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-amber uppercase tracking-wider sticky top-0 bg-cream/98 flex items-center gap-1">
                              <span>&#9733;</span> Favorites
                            </div>
                            {favoriteResorts.map(renderResortRow)}
                          </div>
                        )}
                        {regions.map((region) => (
                          <div key={region}>
                            <div className="px-4 py-2 text-xs font-semibold text-forest/70 uppercase tracking-wider sticky top-0 bg-cream/98">
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
            <div className="flex-1 h-px bg-amber/20" />
            <span className="text-bark-light/50 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-amber/20" />
          </div>

          {/* Manual input section */}
          <div className="bg-cream/90 rounded-2xl p-4 sm:p-6 border border-amber/15 shadow-md card-hover">
            <h2 className="font-heading text-base sm:text-lg font-semibold text-bark mb-3">
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
                  className="flex-1 bg-cream border border-amber/20 rounded-xl px-4 py-3 text-base sm:text-sm text-bark placeholder-bark-light/40 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setUnit(unit === "F" ? "C" : "F")}
                  className="bg-amber/10 hover:bg-amber/20 active:bg-amber/25 border border-amber/20 rounded-xl px-4 py-3 text-bark font-medium transition-colors min-w-[60px] min-h-[48px]"
                >
                  °{unit}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-forest hover:bg-forest-dark active:bg-forest-dark text-white font-medium py-3.5 sm:py-3 px-6 rounded-xl transition-colors min-h-[48px]"
              >
                Get Recommendation
              </button>
            </form>
          </div>
        </>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* === HERO: Wax Recommendation === */}
      {recommendation && currentTemp && (
        <div className="bg-cream/95 rounded-2xl p-5 sm:p-7 border border-amber/20 shadow-lg space-y-4 sm:space-y-5">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-bark">
              Recommended Wax
            </h2>
            <div className="text-right text-xs sm:text-sm text-bark-light/70 flex-shrink-0">
              {locationName && <div className="truncate max-w-[140px] sm:max-w-none">{locationName}</div>}
              <div>
                {currentTemp.f}\u00B0F / {currentTemp.c}\u00B0C
              </div>
            </div>
          </div>

          {/* Wax color swatch + name — HERO element */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-lg flex-shrink-0 ring-2 ring-white/50"
              style={{ backgroundColor: recommendation.colorHex }}
            />
            <div>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-bark leading-tight">
                {recommendation.color} Wax
              </div>
              <div className="text-bark-light text-sm mt-0.5">{recommendation.name}</div>
            </div>
          </div>

          {/* Temp range */}
          <div className="bg-cream-dark/60 rounded-xl p-3 text-sm text-bark-light">
            <span className="font-semibold text-bark">Range:</span>{" "}
            {recommendation.tempRangeF} ({recommendation.tempRangeC})
          </div>

          {/* Condition note */}
          {recommendation.conditionNote && (
            <div className="bg-amber/8 border border-amber/15 rounded-xl p-3 text-sm text-bark-light leading-relaxed">
              {recommendation.conditionNote}
            </div>
          )}

          {/* Description */}
          <p className="text-bark-light text-sm leading-relaxed">
            {recommendation.description}
          </p>

          {/* Product range selector */}
          <div>
            <h3 className="font-heading text-sm font-semibold text-bark mb-2">
              Product Range
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(Object.keys(productRangeLabels) as ProductRange[]).map(
                (range) => (
                  <button
                    key={range}
                    onClick={() => setProductRange(range)}
                    className={`py-2 px-2.5 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[40px] ${
                      productRange === range
                        ? "bg-amber text-white ring-2 ring-amber/30 shadow-md shadow-amber/10"
                        : "bg-cream-dark/60 text-bark-light hover:bg-cream-dark hover:text-bark active:bg-cream-dark"
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
            <h3 className="font-heading text-sm font-semibold text-bark mb-2">
              Suggested Products
            </h3>
            <ul className="space-y-1.5">
              {recommendation.products[productRange].map((product) => (
                <li
                  key={product}
                  className="text-bark-light text-sm flex items-center gap-2"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: recommendation.colorHex }}
                  />
                  {product}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Forecast mode toggle + Weather Widget */}
      {weatherConditions && (
        <>
          {tomorrowConditions && (
            <div className="flex gap-2">
              <button
                onClick={() => switchForecastMode("current")}
                className={`flex-1 py-3 sm:py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  forecastMode === "current"
                    ? "bg-forest text-white shadow-md"
                    : "bg-cream-dark/60 text-bark-light hover:bg-cream-dark hover:text-bark active:bg-cream-dark"
                }`}
              >
                Current Conditions
              </button>
              <button
                onClick={() => switchForecastMode("tomorrow")}
                className={`flex-1 py-3 sm:py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                  forecastMode === "tomorrow"
                    ? "bg-forest text-white shadow-md"
                    : "bg-cream-dark/60 text-bark-light hover:bg-cream-dark hover:text-bark active:bg-cream-dark"
                }`}
              >
                Tomorrow&#39;s Forecast
              </button>
            </div>
          )}
          <WeatherWidget
            conditions={activeConditions!}
            mode={forecastMode}
            tempLow={forecastMode === "tomorrow" ? tomorrowTempLow ?? undefined : undefined}
          />
        </>
      )}

      {/* Quiver Selector — Collapsible */}
      {quiver && currentTemp && (
        <div className="bg-cream/90 rounded-2xl border border-amber/15 shadow-md overflow-hidden">
          <button
            onClick={() => setQuiverOpen(!quiverOpen)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
          >
            <div>
              <h2 className="font-heading text-base sm:text-lg font-semibold text-bark">
                Quiver Selector
              </h2>
              <span className="text-xs sm:text-sm text-bark-light/60">{quiver.condition}</span>
            </div>
            <svg
              className={`w-5 h-5 text-bark-light/50 transition-transform duration-200 ${quiverOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {quiverOpen && (
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
              <p className="text-bark-light text-sm leading-relaxed">{quiver.description}</p>

              {/* Ski / Snowboard toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDiscipline("ski")}
                  className={`flex-1 py-3 sm:py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    discipline === "ski"
                      ? "bg-forest text-white shadow-md"
                      : "bg-cream-dark/60 text-bark-light hover:bg-cream-dark hover:text-bark active:bg-cream-dark"
                  }`}
                >
                  Skis
                </button>
                <button
                  onClick={() => setDiscipline("snowboard")}
                  className={`flex-1 py-3 sm:py-2.5 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                    discipline === "snowboard"
                      ? "bg-forest text-white shadow-md"
                      : "bg-cream-dark/60 text-bark-light hover:bg-cream-dark hover:text-bark active:bg-cream-dark"
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
                    className="bg-cream-dark/50 rounded-xl p-3 sm:p-4 space-y-2"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <h3 className="text-bark font-semibold text-sm">
                        {option.name}
                      </h3>
                      <span className="text-forest text-xs font-medium flex-shrink-0 text-right">
                        {option.bestFor}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="text-bark-light/60">
                        Length:{" "}
                        <span className="text-bark-light">{option.length}</span>
                      </div>
                      <div className="text-bark-light/60">
                        Waist:{" "}
                        <span className="text-bark-light">{option.waistWidth}</span>
                      </div>
                      <div className="text-bark-light/60">
                        Shape:{" "}
                        <span className="text-bark-light">{option.shape}</span>
                      </div>
                      <div className="text-bark-light/60">
                        Camber:{" "}
                        <span className="text-bark-light">{option.camber}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
