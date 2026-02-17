import {
  type WeatherConditions,
  getWeatherLabel,
  getWeatherIcon,
  getWindLabel,
  getWindDirectionLabel,
  calcEffectiveTemp,
  getEffectiveTempExplanation,
} from "@/lib/weatherTypes";
import { fahrenheitToCelsius } from "@/lib/waxData";

interface WeatherWidgetProps {
  conditions: WeatherConditions;
  mode?: "current" | "tomorrow";
  tempLow?: number;
}

export default function WeatherWidget({ conditions, mode = "current", tempLow }: WeatherWidgetProps) {
  const isTomorrow = mode === "tomorrow";
  const effectiveTempF = Math.round(calcEffectiveTemp(conditions));
  const effectiveTempC = Math.round(fahrenheitToCelsius(effectiveTempF));
  const explanation = getEffectiveTempExplanation(conditions);
  const icon = getWeatherIcon(conditions.weatherCode, conditions.isDay);
  const label = getWeatherLabel(conditions.weatherCode);
  const windDir = getWindDirectionLabel(conditions.windDirection);
  const windLabel = getWindLabel(conditions.windSpeedMph);

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-cyan/20 space-y-3 sm:space-y-4 card-hover">
      <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
        {isTomorrow ? "Tomorrow\u2019s Forecast" : "Current Conditions"}
      </h2>

      {/* Main condition row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl">{icon}</span>
          <span className="text-white font-bold text-sm sm:text-base">{label}</span>
        </div>
        {isTomorrow && tempLow != null ? (
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-white">
              {Math.round(conditions.tempF)}°F
            </span>
            <span className="text-white/50 text-xs sm:text-sm block">
              Low: {tempLow}°F
            </span>
          </div>
        ) : (
          <span className="text-xl sm:text-2xl font-black text-white">
            {Math.round(conditions.tempF)}°F
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
        <div className="bg-zinc-800 rounded-lg px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-zinc-700">
          <span className="text-white/50 text-xs sm:text-sm">Wind: </span>
          <span className="text-white/90 text-xs sm:text-sm">
            {Math.round(conditions.windSpeedMph)} mph {windDir}
          </span>
          <span className="text-white/40 text-xs block">{windLabel}</span>
        </div>
        <div className="bg-zinc-800 rounded-lg px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-zinc-700">
          <span className="text-white/50 text-xs sm:text-sm">Precip: </span>
          <span className="text-white/90 text-xs sm:text-sm">{conditions.precipitation} mm</span>
        </div>
        <div className="bg-zinc-800 rounded-lg px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-zinc-700">
          <span className="text-white/50 text-xs sm:text-sm">Cloud: </span>
          <span className="text-white/90 text-xs sm:text-sm">{isTomorrow ? "\u2014" : `${conditions.cloudCover}%`}</span>
        </div>
        <div className="bg-zinc-800 rounded-lg px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-zinc-700">
          <span className="text-white/50 text-xs sm:text-sm">Humid: </span>
          <span className="text-white/90 text-xs sm:text-sm">{isTomorrow ? "\u2014" : `${conditions.humidity}%`}</span>
        </div>
      </div>

      {/* Effective temp */}
      <div className="bg-neon/15 rounded-lg p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white/70 text-xs sm:text-sm font-bold uppercase tracking-wide">
            Snow Surface Estimate
          </span>
          <span className="text-white font-black text-sm sm:text-base flex-shrink-0">
            {effectiveTempF}°F / {effectiveTempC}°C
          </span>
        </div>
        <p className="text-white/50 text-xs">{explanation}</p>
      </div>
    </div>
  );
}
