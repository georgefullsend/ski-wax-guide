export interface SkiResort {
  name: string;
  region: string;
  lat: number;
  lon: number;
  elevationFt: number; // base area elevation in feet
  pass?: "ikon" | "epic" | "both" | "independent";
}

export const resorts: SkiResort[] = [
  // North America — Ikon
  { name: "Alta, Utah", region: "North America", lat: 40.5884, lon: -111.6386, elevationFt: 8530, pass: "ikon" },
  { name: "Arapahoe Basin, Colorado", region: "North America", lat: 39.6426, lon: -105.8718, elevationFt: 10780, pass: "ikon" },
  { name: "Aspen, Colorado", region: "North America", lat: 39.1911, lon: -106.8175, elevationFt: 7945, pass: "ikon" },
  { name: "Banff / Lake Louise, Alberta", region: "North America", lat: 51.4254, lon: -116.1773, elevationFt: 5400, pass: "ikon" },
  { name: "Big Sky, Montana", region: "North America", lat: 45.2833, lon: -111.4014, elevationFt: 7500, pass: "ikon" },
  { name: "Brighton, Utah", region: "North America", lat: 40.5980, lon: -111.5832, elevationFt: 8755, pass: "ikon" },
  { name: "Copper Mountain, Colorado", region: "North America", lat: 39.5022, lon: -106.1497, elevationFt: 9712, pass: "ikon" },
  { name: "Crystal Mountain, Washington", region: "North America", lat: 46.9282, lon: -121.5045, elevationFt: 4400, pass: "ikon" },
  { name: "Deer Valley, Utah", region: "North America", lat: 40.6374, lon: -111.4783, elevationFt: 6570, pass: "ikon" },
  { name: "Eldora, Colorado", region: "North America", lat: 39.9372, lon: -105.5828, elevationFt: 9200, pass: "ikon" },
  { name: "Jackson Hole, Wyoming", region: "North America", lat: 43.5877, lon: -110.8279, elevationFt: 6311, pass: "ikon" },
  { name: "Killington, Vermont", region: "North America", lat: 43.6045, lon: -72.8201, elevationFt: 3800, pass: "ikon" },
  { name: "Loon Mountain, New Hampshire", region: "North America", lat: 44.0366, lon: -71.6214, elevationFt: 950, pass: "ikon" },
  { name: "Mammoth Mountain, California", region: "North America", lat: 37.6308, lon: -119.0326, elevationFt: 7953, pass: "ikon" },
  { name: "Palisades Tahoe, California", region: "North America", lat: 39.1968, lon: -120.2354, elevationFt: 6200, pass: "ikon" },
  { name: "Revelstoke, British Columbia", region: "North America", lat: 51.0447, lon: -118.1673, elevationFt: 5620, pass: "ikon" },
  { name: "Snowbird, Utah", region: "North America", lat: 40.5830, lon: -111.6508, elevationFt: 7760, pass: "ikon" },
  { name: "Solitude, Utah", region: "North America", lat: 40.6199, lon: -111.5919, elevationFt: 7988, pass: "ikon" },
  { name: "Steamboat, Colorado", region: "North America", lat: 40.4572, lon: -106.8045, elevationFt: 6900, pass: "ikon" },
  { name: "Stratton, Vermont", region: "North America", lat: 43.1134, lon: -72.9079, elevationFt: 1872, pass: "ikon" },
  { name: "Sugarbush, Vermont", region: "North America", lat: 44.1358, lon: -72.9012, elevationFt: 1483, pass: "ikon" },
  { name: "Sugarloaf, Maine", region: "North America", lat: 45.0314, lon: -70.3131, elevationFt: 1417, pass: "ikon" },
  { name: "Sunday River, Maine", region: "North America", lat: 44.4733, lon: -70.8564, elevationFt: 800, pass: "ikon" },
  { name: "Taos, New Mexico", region: "North America", lat: 36.5969, lon: -105.4544, elevationFt: 9207, pass: "ikon" },
  { name: "Tremblant, Quebec", region: "North America", lat: 46.2096, lon: -74.5858, elevationFt: 755, pass: "ikon" },
  { name: "Winter Park, Colorado", region: "North America", lat: 39.8841, lon: -105.7625, elevationFt: 9000, pass: "ikon" },

  // North America — Epic
  { name: "Beaver Creek, Colorado", region: "North America", lat: 39.6042, lon: -106.5165, elevationFt: 8100, pass: "epic" },
  { name: "Breckenridge, Colorado", region: "North America", lat: 39.4817, lon: -106.0384, elevationFt: 9600, pass: "epic" },
  { name: "Crested Butte, Colorado", region: "North America", lat: 38.8991, lon: -106.9653, elevationFt: 9375, pass: "epic" },
  { name: "Heavenly, California", region: "North America", lat: 38.9353, lon: -119.9396, elevationFt: 6540, pass: "epic" },
  { name: "Keystone, Colorado", region: "North America", lat: 39.6069, lon: -105.9718, elevationFt: 9280, pass: "epic" },
  { name: "Kirkwood, California", region: "North America", lat: 38.6850, lon: -120.0654, elevationFt: 7800, pass: "epic" },
  { name: "Mount Snow, Vermont", region: "North America", lat: 42.9603, lon: -72.9207, elevationFt: 1900, pass: "epic" },
  { name: "Northstar, California", region: "North America", lat: 39.2746, lon: -120.1210, elevationFt: 6330, pass: "epic" },
  { name: "Okemo, Vermont", region: "North America", lat: 43.4017, lon: -72.7171, elevationFt: 1144, pass: "epic" },
  { name: "Park City, Utah", region: "North America", lat: 40.6514, lon: -111.5080, elevationFt: 6900, pass: "epic" },
  { name: "Stevens Pass, Washington", region: "North America", lat: 47.7448, lon: -121.0890, elevationFt: 4061, pass: "epic" },
  { name: "Stowe, Vermont", region: "North America", lat: 44.5303, lon: -72.7814, elevationFt: 1559, pass: "epic" },
  { name: "Sun Valley, Idaho", region: "North America", lat: 43.6977, lon: -114.3514, elevationFt: 5750, pass: "epic" },
  { name: "Telluride, Colorado", region: "North America", lat: 37.9375, lon: -107.8123, elevationFt: 8725, pass: "epic" },
  { name: "Vail, Colorado", region: "North America", lat: 39.6403, lon: -106.3742, elevationFt: 8120, pass: "epic" },
  { name: "Whistler Blackcomb, British Columbia", region: "North America", lat: 50.1163, lon: -122.9574, elevationFt: 2214, pass: "epic" },

  // Europe
  { name: "Chamonix, France", region: "Europe", lat: 45.9237, lon: 6.8694, elevationFt: 3396, pass: "ikon" },
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
  { name: "Zermatt, Switzerland", region: "Europe", lat: 46.0207, lon: 7.7491, elevationFt: 5315, pass: "ikon" },

  // Japan
  { name: "Furano, Hokkaido", region: "Japan", lat: 43.3389, lon: 142.3828, elevationFt: 1148 },
  { name: "Hakuba, Nagano", region: "Japan", lat: 36.6983, lon: 137.8322, elevationFt: 2500, pass: "epic" },
  { name: "Myoko Kogen, Niigata", region: "Japan", lat: 36.8675, lon: 138.6836, elevationFt: 2460 },
  { name: "Niseko, Hokkaido", region: "Japan", lat: 42.8625, lon: 140.6986, elevationFt: 1312, pass: "ikon" },
  { name: "Nozawa Onsen, Nagano", region: "Japan", lat: 36.9214, lon: 138.6260, elevationFt: 2100 },
  { name: "Shiga Kogen, Nagano", region: "Japan", lat: 36.7714, lon: 138.5233, elevationFt: 5250 },

  // Southern Hemisphere
  { name: "Portillo, Chile", region: "Southern Hemisphere", lat: -32.8356, lon: -70.1308, elevationFt: 9350 },
  { name: "Queenstown (Remarkables), New Zealand", region: "Southern Hemisphere", lat: -45.0540, lon: 168.8178, elevationFt: 5505 },
  { name: "Thredbo, Australia", region: "Southern Hemisphere", lat: -36.5053, lon: 148.3044, elevationFt: 4380 },
  { name: "Valle Nevado, Chile", region: "Southern Hemisphere", lat: -33.3556, lon: -70.2517, elevationFt: 9843, pass: "ikon" },
];
