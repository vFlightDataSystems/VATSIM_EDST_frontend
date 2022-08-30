import { SharedAircraftDto } from "./sharedAircraftDto";
import { EdstWindow } from "../../enums/edstWindow";
import { AclSortOption } from "../../enums/acl/aclSortOption";
import { DepSortOption } from "../../enums/dep/depSortOption";
import { Plan } from "../plan";
import { Asel } from "../asel";

export type SharedStateClientToServerEvents = {
  updateAircraft: (sectorId: string, payload: SharedAircraftDto) => void;
  setAclSort: (sortOption: AclSortOption, sector: boolean) => void;
  setDepSort: (sortOption: DepSortOption) => void;
  setAclManualPosting: (value: boolean) => void;
  setDepManualPosting: (value: boolean) => void;
  setPlanQueue: (value: Plan[]) => void;
  openWindow: (window: EdstWindow) => void;
  closeWindow: (window: EdstWindow) => void;
  setAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
  clearPlanQueue: () => void;
};
