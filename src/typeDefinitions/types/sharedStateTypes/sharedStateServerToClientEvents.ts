import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedGpdState } from "./sharedGpdState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { SharedUiState } from "./sharedUiState";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (value: SharedAircraftDto) => void;
  receiveAclState: (value: SharedAclState) => void;
  receiveDepState: (value: SharedDepState) => void;
  receiveGpdState: (value: SharedGpdState) => void;
  receivePlansDisplayState: (value: SharedPlansDisplayState) => void;
  receiveOpenWindow: (window: EdstWindow) => void;
  receiveCloseWindow: (window: EdstWindow) => void;
  receiveAircraftSelect: (value: Asel | null, eventId: string | null) => void;
  receiveUiState: (value: SharedUiState) => void;
};
