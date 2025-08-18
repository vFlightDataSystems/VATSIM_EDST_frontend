import type { ApiLocation } from "~/types/apiTypes/apiLocation";
import centerData from "./vis-centers.json";

export function getCenterCoordinates(artccId: string): ApiLocation | null {
  const center = centerData[artccId as keyof typeof centerData];

  if (!center) {
    console.warn(`No coordinates found for ARTCC: ${artccId}`);
    return null;
  }

  return {
    lat: center.lat,
    lon: center.lon,
  };
}
