export interface SkiResort {
  name: string;
  region: string;
  lat: number;
  lon: number;
  elevationFt: number; // base area elevation in feet
}

export const resorts: SkiResort[] = [
  // North America
  { name: "Alta, Utah", region: "North America", lat: 40.5884, lon: -111.6386, elevationFt: 8530 },
  { name: "Aspen, Colorado", region: "North America", lat: 39.1911, lon: -106.8175, elevationFt: 7945 },
  { name: "Banff / Lake Louise, Alberta", region: "North America", lat: 51.4254, lon: -116.1773, elevationFt: 5400 },
  { name: "Big Sky, Montana", region: "North America", lat: 45.2833, lon: -111.4014, elevationFt: 7500 },
  { name: "Breckenridge, Colorado", region: "North America", lat: 39.4817, lon: -106.0384, elevationFt: 9600 },
  { name: "Deer Valley, Utah", region: "North America", lat: 40.6374, lon: -111.4783, elevationFt: 6570 },
  { name: "Jackson Hole, Wyoming", region: "North America", lat: 43.5877, lon: -110.8279, elevationFt: 6311 },
  { name: "Killington, Vermont", region: "North America", lat: 43.6045, lon: -72.8201, elevationFt: 3800 },
  { name: "Mammoth Mountain, California", region: "North America", lat: 37.6308, lon: -119.0326, elevationFt: 7953 },
  { name: "Palisades Tahoe, California", region: "North America", lat: 39.1968, lon: -120.2354, elevationFt: 6200 },
  { name: "Park City, Utah", region: "North America", lat: 40.6514, lon: -111.5080, elevationFt: 6900 },
  { name: "Revelstoke, British Columbia", region: "North America", lat: 51.0447, lon: -118.1673, elevationFt: 5620 },
  { name: "Snowbird, Utah", region: "North America", lat: 40.5830, lon: -111.6508, elevationFt: 7760 },
  { name: "Steamboat, Colorado", region: "North America", lat: 40.4572, lon: -106.8045, elevationFt: 6900 },
  { name: "Stowe, Vermont", region: "North America", lat: 44.5303, lon: -72.7814, elevationFt: 1559 },
  { name: "Sun Valley, Idaho", region: "North America", lat: 43.6977, lon: -114.3514, elevationFt: 5750 },
  { name: "Taos, New Mexico", region: "North America", lat: 36.5969, lon: -105.4544, elevationFt: 9207 },
  { name: "Telluride, Colorado", region: "North America", lat: 37.9375, lon: -107.8123, elevationFt: 8725 },
  { name: "Vail, Colorado", region: "North America", lat: 39.6403, lon: -106.3742, elevationFt: 8120 },
  { name: "Whistler Blackcomb, British Columbia", region: "North America", lat: 50.1163, lon: -122.9574, elevationFt: 2214 },

  // Europe
  { name: "Chamonix, France", region: "Europe", lat: 45.9237, lon: 6.8694, elevationFt: 3396 },
  { name: "Cortina d'Ampezzo, Italy", region: "Europe", lat: 46.5369, lon: 12.1356, elevationFt: 3990 },
  { name: "Courchevel, France", region: "Europe", lat: 45.4154, lon: 6.6347, elevationFt: 5905 },
  { name: "Kitzbuhel, Austria", region: "Europe", lat: 47.4492, lon: 12.3922, elevationFt: 2625 },
  { name: "Lech, Austria", region: "Europe", lat: 47.2078, lon: 10.1428, elevationFt: 4757 },
  { name: "Meribel, France", region: "Europe", lat: 45.3968, lon: 6.5654, elevationFt: 4593 },
  { name: "St. Anton, Austria", region: "Europe", lat: 47.1292, lon: 10.2683, elevationFt: 4265 },
  { name: "St. Moritz, Switzerland", region: "Europe", lat: 46.4908, lon: 9.8355, elevationFt: 6089 },
  { name: "Val d'Isere, France", region: "Europe", lat: 45.4486, lon: 6.9806, elevationFt: 6069 },
  { name: "Val Thorens, France", region: "Europe", lat: 45.2980, lon: 6.5840, elevationFt: 7545 },
  { name: "Verbier, Switzerland", region: "Europe", lat: 46.0967, lon: 7.2286, elevationFt: 4921 },
  { name: "Zermatt, Switzerland", region: "Europe", lat: 46.0207, lon: 7.7491, elevationFt: 5315 },

  // Japan
  { name: "Furano, Hokkaido", region: "Japan", lat: 43.3389, lon: 142.3828, elevationFt: 1148 },
  { name: "Hakuba, Nagano", region: "Japan", lat: 36.6983, lon: 137.8322, elevationFt: 2500 },
  { name: "Myoko Kogen, Niigata", region: "Japan", lat: 36.8675, lon: 138.6836, elevationFt: 2460 },
  { name: "Niseko, Hokkaido", region: "Japan", lat: 42.8625, lon: 140.6986, elevationFt: 1312 },
  { name: "Nozawa Onsen, Nagano", region: "Japan", lat: 36.9214, lon: 138.6260, elevationFt: 2100 },
  { name: "Shiga Kogen, Nagano", region: "Japan", lat: 36.7714, lon: 138.5233, elevationFt: 5250 },

  // Southern Hemisphere
  { name: "Portillo, Chile", region: "Southern Hemisphere", lat: -32.8356, lon: -70.1308, elevationFt: 9350 },
  { name: "Queenstown (Remarkables), New Zealand", region: "Southern Hemisphere", lat: -45.0540, lon: 168.8178, elevationFt: 5505 },
  { name: "Thredbo, Australia", region: "Southern Hemisphere", lat: -36.5053, lon: 148.3044, elevationFt: 4380 },
  { name: "Valle Nevado, Chile", region: "Southern Hemisphere", lat: -33.3556, lon: -70.2517, elevationFt: 9843 },
];
