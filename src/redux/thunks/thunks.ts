import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AclAselActionTrigger, AclRowField, DepAselActionTrigger, DepRowField, EdstMenu, EdstWindow } from "../../enums";
import { REMOVAL_TIMEOUT } from "../../lib";
import { deleteAclEntry, updateEntry } from "../slices/entriesSlice";
import { WindowPosition } from "../../types";
import { closeAircraftMenus, closeWindow, openMenu, openWindow, setAsel, setMenuPosition, setWindowPosition } from "../slices/appSlice";
import { addTrialPlan, PlanQuery, Plan, removeTrialPlan } from "../slices/planSlice";
import { trialRoute } from "../../api";

export function aclCleanup(dispatch: any, getState: () => RootState) {
  const state = getState();
  const { entries } = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay && now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT);
  pendingRemovalEntryList.forEach(entry => {
    dispatch(deleteAclEntry(entry.cid));
  });
}

function aircraftSelect(
  event: Event & any,
  window: EdstWindow | null,
  cid: string,
  field: AclRowField | DepRowField,
  // eslint-disable-next-line default-param-last
  aselAction: AclAselActionTrigger | DepAselActionTrigger | null = null,
  triggerOpenWindow?: EdstWindow | EdstMenu | null
) {
  return (dispatch: any, getState: () => RootState) => {
    const state = getState();
    const { asel } = state.app;

    dispatch(closeAircraftMenus());

    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      dispatch(setAsel(null));
    } else {
      const entry = state.entries[cid];
      switch (window) {
        case EdstWindow.dep:
          if (
            !state.dep.manualPosting &&
            field === DepRowField.fid &&
            aselAction === DepAselActionTrigger.setDepStatusNeutral &&
            entry.depStatus === -1
          ) {
            dispatch(updateEntry({ cid, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ cid, field: field as DepRowField, window: EdstWindow.dep }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in EdstWindow) {
              dispatch(openWindowThunk(triggerOpenWindow as EdstWindow, event.currentTarget, EdstWindow.dep));
            }
            if (triggerOpenWindow in EdstMenu) {
              dispatch(openMenuThunk(triggerOpenWindow as EdstMenu, event.currentTarget, EdstWindow.dep, false));
            }
          }
          break;
        case EdstWindow.graphicPlanDisplay:
          if (triggerOpenWindow && triggerOpenWindow in EdstMenu) {
            dispatch(openMenuThunk(triggerOpenWindow as EdstMenu, event.currentTarget, EdstWindow.graphicPlanDisplay, false));
          }
          dispatch(setAsel({ cid, field: field as AclRowField, window: EdstWindow.graphicPlanDisplay }));
          break;
        default:
          if (!state.acl.manualPosting && field === AclRowField.fid && aselAction === AclAselActionTrigger.setVciNeutral && entry?.vciStatus === -1) {
            dispatch(updateEntry({ cid, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ cid, field: field as AclRowField, window: EdstWindow.acl }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in EdstWindow) {
              dispatch(openWindowThunk(triggerOpenWindow as EdstWindow, event.currentTarget, EdstWindow.acl));
            }
            if (triggerOpenWindow in EdstMenu) {
              dispatch(openMenuThunk(triggerOpenWindow as EdstMenu, event.currentTarget, EdstWindow.acl, false));
            }
          }
          break;
      }
    }
  };
}

export function gpdAircraftSelect(
  event: Event & any,
  cid: string,
  field: AclRowField,
  aselAction?: AclAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | EdstMenu | null
) {
  return aircraftSelect(event, EdstWindow.graphicPlanDisplay, cid, field, aselAction, triggerOpenWindow);
}

export function aclAircraftSelect(
  event: Event & any,
  cid: string,
  field: AclRowField,
  aselAction?: AclAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | EdstMenu | null
) {
  return aircraftSelect(event, EdstWindow.acl, cid, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(
  event: any & Event,
  cid: string,
  field: DepRowField,
  aselAction?: DepAselActionTrigger | null,
  triggerOpenWindow?: EdstWindow | EdstMenu | null
) {
  return aircraftSelect(event, EdstWindow.dep, cid, field, aselAction, triggerOpenWindow);
}

// export function planCleanupThunk() {
//   return (dispatch: any) => {
//     dispatch(planCleanup());
//   };
// }

export function openWindowThunk(window: EdstWindow, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow) {
  return (dispatch: any) => {
    if (ref) {
      const { x, y } = ref.getBoundingClientRect();
      const windowPos = {
        x,
        y: y + ref.offsetHeight
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(openWindow({ window, openedBy: triggeredFromWindow }));
  };
}

export function openMenuThunk(menu: EdstMenu, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow | EdstMenu, plan = false) {
  return (dispatch: any) => {
    if (ref) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = ref.getBoundingClientRect();
      switch (menu) {
        case EdstMenu.altitudeMenu:
          menuPos = {
            x: x + (plan ? 0 : width),
            y: plan ? ref.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case EdstMenu.routeMenu:
          menuPos =
            triggeredFromWindow !== EdstWindow.dep
              ? {
                  x: x - (plan ? 0 : 569),
                  y: plan ? ref.offsetTop : y - 3 * height,
                  w: width,
                  h: height
                }
              : {
                  x: x - 1,
                  y: 200,
                  w: width,
                  h: height
                };
          break;
        case EdstMenu.prevRouteMenu:
          menuPos = {
            x,
            y: plan ? ref.offsetTop : y - 2 * height,
            w: width,
            h: height
          };
          break;
        case EdstMenu.speedMenu:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        case EdstMenu.headingMenu:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        default:
          menuPos = {
            x,
            y: y + ref.offsetHeight
          };
      }
      dispatch(setMenuPosition({ menu, pos: menuPos }));
    }
    dispatch(openMenu({ menu, openedBy: triggeredFromWindow }));
  };
}

export const addTrialPlanThunk = createAsyncThunk("plan/trial/route", async (plan: Plan, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  const currentEntry = state.entries[plan.cid];
  if (plan.queryType === PlanQuery.direct) {
    trialRoute(plan.callsign, {
      direct_fix: plan.planData.fix,
      route: currentEntry.route,
      route_data: currentEntry.route_data,
      frd: plan.planData.frd
    })
      .then(response => response.json())
      .then(data => {
        if (data.route) {
          thunkAPI.dispatch(addTrialPlan({ ...plan, msg: `AM ${plan.callsign} RTE ${data.route}${plan.dest}` }));
        }
      });
  } else {
    thunkAPI.dispatch(addTrialPlan(plan));
  }
  thunkAPI.dispatch(openWindow({ window: EdstWindow.plansDisplay }));
});

export function removeTrialPlanThunk(index: number) {
  return (dispatch: any, getState: () => RootState) => {
    dispatch(removeTrialPlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(EdstWindow.plansDisplay));
    }
  };
}
