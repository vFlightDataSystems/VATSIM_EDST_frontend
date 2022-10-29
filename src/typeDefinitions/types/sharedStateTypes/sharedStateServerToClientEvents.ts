import type { EdstWindow } from "enums/edstWindow";
import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { SharedGpdState } from "~redux/slices/gpdSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { SharedUiEvent } from "./sharedUiEvent";
import type { Asel } from "../asel";
import type { SharedUiState } from "./sharedUiState";
import type { SharedAircraftDto } from "./sharedAircraftDto";
import type { Nullable } from "../utility-types";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (aircraft: SharedAircraftDto) => void;
  receiveAclState: (value: AclState) => void;
  receiveDepState: (value: DepState) => void;
  receiveGpdState: (value: SharedGpdState) => void;
  receivePlansDisplayState: (value: PlanState) => void;
  receiveOpenWindow: (window: EdstWindow) => void;
  receiveCloseWindow: (window: EdstWindow) => void;
  receiveAircraftSelect: (asel: Nullable<Asel>, eventId: Nullable<string>) => void;
  receiveUiState: (value: SharedUiState) => void;
  receiveUiEvent: (eventId: SharedUiEvent, arg?: any) => void;
  receiveGIMessage: (sender: string, message: string) => void;
};
