import boundaries from "../data/us-state-boundaries.json" with { type: "json" };

type Ring = number[][];
type Polygon = Ring[];
type Boundary = { code: string; polygons: Polygon[] };

const states = boundaries as Boundary[];

function inRing(lng: number, lat: number, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const current = ring[i];
    const previous = ring[j];
    if (!current || !previous) continue;
    const xi = current[0] ?? 0;
    const yi = current[1] ?? 0;
    const xj = previous[0] ?? 0;
    const yj = previous[1] ?? 0;
    const crosses = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function inPolygon(lng: number, lat: number, polygon: Polygon) {
  const [outer, ...holes] = polygon;
  if (!outer || !inRing(lng, lat, outer)) return false;
  return holes.every((hole) => !inRing(lng, lat, hole));
}

/** US state or DC code when the point is inside a boundary. Coordinates are not retained. */
export function locateUsCode(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  for (const state of states) {
    if (state.polygons.some((polygon) => inPolygon(longitude, latitude, polygon))) return state.code;
  }
  return null;
}
