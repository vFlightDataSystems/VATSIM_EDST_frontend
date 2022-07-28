import { AclAselActionTrigger, AclRowField, DepAselActionTrigger, DepRowField, EDST_MENU_LIST, EdstWindow } from "../../namespaces";
import { RootThunkAction } from "../store";
import { closeAircraftMenus, setAsel } from "../slices/appSlice";
import { updateEntry } from "../slices/entrySlice";
import { openMenuThunk } from "./openMenuThunk";
import { openWindowThunk } from "./openWindowThunk";

function aircraftSelect(
  event: Event & any,
  edstWindow: EdstWindow,
  aircraftId: string,
  field: AclRowField | DepRowField,
  aselAction: AclAselActionTrigger | DepAselActionTrigger | null = null,
  triggerOpenWindow: EdstWindow | null = null
): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const { asel } = state.app;

    dispatch(closeAircraftMenus());

    if (asel?.aircraftId === aircraftId && asel?.field === field && asel?.window === edstWindow) {
      dispatch(setAsel(null));
    } else {
      const entry = state.entries[aircraftId];
      switch (edstWindow) {
        case EdstWindow.DEP:
          if (
            !state.dep.manualPosting &&
            field === DepRowField.FID &&
            aselAction === DepAselActionTrigger.SET_DEP_STATUS_NEUTRAL &&
            entry.depStatus === -1
          ) {
            dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ aircraftId, field: field as DepRowField, window: EdstWindow.DEP }));
          if (triggerOpenWindow) {
            if (EDST_MENU_LIST.includes(triggerOpenWindow)) {
              dispatch(openMenuThunk(triggerOpenWindow, event.currentTarget, EdstWindow.DEP, false));
            } else {
              dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget, EdstWindow.DEP));
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
          if (
            !state.acl.manualPosting &&
            field === AclRowField.FID &&
            aselAction === AclAselActionTrigger.SET_VCI_NEUTRAL &&
            entry?.vciStatus === -1
          ) {
            dispatch(updateEntry({ aircraftId, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ aircraftId, field, window: EdstWindow.ACL }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in EDST_MENU_LIST) {
              dispatch(openMenuThunk(triggerOpenWindow, event.currentTarget, EdstWindow.ACL, false));
            } else {
              dispatch(openWindowThunk(triggerOpenWindow as EdstWindow, event.currentTarget, EdstWindow.ACL));
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
  event: Event & any,
  aircraftId: string,
  field: AclRowField,
  aselAction?: AclAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.GPD, aircraftId, field, aselAction, triggerOpenWindow);
}

export function aclAircraftSelect(
  event: Event & any,
  aircraftId: string,
  field: AclRowField,
  aselAction?: AclAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.ACL, aircraftId, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(
  event: Event & any,
  aircraftId: string,
  field: DepRowField,
  aselAction?: DepAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | null
) {
  return aircraftSelect(event, EdstWindow.DEP, aircraftId, field, aselAction, triggerOpenWindow);
}
