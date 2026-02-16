export type Discipline = "ski" | "snowboard";

export interface QuiverOption {
  name: string;
  length: string;
  waistWidth: string;
  shape: string;
  camber: string;
  bestFor: string;
}

export interface ConditionQuiver {
  condition: string;
  description: string;
  ski: QuiverOption[];
  snowboard: QuiverOption[];
}

const quiverByCondition: ConditionQuiver[] = [
  {
    condition: "Icy / Hard Pack",
    description:
      "Firm, icy conditions call for narrow, stiff equipment with aggressive edge hold.",
    ski: [
      {
        name: "Carving Ski",
        length: "165–175 cm",
        waistWidth: "68–74 mm",
        shape: "Traditional camber, narrow waist",
        camber: "Full camber",
        bestFor: "Groomed hardpack and icy runs",
      },
      {
        name: "GS Race Ski",
        length: "175–185 cm",
        waistWidth: "65–70 mm",
        shape: "Long turn radius, narrow profile",
        camber: "Full camber with plate",
        bestFor: "High-speed carving on ice",
      },
      {
        name: "Frontside All-Mountain",
        length: "170–178 cm",
        waistWidth: "78–85 mm",
        shape: "Directional, slight tip rocker",
        camber: "Camber dominant with tip rocker",
        bestFor: "Mixed groomed and firm off-piste",
      },
    ],
    snowboard: [
      {
        name: "Aggressive Carver",
        length: "158–162 cm",
        waistWidth: "248–252 mm",
        shape: "Directional, narrow waist",
        camber: "Full camber",
        bestFor: "Edge hold on icy groomers",
      },
      {
        name: "Alpine Freecarve",
        length: "160–168 cm",
        waistWidth: "240–248 mm",
        shape: "Directional, tapered tail",
        camber: "Full camber",
        bestFor: "High-speed carving on hardpack",
      },
      {
        name: "All-Mountain Stiff",
        length: "156–160 cm",
        waistWidth: "250–255 mm",
        shape: "Directional twin",
        camber: "Camber with slight tip rocker",
        bestFor: "Varied groomed conditions",
      },
    ],
  },
  {
    condition: "Packed Powder / Groomed",
    description:
      "Ideal all-around conditions. Medium-width equipment with versatile profiles performs best.",
    ski: [
      {
        name: "All-Mountain",
        length: "170–180 cm",
        waistWidth: "88–95 mm",
        shape: "Directional, tip and tail rocker",
        camber: "Rocker-camber-rocker",
        bestFor: "Versatile on-piste and off-piste",
      },
      {
        name: "Frontside Charger",
        length: "172–180 cm",
        waistWidth: "82–90 mm",
        shape: "Directional, slight tail rocker",
        camber: "Camber dominant",
        bestFor: "Fast groomed cruising",
      },
      {
        name: "Playful Mid-Fat",
        length: "168–176 cm",
        waistWidth: "90–98 mm",
        shape: "Directional twin",
        camber: "Rocker-camber-rocker",
        bestFor: "All-mountain freestyle",
      },
    ],
    snowboard: [
      {
        name: "All-Mountain Twin",
        length: "155–159 cm",
        waistWidth: "252–256 mm",
        shape: "True twin",
        camber: "Camber with rocker tips",
        bestFor: "Versatile resort riding",
      },
      {
        name: "Directional All-Mountain",
        length: "157–161 cm",
        waistWidth: "254–258 mm",
        shape: "Directional, setback stance",
        camber: "Hybrid camber",
        bestFor: "Charging groomers and side hits",
      },
      {
        name: "Freestyle All-Mountain",
        length: "153–157 cm",
        waistWidth: "250–254 mm",
        shape: "True twin",
        camber: "Flat-to-rocker",
        bestFor: "Park laps and groomer tricks",
      },
    ],
  },
  {
    condition: "Fresh / Powder",
    description:
      "Deep or soft snow demands wide, rockered equipment with surf-like float.",
    ski: [
      {
        name: "Powder Ski",
        length: "178–188 cm",
        waistWidth: "108–120 mm",
        shape: "Directional, heavy tip rocker, tapered tail",
        camber: "Full rocker or rocker-camber",
        bestFor: "Deep powder days",
      },
      {
        name: "Big Mountain Charger",
        length: "180–190 cm",
        waistWidth: "100–110 mm",
        shape: "Directional, moderate taper",
        camber: "Rocker-camber-rocker",
        bestFor: "Big lines in variable snow",
      },
      {
        name: "Freeride All-Mountain",
        length: "176–184 cm",
        waistWidth: "98–106 mm",
        shape: "Directional, slight twin tip",
        camber: "Rocker-camber-rocker",
        bestFor: "Off-piste with resort versatility",
      },
    ],
    snowboard: [
      {
        name: "Powder Board",
        length: "158–164 cm",
        waistWidth: "262–272 mm",
        shape: "Directional, swallow tail or tapered",
        camber: "Full rocker or camber-rocker",
        bestFor: "Deep powder surfing",
      },
      {
        name: "Freeride Directional",
        length: "159–163 cm",
        waistWidth: "258–264 mm",
        shape: "Directional, setback stance, tapered tail",
        camber: "Camber with rocker nose",
        bestFor: "Backcountry and steep lines",
      },
      {
        name: "Volume-Shifted Short Wide",
        length: "148–154 cm",
        waistWidth: "270–285 mm",
        shape: "Short, wide, directional",
        camber: "Flat-to-rocker",
        bestFor: "Playful pow surfing",
      },
    ],
  },
  {
    condition: "Wet / Spring",
    description:
      "Warm slushy snow benefits from wider, softer-flexing gear that can plane over mush.",
    ski: [
      {
        name: "Soft-Snow All-Mountain",
        length: "172–182 cm",
        waistWidth: "95–105 mm",
        shape: "Directional, tip rocker, light taper",
        camber: "Rocker-camber-rocker",
        bestFor: "Spring slush and corn snow",
      },
      {
        name: "Playful Twin Tip",
        length: "170–178 cm",
        waistWidth: "92–100 mm",
        shape: "Symmetrical twin",
        camber: "Rocker-camber-rocker",
        bestFor: "Park laps and slush bumps",
      },
      {
        name: "Mid-Fat Cruiser",
        length: "174–182 cm",
        waistWidth: "90–98 mm",
        shape: "Directional, slight tail rocker",
        camber: "Rocker-camber",
        bestFor: "Relaxed spring touring",
      },
    ],
    snowboard: [
      {
        name: "Spring Slush Slayer",
        length: "154–160 cm",
        waistWidth: "256–264 mm",
        shape: "Directional twin, mild taper",
        camber: "Flat-to-rocker",
        bestFor: "Slushy groomers and corn snow",
      },
      {
        name: "Surf-Style Board",
        length: "148–155 cm",
        waistWidth: "268–280 mm",
        shape: "Short, wide, directional",
        camber: "Full rocker",
        bestFor: "Playful spring slush surfing",
      },
      {
        name: "All-Mountain Soft Flex",
        length: "155–159 cm",
        waistWidth: "254–258 mm",
        shape: "True twin",
        camber: "Flat camber",
        bestFor: "Park and spring mixed riding",
      },
    ],
  },
];

export function getQuiverRecommendation(tempF: number): ConditionQuiver {
  if (tempF < 23) return quiverByCondition[0]; // Icy / Hard Pack
  if (tempF < 32) return quiverByCondition[1]; // Packed Powder / Groomed
  if (tempF < 38) return quiverByCondition[2]; // Fresh / Powder
  return quiverByCondition[3]; // Wet / Spring
}
