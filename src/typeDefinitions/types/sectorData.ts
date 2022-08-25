import { Position } from "@turf/turf";

export type SectorData = {
  geometry: { coordinates: Position[][]; type: string };
  properties: {
    alt_low?: string;
    alt_high?: string;
    id: string;
  };
};
