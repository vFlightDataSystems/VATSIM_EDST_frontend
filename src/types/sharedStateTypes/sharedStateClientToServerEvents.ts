import { SharedStateAircraftDto } from "./sharedStateAircraftDto";

export type SharedStateClientToServerEvents = {
  updateAircraft: (sectorId: string, payload: SharedStateAircraftDto) => void;
};
