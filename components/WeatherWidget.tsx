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
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
        {isTomorrow ? "Tomorrow\u2019s Forecast" : "Current Conditions"}
      </h2>

      {/* Main condition row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-ink font-medium text-sm">{label}</span>
        </div>
        {isTomorrow && tempLow != null ? (
          <div className="text-right">
            <span className="text-lg font-bold text-ink">
              {Math.round(conditions.tempF)}°F
            </span>
            <span className="text-ink-muted text-xs block">
              Low: {tempLow}°F
            </span>
          </div>
        ) : (
          <span className="text-lg font-bold text-ink">
            {Math.round(conditions.tempF)}°F
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-surface-alt rounded-lg px-3 py-2">
          <span className="text-ink-muted text-xs">Wind: </span>
          <span className="text-ink-light text-xs">
            {Math.round(conditions.windSpeedMph)} mph {windDir}
          </span>
          <span className="text-ink-muted/60 text-xs block">{windLabel}</span>
        </div>
        <div className="bg-surface-alt rounded-lg px-3 py-2">
          <span className="text-ink-muted text-xs">Precip: </span>
          <span className="text-ink-light text-xs">{conditions.precipitation} mm</span>
        </div>
        <div className="bg-surface-alt rounded-lg px-3 py-2">
          <span className="text-ink-muted text-xs">Cloud: </span>
          <span className="text-ink-light text-xs">{isTomorrow ? "\u2014" : `${conditions.cloudCover}%`}</span>
        </div>
        <div className="bg-surface-alt rounded-lg px-3 py-2">
          <span className="text-ink-muted text-xs">Humid: </span>
          <span className="text-ink-light text-xs">{isTomorrow ? "\u2014" : `${conditions.humidity}%`}</span>
        </div>
      </div>

      {/* Effective temp */}
      <div className="bg-surface-alt rounded-lg p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-ink-muted text-xs font-medium">
            Snow Surface Estimate
          </span>
          <span className="text-ink font-bold text-sm flex-shrink-0">
            {effectiveTempF}°F / {effectiveTempC}°C
          </span>
        </div>
        <p className="text-ink-muted/70 text-xs">{explanation}</p>
      </div>
    </div>
  );
}
