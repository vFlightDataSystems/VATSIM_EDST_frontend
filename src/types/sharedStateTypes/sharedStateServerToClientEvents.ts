import { SharedStateAircraftDto } from "./sharedStateAircraftDto";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (aircraft: SharedStateAircraftDto) => void;
};
