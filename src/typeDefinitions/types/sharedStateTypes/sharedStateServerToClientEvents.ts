import type { EdstWindow } from "types/edstWindow";

import type { AclState } from "~redux/slices/aclSlice";
import type { DepState } from "~redux/slices/depSlice";
import type { SharedGpdState } from "~redux/slices/gpdSlice";
import type { PlanState } from "~redux/slices/planSlice";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import type { Asel } from "types/asel";
import type { SharedUiState } from "types/sharedStateTypes/sharedUiState";
import type { SharedAircraftDto } from "types/sharedStateTypes/sharedAircraftDto";
import type { Nullable } from "types/utility-types";

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
