import type { CreateOrAmendFlightplanDto } from "types/apiTypes/CreateOrAmendFlightplanDto";
import type { UnixTime } from "types/unixTime";

export type Plan = {
  cid: string;
  aircraftId: AircraftId;
  amendedFlightplan: CreateOrAmendFlightplanDto;
  commandString: string;
  expirationTime: UnixTime;
};
