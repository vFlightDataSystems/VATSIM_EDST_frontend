import { CreateOrAmendFlightplanDto } from "./apiTypes/CreateOrAmendFlightplanDto";
import { UnixTime } from "./unixTime";

export type Plan = {
  cid: string;
  aircraftId: string;
  amendedFlightplan: CreateOrAmendFlightplanDto;
  commandString: string;
  expirationTime: UnixTime;
};
