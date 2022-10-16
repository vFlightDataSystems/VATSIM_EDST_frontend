import { AircraftId } from "../aircraftId";
import { HoldAnnotations } from "../../enums/hold/holdAnnotations";
import { Nullable } from "../../utility-types";

export type ApiFlightplan = {
  aircraftId: AircraftId;
  cid: string;
  status: "Proposed" | "Active" | "Tentative";
  assignedBeaconCode: Nullable<number>;
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
  holdAnnotations: Nullable<HoldAnnotations>;
};
