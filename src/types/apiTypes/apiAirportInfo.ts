import type { ApiLocation } from "types/apiTypes/apiLocation";

export type ApiAirportInfo = {
  faaId: string;
  icaoId: string;
  artccId: string;
  name: string;
  elevation: number;
  location: ApiLocation;
};
