import { RootThunkAction } from "../store";
import { setAsel } from "../slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../typeDefinitions/enums/acl/aclRowField";
import { DepRowField } from "../../typeDefinitions/enums/dep/depRowField";
import { Asel } from "../../typeDefinitions/types/asel";

function aircraftSelect(
  edstWindow: EdstWindow,
  aircraftId: string,
  field: AclRowField | DepRowField,
  eventId: string | null,
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

export function aclAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.ACL, aircraftId, field, eventId, triggerSharedState);
}

export function depAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.DEP, aircraftId, field, eventId, triggerSharedState);
}

export function gpdAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggerSharedState = true) {
  return aircraftSelect(EdstWindow.GPD, aircraftId, field, eventId, triggerSharedState);
}

export function sharedStateAircraftSelect(value: Asel | null): RootThunkAction {
  return dispatch => {
    dispatch(setAsel(value, null, false));
  };
}
