export type ProductRange =
  | "performance"
  | "race"
  | "quick"
  | "nonPetroleum"
  | "nonFluorinated";

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
  performance: "Performance",
  race: "Race",
  quick: "Quick",
  nonPetroleum: "Non-Petroleum",
  nonFluorinated: "Non-Fluorinated",
};

const waxTypes: WaxRecommendation[] = [
  {
    name: "Polar / Extra Cold",
    color: "Green",
    colorHex: "#22c55e",
    tempRangeF: "Below 10°F",
    tempRangeC: "Below -12°C",
    description:
      "Extremely cold conditions. Use a hard, cold-rated wax for dry, abrasive snow. These waxes have high fluorocarbon content for maximum glide on frigid crystals.",
    products: {
      performance: ["Swix CH4X Cold", "Toko NF Hot Wax Green", "Dominator Zoom Hyper Cold"],
      race: ["Swix HF4X Cold", "Toko HF Hot Wax Green", "Dominator Race Polar"],
      quick: ["Swix F4 Easy Glide", "Toko Express 2.0", "Dominator Slick"],
      nonPetroleum: ["mountainflow Hot Wax Cold", "Purl Ultra Cold", "DPS Phantom Cold"],
      nonFluorinated: ["Swix TS4 Black Cold", "Toko NF Hot Wax Green", "Rex Blue"],
    },
  },
  {
    name: "Cold",
    color: "Blue",
    colorHex: "#3b82f6",
    tempRangeF: "10°F to 23°F",
    tempRangeC: "-12°C to -5°C",
    description:
      "Cold, dry snow conditions. A medium-hard wax that performs well on packed powder and groomed trails in cold weather.",
    products: {
      performance: ["Swix CH6X Blue", "Toko NF Hot Wax Blue", "Dominator Zoom Mid"],
      race: ["Swix HF6X Blue", "Toko HF Hot Wax Blue", "Dominator Race Cold"],
      quick: ["Swix F4 Easy Glide", "Toko Express 2.0", "Dominator Slick"],
      nonPetroleum: ["mountainflow Hot Wax Cold", "Purl Cold", "DPS Phantom Cold"],
      nonFluorinated: ["Swix TS6 Black", "Toko NF Hot Wax Blue", "Rex Blue Special"],
    },
  },
  {
    name: "Medium",
    color: "Violet",
    colorHex: "#8b5cf6",
    tempRangeF: "23°F to 32°F",
    tempRangeC: "-5°C to 0°C",
    description:
      "Transitional temperatures around freezing. A versatile, all-around wax that handles a mix of snow conditions well.",
    products: {
      performance: ["Swix CH7X Violet", "Toko NF Hot Wax Red", "Dominator Zoom"],
      race: ["Swix HF7X Violet", "Toko HF Hot Wax Red", "Dominator Race Mid"],
      quick: ["Swix F4 Easy Glide", "Toko Express 2.0", "Dominator Slick"],
      nonPetroleum: ["mountainflow Hot Wax All-Temp", "Purl All-Temp", "DPS Phantom All-Temp"],
      nonFluorinated: ["Swix TS7 Violet", "Toko NF Hot Wax Red", "Rex Glide Violet"],
    },
  },
  {
    name: "Warm",
    color: "Red",
    colorHex: "#ef4444",
    tempRangeF: "32°F to 41°F",
    tempRangeC: "0°C to 5°C",
    description:
      "Above freezing with wet, slushy snow. Use a soft wax that repels moisture and prevents suction on warm snow.",
    products: {
      performance: ["Swix CH8X Red", "Toko NF Hot Wax Yellow", "Dominator Zoom Hyper Warm"],
      race: ["Swix HF8X Red", "Toko HF Hot Wax Yellow", "Dominator Race Warm"],
      quick: ["Swix F4 Liquid Easy Glide", "Toko Express Maxi", "Dominator Slick Warm"],
      nonPetroleum: ["mountainflow Hot Wax Warm", "Purl Warm", "DPS Phantom Warm"],
      nonFluorinated: ["Swix TS8 Red", "Toko NF Hot Wax Yellow", "Rex Glide Warm"],
    },
  },
  {
    name: "Very Warm",
    color: "Yellow",
    colorHex: "#eab308",
    tempRangeF: "Above 41°F",
    tempRangeC: "Above 5°C",
    description:
      "Spring-like, very warm conditions with saturated, wet snow. Use the softest wax available to maximize water repellency and glide.",
    products: {
      performance: ["Swix CH10X Yellow", "Toko NF Hot Wax Yellow", "Dominator Zoom Hyper Wet"],
      race: ["Swix HF10X Yellow", "Toko HF Hot Wax Yellow", "Dominator Race Spring"],
      quick: ["Swix F4 Liquid Easy Glide", "Toko Express Maxi", "Dominator Slick Warm"],
      nonPetroleum: ["mountainflow Hot Wax Warm", "Purl Spring", "DPS Phantom Warm"],
      nonFluorinated: ["Swix TS10 Yellow", "Toko NF Hot Wax Yellow", "Rex Glide Yellow"],
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
