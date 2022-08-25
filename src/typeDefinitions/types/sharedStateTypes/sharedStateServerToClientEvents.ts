import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedGpdState } from "./sharedGpdState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { SharedUiState } from "./sharedUiState";
import { EdstWindow } from "../../enums/edstWindow";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (aircraft: SharedAircraftDto) => void;
  receiveAclState: (value: SharedAclState) => void;
  receiveDepState: (value: SharedDepState) => void;
  receiveGpdState: (value: SharedGpdState) => void;
  receivePlansDisplayState: (value: SharedPlansDisplayState) => void;
  receiveBringWindowToFront: (window: EdstWindow) => void;
  receiveUiState: (value: SharedUiState) => void;
};
