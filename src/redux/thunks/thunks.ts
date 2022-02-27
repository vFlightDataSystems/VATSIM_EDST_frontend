import {RootState} from "../store";
import {
  aclAselActionTriggerEnum,
  aclRowFieldEnum,
  depAselActionTriggerEnum,
  depRowFieldEnum, menuEnum,
  windowEnum
} from "../../enums";
import {REMOVAL_TIMEOUT} from "../../lib";
import {deleteAclEntry, updateEntry} from "../slices/entriesSlice";
import {WindowPositionType} from "../../types";
import {
  closeAircraftMenus,
  closeWindow,
  openMenu,
  openWindow,
  setAsel,
  setMenuPosition,
  setWindowPosition
} from "../slices/appSlice";
import {addTrialPlan, planCleanup, PlanType, removeTrialPlan} from "../slices/planSlice";

export function aclCleanup(dispatch: any, getState: () => RootState) {
  const state = getState();
  let {entries} = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay
    && (now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT));
  for (let entry of pendingRemovalEntryList) {
    dispatch(deleteAclEntry(entry.cid));
  }
}

function aircraftSelect(
  event: Event & any,
  window: windowEnum | null,
  cid: string,
  field: aclRowFieldEnum | depRowFieldEnum,
  aselAction: aclAselActionTriggerEnum | depAselActionTriggerEnum | null = null,
  triggerOpenWindow?: windowEnum | menuEnum | null
) {
  return (dispatch: any, getState: () => RootState) => {
    const state = getState();
    let asel = state.app.asel;

    dispatch(closeAircraftMenus());

    if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
      dispatch(setAsel(null));
    } else {
      let entry = state.entries[cid];
      switch (window) {
        case windowEnum.dep:
          if (!state.dep.manualPosting && field === depRowFieldEnum.fid && aselAction === depAselActionTriggerEnum.setDepStatusNeutral && entry.depStatus === -1) {
            dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
          }
          dispatch(setAsel({cid: cid, field: field as depRowFieldEnum, window: windowEnum.dep}));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in windowEnum) {
              dispatch(openWindowThunk(triggerOpenWindow as windowEnum, event.currentTarget, windowEnum.dep, false, cid));
            }
            if (triggerOpenWindow in menuEnum) {
              dispatch(openMenuThunk(triggerOpenWindow as menuEnum, event.currentTarget, windowEnum.dep, false, cid));
            }
          }
          break;
        default:
          if (!state.acl.manualPosting && field === aclRowFieldEnum.fid && aselAction === aclAselActionTriggerEnum.setVciNeutral && entry?.vciStatus === -1) {
            dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
          }
          dispatch(setAsel({cid: cid, field: field as aclRowFieldEnum, window: windowEnum.acl}));
          if (triggerOpenWindow) {
            if (triggerOpenWindow in windowEnum) {
              dispatch(openWindowThunk(triggerOpenWindow as windowEnum, event.currentTarget, windowEnum.acl, false, cid));
            }
            if (triggerOpenWindow in menuEnum) {
              dispatch(openMenuThunk(triggerOpenWindow as menuEnum, event.currentTarget, windowEnum.acl, false, cid));
            }
          }
          break;
      }
    }
  };
}

export function aclAircraftSelect(event: Event & any, cid: string, field: aclRowFieldEnum, aselAction?: aclAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | menuEnum | null) {
  return aircraftSelect(event, windowEnum.acl, cid, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(event: any & Event, cid: string, field: depRowFieldEnum, aselAction?: depAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | menuEnum | null) {
  return aircraftSelect(event, windowEnum.dep, cid, field, aselAction, triggerOpenWindow);
}

export function planCleanupThunk() {
  return (dispatch: any) => {
    dispatch(planCleanup());
  };
}

export function openWindowThunk(window: windowEnum, ref?: (EventTarget & any), triggeredFromWindow?: windowEnum, plan: boolean = false, openedWithCid?: string | null) {
  return (dispatch: any) => {
    if (ref) {
      let windowPos: WindowPositionType;
      windowPos = {
        x: ref.offsetLeft,
        y: ref.offsetTop + ref.offsetHeight
      };
      dispatch(setWindowPosition({window: window, pos: windowPos}));
    }
    dispatch(openWindow({window: window, openedBy: triggeredFromWindow, openedWithCid: openedWithCid}));
  };
}

export function openMenuThunk(menu: menuEnum, ref?: (EventTarget & any), triggeredFromWindow?: windowEnum | menuEnum, plan: boolean = false, openedWithCid?: string | null) {
  return (dispatch: any) => {
    if (ref) {
      let menuPos: WindowPositionType;
      const {x, y, height, width} = ref.getBoundingClientRect();
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
          menuPos = (triggeredFromWindow !== windowEnum.dep) ? {
            x: x - (plan ? 0 : 569),
            y: plan ? ref.offsetTop : y - 3*height,
            w: width,
            h: height
          } : {
            x: x - 1,
            y: 200,
            w: width,
            h: height
          };
          break;
        case menuEnum.prevRouteMenu:
          menuPos = {
            x: x,
            y: plan ? ref.offsetTop : y - 2*height,
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
            x: ref.offsetLeft,
            y: ref.offsetTop + ref.offsetHeight
          };
      }
      dispatch(setMenuPosition({menu: menu, pos: menuPos}));
    }
    dispatch(openMenu({menu: menu, openedBy: triggeredFromWindow, openedWithCid: openedWithCid}));
  };
}

export function addTrialPlanThunk(plan: PlanType) {
  return (dispatch: any) => {
    dispatch(addTrialPlan(plan));
    dispatch(openWindow({window: windowEnum.plansDisplay}));
  };
}

export function removeTrialPlanThunk(index: number) {
  return (dispatch: any, getState: () => RootState) => {
    dispatch(removeTrialPlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(windowEnum.plansDisplay));
    }
  };
}