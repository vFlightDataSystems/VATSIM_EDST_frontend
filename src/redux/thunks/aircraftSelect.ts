import type { Nullable } from "types/utility-types";
import type { EdstWindow } from "types/edstWindow";
import type { AclRowField } from "types/acl/aclRowField";
import type { DepRowField } from "types/dep/depRowField";
import type { Asel } from "types/asel";
import { setAsel } from "~redux/slices/appSlice";
import type { RootThunkAction } from "~redux/store";

function aircraftSelect(
  edstWindow: EdstWindow,
  aircraftId: AircraftId,
  field: AclRowField | DepRowField,
  eventId: Nullable<string>,
  triggerSharedState = true
): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const { asel } = state.app;
    if (asel?.aircraftId === aircraftId && asel?.field === field && asel?.window === edstWindow) {
      dispatch(setAsel(null, null, triggerSharedState));
    } else {
      dispatch(setAsel({ aircraftId, field, window: edstWindow }, eventId, triggerSharedState));
    }
  };
}

export function aclAircraftSelect(aircraftId: AircraftId, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect("ACL", aircraftId, field, eventId, triggerSharedState);
}

export function depAircraftSelect(aircraftId: AircraftId, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect("DEP", aircraftId, field, eventId, triggerSharedState);
}

export function gpdAircraftSelect(aircraftId: AircraftId, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect("GPD", aircraftId, field, eventId, triggerSharedState);
}

export function sharedStateAircraftSelect(value: Nullable<Asel>): RootThunkAction {
  return (dispatch) => {
    dispatch(setAsel(value, null, false));
  };
}
