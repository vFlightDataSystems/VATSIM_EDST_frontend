import React from "react";
import { RootThunkAction } from "../store";
import { closeAircraftMenus, setAsel } from "../slices/appSlice";
import { openMenuThunk } from "./openMenuThunk";
import { openWindowThunk } from "./openWindowThunk";
import { EDST_MENU_LIST, EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../typeDefinitions/enums/acl/aclRowField";
import { DepRowField } from "../../typeDefinitions/enums/dep/depRowField";
import { Asel } from "../../types/asel";

function aircraftSelect(
  event: React.MouseEvent<HTMLElement>,
  edstWindow: EdstWindow,
  aircraftId: string,
  field: AclRowField | DepRowField,
  triggerOpenWindow: EdstWindow | null = null
): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const { asel } = state.app;

    dispatch(closeAircraftMenus());

    if (asel?.aircraftId === aircraftId && asel?.field === field && asel?.window === edstWindow) {
      dispatch(setAsel(null));
    } else {
      switch (edstWindow) {
        case EdstWindow.DEP:
          dispatch(setAsel({ aircraftId, field: field as DepRowField, window: EdstWindow.DEP }));
          if (triggerOpenWindow) {
            if (EDST_MENU_LIST.includes(triggerOpenWindow)) {
              dispatch(openMenuThunk(triggerOpenWindow, event.currentTarget, EdstWindow.DEP, false));
            } else {
              dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget));
            }
          }
          break;
        case EdstWindow.GPD:
          if (triggerOpenWindow && EDST_MENU_LIST.includes(triggerOpenWindow)) {
            dispatch(openMenuThunk(triggerOpenWindow, event.currentTarget, EdstWindow.GPD, false));
          }
          dispatch(setAsel({ aircraftId, field, window: EdstWindow.GPD }));
          break;
        case EdstWindow.ACL:
          dispatch(setAsel({ aircraftId, field, window: EdstWindow.ACL }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in EDST_MENU_LIST) {
              dispatch(openMenuThunk(triggerOpenWindow, event.currentTarget, EdstWindow.ACL, false));
            } else {
              dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget));
            }
          }
          break;
        default:
          // TODO: handle error
          // eslint-disable-next-line no-console
          console.log("unknown window");
          break;
      }
    }
  };
}

export function gpdAircraftSelect(
  event: React.MouseEvent<HTMLElement>,
  aircraftId: string,
  field: AclRowField,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.GPD, aircraftId, field, triggerOpenWindow);
}

export function aclAircraftSelect(
  event: React.MouseEvent<HTMLElement>,
  aircraftId: string,
  field: AclRowField,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.ACL, aircraftId, field, triggerOpenWindow);
}

export function depAircraftSelect(
  event: React.MouseEvent<HTMLElement>,
  aircraftId: string,
  field: DepRowField,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.DEP, aircraftId, field, triggerOpenWindow);
}

export function sharedStateAircraftSelect(value: Asel | null): RootThunkAction {
  return dispatch => {
    dispatch(setAsel(value, true));
  };
}
