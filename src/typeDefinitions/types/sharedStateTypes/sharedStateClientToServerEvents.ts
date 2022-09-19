import { SharedAircraftDto } from "./sharedAircraftDto";
import { EdstWindow } from "../../enums/edstWindow";
import { Asel } from "../asel";
import { SharedUiEvent } from "./sharedUiEvent";
import { AclState } from "../../../redux/slices/aclSlice";
import { DepState } from "../../../redux/slices/depSlice";
import { GpdState } from "../../../redux/slices/gpdSlice";
import { PlanState } from "../../../redux/slices/planSlice";

export type SharedStateClientToServerEvents = {
  updateAircraft: (payload: SharedAircraftDto) => void;
  setAclState: (value: AclState) => void;
  setDepState: (value: DepState) => void;
  setGpdState: (value: GpdState) => void;
  setPlanState: (value: PlanState) => void;
  setAircraftSelect: (asel: Asel | null, eventId: string | null) => void;
  openWindow: (window: EdstWindow) => void;
  closeWindow: (window: EdstWindow) => void;
  clearPlanQueue: () => void;
  dispatchUiEvent: (eventId: SharedUiEvent, arg?: any) => void;
};
