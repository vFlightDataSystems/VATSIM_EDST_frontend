import { SharedAircraftDto } from "./sharedAircraftDto";
import { SharedAclState } from "./sharedAclState";
import { SharedDepState } from "./sharedDepState";
import { SharedGpdState } from "./sharedGpdState";
import { SharedPlansDisplayState } from "./sharedPlansDisplayState";
import { SharedUiState } from "./sharedUiState";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../../../types/asel";

export type SharedStateServerToClientEvents = {
  receiveAircraft: (value: SharedAircraftDto) => void;
  receiveAclState: (value: SharedAclState) => void;
  receiveDepState: (value: SharedDepState) => void;
  receiveGpdState: (value: SharedGpdState) => void;
  receivePlansDisplayState: (value: SharedPlansDisplayState) => void;
  receiveBringWindowToFront: (value: EdstWindow) => void;
  receiveAircraftSelect: (value: Asel | null) => void;
  receiveUiState: (value: SharedUiState) => void;
};
