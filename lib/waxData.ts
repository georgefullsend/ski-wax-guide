export type ProductRange = "hotWax" | "raceWax" | "quickWax";

export interface WaxRecommendation {
  name: string;
  color: string;
  colorHex: string;
  tempRangeF: string;
  tempRangeC: string;
  description: string;
  products: Record<ProductRange, string[]>;
  conditionNote?: string;
}

export const productRangeLabels: Record<ProductRange, string> = {
  hotWax: "Hot Wax",
  raceWax: "Race Wax",
  quickWax: "Quick Wax",
};

const waxTypes: WaxRecommendation[] = [
  {
    name: "Cold",
    color: "Green",
    colorHex: "#6fcf6a",
    tempRangeF: "-5°F to 15°F",
    tempRangeC: "-21°C to -9°C",
    description:
      "Extremely cold, dry snow. A hard plant-based wax for maximum glide on frigid, abrasive crystals.",
    products: {
      hotWax: ["mountainflow Hot Wax Cold (-5 to 15°F)"],
      raceWax: ["mountainflow Race Wax Cold (-5 to 15°F)"],
      quickWax: ["mountainflow Quick Wax Cool (15 to 30°F)"],
    },
  },
  {
    name: "Cool",
    color: "Blue",
    colorHex: "#3b82f6",
    tempRangeF: "10°F to 25°F",
    tempRangeC: "-12°C to -4°C",
    description:
      "Cold, dry snow conditions. A medium-hard plant-based wax that performs well on packed powder and groomed trails.",
    products: {
      hotWax: ["mountainflow Hot Wax Cool (10 to 25°F)"],
      raceWax: ["mountainflow Race Wax Cool (10 to 25°F)"],
      quickWax: ["mountainflow Quick Wax Cool (15 to 30°F)"],
    },
  },
  {
    name: "All-Temp",
    color: "Yellow",
    colorHex: "#eab308",
    tempRangeF: "8°F to 30°F",
    tempRangeC: "-13°C to -1°C",
    description:
      "Versatile, all-around plant-based wax that handles a wide range of conditions. Great when temperatures are variable.",
    products: {
      hotWax: ["mountainflow Hot Wax All-Temp (8 to 30°F)"],
      raceWax: [
        "mountainflow Race Wax Cool (10 to 25°F)",
        "mountainflow Race Wax Warm (20 to 36°F)",
      ],
      quickWax: [
        "mountainflow Quick Wax Cool (15 to 30°F)",
        "mountainflow Quick Wax Warm (25 to 40°F)",
      ],
    },
  },
  {
    name: "Warm",
    color: "Red",
    colorHex: "#ef4444",
    tempRangeF: "20°F to 36°F",
    tempRangeC: "-7°C to 2°C",
    description:
      "Near or above freezing with wet, slushy snow. A soft plant-based wax that repels moisture and prevents suction.",
    products: {
      hotWax: ["mountainflow Hot Wax Warm (20 to 36°F)"],
      raceWax: ["mountainflow Race Wax Warm (20 to 36°F)"],
      quickWax: ["mountainflow Quick Wax Warm (25 to 40°F)"],
    },
  },
];

export function getWaxRecommendation(
  tempF: number,
  conditions?: import("./weatherTypes").WeatherConditions
): WaxRecommendation {
  let base: WaxRecommendation;
  if (tempF < 8) base = waxTypes[0];       // Cold
  else if (tempF < 18) base = waxTypes[1];  // Cool
  else if (tempF < 26) base = waxTypes[2];  // All-Temp
  else base = waxTypes[3];                  // Warm

  if (!conditions) return base;

  const note = buildConditionNote(conditions);
  return note ? { ...base, conditionNote: note } : base;
}

function buildConditionNote(
  conditions: import("./weatherTypes").WeatherConditions
): string | undefined {
  const { weatherCode, windSpeedMph, isDay } = conditions;
  const parts: string[] = [];

  if (weatherCode <= 1 && isDay) {
    parts.push(
      "Sunny conditions — snow surface is warmer than air temp. Consider going one step warmer."
    );
  } else if (weatherCode === 2 && isDay) {
    parts.push(
      "Partial sun — snow surface is slightly warmer than air temp."
    );
  }

  if (windSpeedMph >= 15) {
    parts.push(
      "Strong wind cools the snow surface significantly — lean toward a colder wax."
    );
  } else if (windSpeedMph >= 5) {
    parts.push("Moderate wind lowers effective snow temperature slightly.");
  }

  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86)
  ) {
    parts.push("Active snowfall keeps the surface cold — favor colder wax.");
  } else if (
    (weatherCode >= 61 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    parts.push("Rain or wet conditions — use a warmer, moisture-repelling wax.");
  }

  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
