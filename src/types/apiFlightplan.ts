import { AircraftId } from "./aircraftId";

export type ApiFlightplan = {
  aircraftId: AircraftId;
  cid: string;
  status: "Proposed" | "Tentative" | "Active";
  assignedBeaconCode: number | null;
  equipment: string;
  aircraftType: string;
  icaoEquipmentCodes: string;
  faaEquipmentSuffix: string;
  speed: number;
  altitude: string;
  departure: string;
  destination: string;
  alternate: string;
  route: string;
  estimatedDepartureTime: number;
  actualDepartureTime: number;
  fuelHours: number;
  fuelMinutes: number;
  hoursEnroute: number;
  minutesEnroute: number;
  pilotCid: string;
  remarks: string;
  revision: string;
};
