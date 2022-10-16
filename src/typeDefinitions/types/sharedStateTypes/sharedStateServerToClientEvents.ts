import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedUiState } from "./sharedUiState";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";
import { SharedUiEvent } from "./sharedUiEvent";
import { AclState } from "../../../redux/slices/aclSlice";
import { DepState } from "../../../redux/slices/depSlice";
import { SharedGpdState } from "../../../redux/slices/gpdSlice";
import { PlanState } from "../../../redux/slices/planSlice";
import { Nullable } from "../../utility-types";

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
