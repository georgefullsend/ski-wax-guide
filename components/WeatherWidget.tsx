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
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-mf-blue/30 space-y-3 sm:space-y-4 liquid-card card-hover">
      <h2 className="text-base sm:text-lg font-semibold text-white">
        {isTomorrow ? "Tomorrow's Forecast" : "Current Conditions"}
      </h2>

      {/* Main condition row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl">{icon}</span>
          <span className="text-white font-medium text-sm sm:text-base">{label}</span>
        </div>
        {isTomorrow && tempLow != null ? (
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {Math.round(conditions.tempF)}°F
            </span>
            <span className="text-white/50 text-xs sm:text-sm block">
              Low: {tempLow}°F
            </span>
          </div>
        ) : (
          <span className="text-xl sm:text-2xl font-bold text-white">
            {Math.round(conditions.tempF)}°F
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
        <div className="bg-white/5 rounded-xl px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50 text-xs sm:text-sm">💨 Wind: </span>
          <span className="text-white/90 text-xs sm:text-sm">
            {Math.round(conditions.windSpeedMph)} mph {windDir}
          </span>
          <span className="text-white/40 text-xs block">{windLabel}</span>
        </div>
        <div className="bg-white/5 rounded-xl px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50 text-xs sm:text-sm">❄️ Precip: </span>
          <span className="text-white/90 text-xs sm:text-sm">{conditions.precipitation} mm</span>
        </div>
        <div className="bg-white/5 rounded-xl px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50 text-xs sm:text-sm">☁️ Cloud: </span>
          <span className="text-white/90 text-xs sm:text-sm">{isTomorrow ? "—" : `${conditions.cloudCover}%`}</span>
        </div>
        <div className="bg-white/5 rounded-xl px-2.5 sm:px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50 text-xs sm:text-sm">💧 Humid: </span>
          <span className="text-white/90 text-xs sm:text-sm">{isTomorrow ? "—" : `${conditions.humidity}%`}</span>
        </div>
      </div>

      {/* Effective temp */}
      <div className="bg-mf-blue/15 rounded-xl p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-white/70 text-xs sm:text-sm font-medium">
            Snow Surface Estimate
          </span>
          <span className="text-white font-bold text-sm sm:text-base flex-shrink-0">
            {effectiveTempF}°F / {effectiveTempC}°C
          </span>
        </div>
        <p className="text-white/50 text-xs">{explanation}</p>
      </div>
    </div>
  );
}
