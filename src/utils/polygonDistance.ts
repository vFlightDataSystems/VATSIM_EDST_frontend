import type { Feature, Point, Polygon } from "geojson";
import { booleanPointInPolygon, pointToLineDistance, polygonToLine } from "@turf/turf";

function signedDistancePointToPolygon(point: Point, polygon: Feature<Polygon>) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let dist = pointToLineDistance(point, polygonToLine(polygon), {
    units: "nauticalmiles",
  });
  if (booleanPointInPolygon(point, polygon)) {
    dist *= -1;
  }
  return dist;
}

/**
 * Computes the signed distance from a given point to the union of all polygons (in nm).
 * The returned value is negative if the point is inside of one of the polygons.
 * @param point - current position
 * @param altitude - filed/assigned altitude
 * @param interim - assigned temp altitude
 * @param polygons - airspace defining boundaries
 */
export function getSignedStratumDistancePointToPolygons(point: Point, polygons: Feature<Polygon>[], altitude: number, interim?: number): number {
  let minDistance = Infinity;
  polygons.forEach((poly) => {
    const dist = signedDistancePointToPolygon(point, poly);
    const stratumLow = poly.properties?.alt_low;
    const stratumHigh = poly.properties?.alt_high;
    if (!(stratumLow && stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    } else if (altitude > Number(stratumLow) && altitude < Number(stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    } else if (interim && interim > Number(stratumLow) && interim < Number(stratumHigh)) {
      minDistance = Math.min(minDistance, dist);
    }
  });
  return minDistance;
}
