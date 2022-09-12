import { ApiControllerPosition } from "./apiControllerPosition";

type ApiPositionSpecDto = {
  facilityId: string;
  position: ApiControllerPosition;
};

export type ApiSessionInfoDto = {
  id: string;
  artccId: string;
  callsign: string;
  isActive: boolean;
  positions: ApiPositionSpecDto[];
};
