import type { ForecastDay } from "@/lib/weatherTypes";
import { getWeatherIcon } from "@/lib/weatherTypes";

interface ForecastCardsProps {
  days: ForecastDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ForecastCards({ days, selectedIndex, onSelect }: ForecastCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {days.map((day, i) => (
        <button
          key={day.date}
          onClick={() => onSelect(i)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all active:scale-[0.97] ${
            selectedIndex === i
              ? "bg-white/15 border-mf-blue/40 ring-2 ring-mf-blue/30"
              : "bg-white/10 border-white/[0.12]"
          }`}
        >
          <span className="text-white/60 text-xs font-medium">{day.dayLabel}</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: day.waxRecommendation.colorHex }}
            />
            <span className="text-white/70 text-xs">{day.waxRecommendation.color}</span>
          </div>
          <span className="text-2xl">{getWeatherIcon(day.conditions.weatherCode, true)}</span>
          <span className="text-white text-sm font-semibold">
            {day.tempHighF}° / {day.tempLowF}°
          </span>
        </button>
      ))}
    </div>
  );
}
