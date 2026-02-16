export interface WeatherConditions {
  tempF: number;
  tempC: number;
  windSpeedMph: number;
  windDirection: number;
  cloudCover: number; // 0-100%
  weatherCode: number; // WMO code
  isDay: boolean;
  precipitation: number; // mm
  humidity: number; // 0-100%
}

const weatherLabels: Record<number, string> = {
  0: "Clear",
  1: "Mostly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Light Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Light Freezing Rain",
  67: "Freezing Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Light Showers",
  81: "Showers",
  82: "Heavy Showers",
  85: "Light Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ Hail",
  99: "Thunderstorm w/ Heavy Hail",
};

export function getWeatherLabel(code: number): string {
  return weatherLabels[code] ?? "Unknown";
}

export function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if (code === 1) return isDay ? "🌤" : "🌙";
  if (code === 2) return isDay ? "⛅" : "☁️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫";
  if (code >= 51 && code <= 57) return "🌧";
  if (code >= 61 && code <= 67) return "🌧";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦";
  if (code >= 85 && code <= 86) return "🌨";
  if (code >= 95) return "⛈";
  return "🌡";
}

export function getWindLabel(speedMph: number): string {
  if (speedMph < 5) return "Calm";
  if (speedMph < 15) return "Light";
  if (speedMph < 25) return "Moderate";
  return "Strong";
}

function windDirectionLabel(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return dirs[index];
}

export function getWindDirectionLabel(degrees: number): string {
  return windDirectionLabel(degrees);
}

export function calcEffectiveTemp(conditions: WeatherConditions): number {
  const { tempF, weatherCode, windSpeedMph, isDay } = conditions;

  // Sun offset
  let sunOffset = 0;
  if (weatherCode <= 1) sunOffset = 3;
  else if (weatherCode === 2) sunOffset = 1;
  // overcast/fog (3, 45, 48) = 0

  // Wind offset
  let windOffset = 0;
  if (windSpeedMph >= 15) windOffset = 4;
  else if (windSpeedMph >= 5) windOffset = 2;

  // Precipitation offset
  let precipOffset = 0;
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    precipOffset = -2; // active snowfall
  } else if (
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    precipOffset = 2; // rain / freezing rain
  }

  // Night offset
  const nightOffset = isDay ? 0 : -1;

  return tempF + sunOffset - windOffset + precipOffset + nightOffset;
}

export function getEffectiveTempExplanation(
  conditions: WeatherConditions
): string {
  const parts: string[] = [];
  const { weatherCode, windSpeedMph, isDay } = conditions;

  if (weatherCode <= 1)
    parts.push("Sun warms the snow surface");
  else if (weatherCode === 2)
    parts.push("Partial sun slightly warms snow surface");

  if (windSpeedMph >= 15)
    parts.push("strong wind cools snow surface significantly");
  else if (windSpeedMph >= 5)
    parts.push("wind chill lowers effective temp");

  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    parts.push("active snowfall cools the surface");
  } else if (
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    parts.push("rain warms the surface");
  }

  if (!isDay) parts.push("nighttime cooling");

  if (parts.length === 0) return "Conditions are neutral — air temp ≈ snow surface temp";

  // Capitalize first part
  parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  return parts.join(", ");
}
