import { SharedAircraftDto } from "./sharedAircraftDto";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";
import { SharedUiEvent } from "./sharedUiEvent";
import { AclState } from "../../../redux/slices/aclSlice";
import { DepState } from "../../../redux/slices/depSlice";
import { SharedGpdState } from "../../../redux/slices/gpdSlice";
import { PlanState } from "../../../redux/slices/planSlice";
import { Nullable } from "../../utility-types";

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
