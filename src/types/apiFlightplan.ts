import { AircraftId } from "./aircraftId";

export type ApiFlightplan = {
  aircraftId: AircraftId;
  cid: string;
  altitude: string;
  assignedBeaconCode: number | null;
  departure: string;
  destination: string;
  alternate: string;
  route: string;
  equipment: string;
  estimatedDepartureTime: number;
  actualDepartureTime: number;
  fuelHours: number;
  fuelMinutes: number;
  hoursEnroute: number;
  minutesEnroute: number;
  isIfr: boolean;
  pilotCid: string;
  remarks: string;
  revision: string;
  speed: number;
};
