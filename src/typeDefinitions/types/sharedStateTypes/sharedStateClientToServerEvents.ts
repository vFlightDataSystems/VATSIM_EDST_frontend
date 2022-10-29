import type { EdstWindow } from "enums/edstWindow";
import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { SharedGpdState } from "~redux/slices/gpdSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { SharedUiEvent } from "./sharedUiEvent";
import type { Asel } from "../asel";
import type { SharedAircraftDto } from "./sharedAircraftDto";
import type { Nullable } from "../utility-types";

export type SharedStateClientToServerEvents = {
  updateAircraft: (payload: SharedAircraftDto) => void;
  setAclState: (value: AclState) => void;
  setDepState: (value: DepState) => void;
  setGpdState: (value: SharedGpdState) => void;
  setPlanState: (value: PlanState) => void;
  setAircraftSelect: (asel: Nullable<Asel>, eventId: Nullable<string>) => void;
  openWindow: (window: EdstWindow) => void;
  closeWindow: (window: EdstWindow) => void;
  clearPlanQueue: () => void;
  dispatchUiEvent: (eventId: SharedUiEvent, arg?: any) => void;
  sendGIMessage: (recipient: string, message: string, callback: (rejectReason?: string) => void) => void;
};
