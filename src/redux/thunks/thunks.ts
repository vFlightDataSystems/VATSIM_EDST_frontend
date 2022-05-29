import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { aclAselActionTrigger, aclRowField, depAselActionTrigger, depRowField, menuEnum, windowEnum } from "../../enums";
import { REMOVAL_TIMEOUT } from "../../lib";
import { deleteAclEntry, updateEntry } from "../slices/entriesSlice";
import { WindowPosition } from "../../types";
import { closeAircraftMenus, closeWindow, openMenu, openWindow, setAsel, setMenuPosition, setWindowPosition } from "../slices/appSlice";
import { addTrialPlan, planCleanup, PlanQuery, Plan, removeTrialPlan } from "../slices/planSlice";
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
  window: windowEnum | null,
  cid: string,
  field: aclRowField | depRowField,
  // eslint-disable-next-line default-param-last
  aselAction: aclAselActionTrigger | depAselActionTrigger | null = null,
  triggerOpenWindow?: windowEnum | menuEnum | null
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
        case windowEnum.dep:
          if (
            !state.dep.manualPosting &&
            field === depRowField.fid &&
            aselAction === depAselActionTrigger.setDepStatusNeutral &&
            entry.depStatus === -1
          ) {
            dispatch(updateEntry({ cid, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ cid, field: field as depRowField, window: windowEnum.dep }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in windowEnum) {
              dispatch(openWindowThunk(triggerOpenWindow as windowEnum, event.currentTarget, windowEnum.dep));
            }
            if (triggerOpenWindow in menuEnum) {
              dispatch(openMenuThunk(triggerOpenWindow as menuEnum, event.currentTarget, windowEnum.dep, false));
            }
          }
          break;
        case windowEnum.graphicPlanDisplay:
          if (triggerOpenWindow && triggerOpenWindow in menuEnum) {
            dispatch(openMenuThunk(triggerOpenWindow as menuEnum, event.currentTarget, windowEnum.graphicPlanDisplay, false));
          }
          dispatch(setAsel({ cid, field: field as aclRowField, window: windowEnum.graphicPlanDisplay }));
          break;
        default:
          if (!state.acl.manualPosting && field === aclRowField.fid && aselAction === aclAselActionTrigger.setVciNeutral && entry?.vciStatus === -1) {
            dispatch(updateEntry({ cid, data: { vciStatus: 0 } }));
          }
          dispatch(setAsel({ cid, field: field as aclRowField, window: windowEnum.acl }));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in windowEnum) {
              dispatch(openWindowThunk(triggerOpenWindow as windowEnum, event.currentTarget, windowEnum.acl));
            }
            if (triggerOpenWindow in menuEnum) {
              dispatch(openMenuThunk(triggerOpenWindow as menuEnum, event.currentTarget, windowEnum.acl, false));
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
  field: aclRowField,
  aselAction?: aclAselActionTrigger | null,
  triggerOpenWindow?: windowEnum | menuEnum | null
) {
  return aircraftSelect(event, windowEnum.graphicPlanDisplay, cid, field, aselAction, triggerOpenWindow);
}

export function aclAircraftSelect(
  event: Event & any,
  cid: string,
  field: aclRowField,
  aselAction?: aclAselActionTrigger | null,
  triggerOpenWindow?: windowEnum | menuEnum | null
) {
  return aircraftSelect(event, windowEnum.acl, cid, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(
  event: any & Event,
  cid: string,
  field: depRowField,
  aselAction?: depAselActionTrigger | null,
  triggerOpenWindow?: windowEnum | menuEnum | null
) {
  return aircraftSelect(event, windowEnum.dep, cid, field, aselAction, triggerOpenWindow);
}

// export function planCleanupThunk() {
//   return (dispatch: any) => {
//     dispatch(planCleanup());
//   };
// }

export function openWindowThunk(window: windowEnum, ref?: EventTarget & any, triggeredFromWindow?: windowEnum) {
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

export function openMenuThunk(menu: menuEnum, ref?: EventTarget & any, triggeredFromWindow?: windowEnum | menuEnum, plan = false) {
  return (dispatch: any) => {
    if (ref) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = ref.getBoundingClientRect();
      switch (menu) {
        case menuEnum.altitudeMenu:
          menuPos = {
            x: x + (plan ? 0 : width),
            y: plan ? ref.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case menuEnum.routeMenu:
          menuPos =
            triggeredFromWindow !== windowEnum.dep
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
        case menuEnum.prevRouteMenu:
          menuPos = {
            x,
            y: plan ? ref.offsetTop : y - 2 * height,
            w: width,
            h: height
          };
          break;
        case menuEnum.speedMenu:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        case menuEnum.headingMenu:
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
  thunkAPI.dispatch(openWindow({ window: windowEnum.plansDisplay }));
});

export function removeTrialPlanThunk(index: number) {
  return (dispatch: any, getState: () => RootState) => {
    dispatch(removeTrialPlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(windowEnum.plansDisplay));
    }
  };
}
