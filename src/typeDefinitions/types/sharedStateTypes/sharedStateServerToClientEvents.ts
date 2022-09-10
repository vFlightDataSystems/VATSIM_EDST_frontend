import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedUiState } from "./sharedUiState";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";
import { SharedUiEvent } from "./sharedUiEvent";
import { AclState } from "../../../redux/slices/aclSlice";
import { DepState } from "../../../redux/slices/depSlice";
import { GpdState } from "../../../redux/slices/gpdSlice";
import { PlanState } from "../../../redux/slices/planSlice";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (aircraft: SharedAircraftDto) => void;
  receiveAclState: (value: AclState) => void;
  receiveDepState: (value: DepState) => void;
  receiveGpdState: (value: GpdState) => void;
  receivePlansDisplayState: (value: PlanState) => void;
  receiveOpenWindow: (window: EdstWindow) => void;
  receiveCloseWindow: (window: EdstWindow) => void;
  receiveAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
  receiveUiState: (value: SharedUiState) => void;
  receiveUiEvent: (eventId: SharedUiEvent, arg?: any) => void;
};
