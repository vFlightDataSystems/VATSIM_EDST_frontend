import type { Nullable } from "types/utility-types";
import { EdstWindow } from "enums/edstWindow";
import type { AclRowField } from "enums/acl/aclRowField";
import type { DepRowField } from "enums/dep/depRowField";
import type { Asel } from "types/asel";
import { setAsel } from "~redux/slices/appSlice";
import type { RootThunkAction } from "~redux/store";

function aircraftSelect(
  edstWindow: EdstWindow,
  aircraftId: string,
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

export function aclAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.ACL, aircraftId, field, eventId, triggerSharedState);
}

export function depAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.DEP, aircraftId, field, eventId, triggerSharedState);
}

export function gpdAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: Nullable<string>, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.GPD, aircraftId, field, eventId, triggerSharedState);
}

export function sharedStateAircraftSelect(value: Nullable<Asel>): RootThunkAction {
  return (dispatch) => {
    dispatch(setAsel(value, null, false));
  };
}
