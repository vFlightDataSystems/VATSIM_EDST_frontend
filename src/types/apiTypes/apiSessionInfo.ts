import { ApiControllerPosition } from "./apiControllerPosition";

export type ApiSessionInfo = {
  id: string;
  artccId: string;
  facilityId: string;
  isActive: boolean;
  position: ApiControllerPosition;
};
