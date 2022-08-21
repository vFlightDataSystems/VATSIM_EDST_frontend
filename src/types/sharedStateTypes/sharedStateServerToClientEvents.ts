import { SharedStateAircraftDto } from "./sharedStateAircraftDto";

export type sharedStateServerToClientEvents = {
  receiveAircraft: (aircraft: SharedStateAircraftDto) => void;
};
