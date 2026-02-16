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
}

export default function WeatherWidget({ conditions }: WeatherWidgetProps) {
  const effectiveTempF = Math.round(calcEffectiveTemp(conditions));
  const effectiveTempC = Math.round(fahrenheitToCelsius(effectiveTempF));
  const explanation = getEffectiveTempExplanation(conditions);
  const icon = getWeatherIcon(conditions.weatherCode, conditions.isDay);
  const label = getWeatherLabel(conditions.weatherCode);
  const windDir = getWindDirectionLabel(conditions.windDirection);
  const windLabel = getWindLabel(conditions.windSpeedMph);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-mf-blue/30 space-y-4 card-hover">
      <h2 className="text-lg font-semibold text-white">Current Conditions</h2>

      {/* Main condition row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <span className="text-white font-medium">{label}</span>
        </div>
        <span className="text-2xl font-bold text-white">
          {Math.round(conditions.tempF)}°F
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50">💨 Wind: </span>
          <span className="text-white/90">
            {Math.round(conditions.windSpeedMph)} mph {windDir}
          </span>
          <span className="text-white/40 text-xs block">{windLabel}</span>
        </div>
        <div className="bg-white/5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50">❄️ Precip: </span>
          <span className="text-white/90">{conditions.precipitation} mm</span>
        </div>
        <div className="bg-white/5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50">☁️ Cloud: </span>
          <span className="text-white/90">{conditions.cloudCover}%</span>
        </div>
        <div className="bg-white/5 rounded-xl px-3 py-2 transition-colors duration-150 hover:bg-white/10">
          <span className="text-white/50">💧 Humid: </span>
          <span className="text-white/90">{conditions.humidity}%</span>
        </div>
      </div>

      {/* Effective temp */}
      <div className="bg-mf-blue/15 rounded-xl p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm font-medium">
            Snow Surface Estimate
          </span>
          <span className="text-white font-bold">
            {effectiveTempF}°F / {effectiveTempC}°C
          </span>
        </div>
        <p className="text-white/50 text-xs">{explanation}</p>
      </div>
    </div>
  );
}
