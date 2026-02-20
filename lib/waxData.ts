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
    name: "Polar / Extra Cold",
    color: "Green",
    colorHex: "#22c55e",
    tempRangeF: "Below 10°F",
    tempRangeC: "Below -12°C",
    description:
      "Extremely cold conditions with dry, abrasive snow. Use a hard, cold-rated plant-based wax for maximum glide on frigid crystals.",
    products: {
      hotWax: ["mountainflow Hot Wax Cold (-5 to 15°F)"],
      raceWax: ["mountainflow Race Wax Cold (-5 to 15°F)"],
      quickWax: ["mountainflow Quick Wax Cool (15 to 30°F)"],
    },
  },
  {
    name: "Cold",
    color: "Blue",
    colorHex: "#3b82f6",
    tempRangeF: "10°F to 23°F",
    tempRangeC: "-12°C to -5°C",
    description:
      "Cold, dry snow conditions. A medium-hard plant-based wax that performs well on packed powder and groomed trails in cold weather.",
    products: {
      hotWax: [
        "mountainflow Hot Wax Cold (-5 to 15°F)",
        "mountainflow Hot Wax Cool (10 to 25°F)",
        "mountainflow Hot Wax All-Temp (8 to 30°F)",
      ],
      raceWax: [
        "mountainflow Race Wax Cold (-5 to 15°F)",
        "mountainflow Race Wax Cool (10 to 25°F)",
      ],
      quickWax: ["mountainflow Quick Wax Cool (15 to 30°F)"],
    },
  },
  {
    name: "Medium",
    color: "Violet",
    colorHex: "#8b5cf6",
    tempRangeF: "23°F to 32°F",
    tempRangeC: "-5°C to 0°C",
    description:
      "Transitional temperatures around freezing. A versatile, all-around plant-based wax that handles a mix of snow conditions well.",
    products: {
      hotWax: [
        "mountainflow Hot Wax All-Temp (8 to 30°F)",
        "mountainflow Hot Wax Cool (10 to 25°F)",
      ],
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
    tempRangeF: "32°F to 41°F",
    tempRangeC: "0°C to 5°C",
    description:
      "Above freezing with wet, slushy snow. A soft plant-based wax that repels moisture and prevents suction on warm snow.",
    products: {
      hotWax: ["mountainflow Hot Wax Warm (20 to 36°F)"],
      raceWax: ["mountainflow Race Wax Warm (20 to 36°F)"],
      quickWax: ["mountainflow Quick Wax Warm (25 to 40°F)"],
    },
  },
  {
    name: "Very Warm",
    color: "Yellow",
    colorHex: "#eab308",
    tempRangeF: "Above 41°F",
    tempRangeC: "Above 5°C",
    description:
      "Spring-like, very warm conditions with saturated, wet snow. Use the warmest plant-based wax for maximum water repellency and glide.",
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
  if (tempF < 10) base = waxTypes[0];
  else if (tempF < 23) base = waxTypes[1];
  else if (tempF < 32) base = waxTypes[2];
  else if (tempF < 41) base = waxTypes[3];
  else base = waxTypes[4];

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
