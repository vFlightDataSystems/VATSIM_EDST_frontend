import type { ApiFlightplan } from "types/apiTypes/apiFlightplan";

type CreateOrAmendFlightplanDtoKeys =
  | "aircraftId"
  | "assignedBeaconCode"
  | "equipment"
  | "speed"
  | "altitude"
  | "departure"
  | "destination"
  | "alternate"
  | "route"
  | "remarks"
  | "estimatedDepartureTime"
  | "actualDepartureTime"
  | "hoursEnroute"
  | "minutesEnroute"
  | "fuelHours"
  | "fuelMinutes";

export type CreateOrAmendFlightplanDto = Pick<ApiFlightplan, CreateOrAmendFlightplanDtoKeys>;
