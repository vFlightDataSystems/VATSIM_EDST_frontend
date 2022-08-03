import { AircraftId } from "../aircraftId";
import { HoldAnnotations } from "../../enums/hold/holdAnnotations";

export type ApiFlightplan = {
  aircraftId: AircraftId;
  cid: string;
  status: any;
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
  holdAnnotations: HoldAnnotations | null;
  tdlsDumped: boolean;
};
