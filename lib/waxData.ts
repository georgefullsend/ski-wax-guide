export interface WaxRecommendation {
  name: string;
  color: string;
  colorHex: string;
  tempRangeF: string;
  tempRangeC: string;
  description: string;
  products: string[];
}

const waxTypes: WaxRecommendation[] = [
  {
    name: "Polar / Extra Cold",
    color: "Green",
    colorHex: "#22c55e",
    tempRangeF: "Below 10°F",
    tempRangeC: "Below -12°C",
    description:
      "Extremely cold conditions. Use a hard, cold-rated wax for dry, abrasive snow. These waxes have high fluorocarbon content for maximum glide on frigid crystals.",
    products: [
      "Swix CH4X Cold",
      "Toko NF Hot Wax Green",
      "Dominator Zoom Hyper Cold",
    ],
  },
  {
    name: "Cold",
    color: "Blue",
    colorHex: "#3b82f6",
    tempRangeF: "10°F to 23°F",
    tempRangeC: "-12°C to -5°C",
    description:
      "Cold, dry snow conditions. A medium-hard wax that performs well on packed powder and groomed trails in cold weather.",
    products: [
      "Swix CH6X Blue",
      "Toko NF Hot Wax Blue",
      "Dominator Zoom Mid",
    ],
  },
  {
    name: "Medium",
    color: "Violet",
    colorHex: "#8b5cf6",
    tempRangeF: "23°F to 32°F",
    tempRangeC: "-5°C to 0°C",
    description:
      "Transitional temperatures around freezing. A versatile, all-around wax that handles a mix of snow conditions well.",
    products: [
      "Swix CH7X Violet",
      "Toko NF Hot Wax Red",
      "Dominator Zoom",
    ],
  },
  {
    name: "Warm",
    color: "Red",
    colorHex: "#ef4444",
    tempRangeF: "32°F to 41°F",
    tempRangeC: "0°C to 5°C",
    description:
      "Above freezing with wet, slushy snow. Use a soft wax that repels moisture and prevents suction on warm snow.",
    products: [
      "Swix CH8X Red",
      "Toko NF Hot Wax Yellow",
      "Dominator Zoom Hyper Warm",
    ],
  },
  {
    name: "Very Warm",
    color: "Yellow",
    colorHex: "#eab308",
    tempRangeF: "Above 41°F",
    tempRangeC: "Above 5°C",
    description:
      "Spring-like, very warm conditions with saturated, wet snow. Use the softest wax available to maximize water repellency and glide.",
    products: [
      "Swix CH10X Yellow",
      "Toko NF Hot Wax Yellow",
      "Dominator Zoom Hyper Wet",
    ],
  },
];

export function getWaxRecommendation(tempF: number): WaxRecommendation {
  if (tempF < 10) return waxTypes[0];
  if (tempF < 23) return waxTypes[1];
  if (tempF < 32) return waxTypes[2];
  if (tempF < 41) return waxTypes[3];
  return waxTypes[4];
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
