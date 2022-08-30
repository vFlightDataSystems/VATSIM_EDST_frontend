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
  triggeredBySharedState?: boolean
): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const { asel } = state.app;
    if (asel?.aircraftId === aircraftId && asel?.field === field && asel?.window === edstWindow) {
      dispatch(setAsel(null, null, triggeredBySharedState));
    } else {
      dispatch(setAsel({ aircraftId, field, window: edstWindow }, eventId, triggeredBySharedState));
    }
  };
}

export function aclAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggeredBySharedState?: boolean) {
  return aircraftSelect(EdstWindow.ACL, aircraftId, field, eventId, triggeredBySharedState);
}

export function depAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggeredBySharedState?: boolean) {
  return aircraftSelect(EdstWindow.DEP, aircraftId, field, eventId, triggeredBySharedState);
}

export function gpdAircraftSelect(aircraftId: string, field: AclRowField | DepRowField, eventId: string | null, triggeredBySharedState?: boolean) {
  return aircraftSelect(EdstWindow.GPD, aircraftId, field, eventId, triggeredBySharedState);
}

export function sharedStateAircraftSelect(value: Asel | null): RootThunkAction {
  return dispatch => {
    dispatch(setAsel(value, null, true));
  };
}
