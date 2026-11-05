import { locateUsCode } from "../lib/locate-region.ts";

const samples: [number, number, string | null][] = [
  [33.4484, -112.074, "AZ"],
  [34.0522, -118.2437, "CA"],
  [40.7128, -74.006, "NY"],
  [21.3069, -157.8583, "HI"],
  [30.9843, -91.9623, "LA"],
  [40.2732, -76.8867, "PA"],
  [39.7392, -104.9903, "CO"],
  [30.2672, -97.7431, "TX"],
  [41.824, -71.4128, "RI"],
  [25.7617, -80.1918, "FL"],
  [48.8566, 2.3522, null],
];

for (const [lat, lng, expected] of samples) {
  const code = locateUsCode(lat, lng);
  if (code !== expected) throw new Error(`${lat},${lng} => ${code}, expected ${expected}`);
}
console.log("locate-verify ok");
