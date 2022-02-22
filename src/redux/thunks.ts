import {RootState} from "./store";
import {
  aclAselActionTriggerEnum,
  aclRowFieldEnum,
  depAselActionTriggerEnum,
  depRowFieldEnum,
  windowEnum
} from "../enums";
import {REMOVAL_TIMEOUT} from "../lib";
import {addAclEntry, addDepEntry, deleteAclEntry, updateEntry} from "./slices/entriesSlice";
import {WindowPositionType} from "../types";
import {closeWindow, openWindow, setAsel, setWindowPosition} from "./slices/appSlice";
import {addTrialPlan, planCleanup, PlanType, removeTrialPlan} from "./slices/planSlice";


function addEntryThunk(fid: string, window: windowEnum) {
  return (dispatch: any, getState: () => RootState) => {
    const entries = getState().entries;
    let cid = Object.values(entries ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid)?.cid;
    if (cid) {
      switch (window) {
        case windowEnum.acl:
          dispatch(addAclEntry(cid));
          dispatch(setAsel({cid: cid, field: aclRowFieldEnum.fid, window: windowEnum.acl}));
          break;
        case windowEnum.dep:
          dispatch(addDepEntry(cid));
          dispatch(setAsel({cid: cid, field: depRowFieldEnum.fid, window: windowEnum.dep}));
          break;
        default:
          break;
      }
    }
  };
}

export function addAclEntryByFid(fid: string) {
  return addEntryThunk(fid, windowEnum.acl);
}

export function addDepEntryByFid(fid: string) {
  return addEntryThunk(fid, windowEnum.dep);
}

export function aclCleanup(dispatch: any, getState: () => RootState) {
  const state = getState();
  let {entries} = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay
    && (now - (entry?.pending_removal ?? now) > REMOVAL_TIMEOUT));
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
  triggerOpenWindow?: windowEnum | null
) {
  return (dispatch: any, getState: () => RootState) => {
    const state = getState();
    let asel = state.app.asel;

    dispatch(closeWindow(windowEnum.routeMenu));
    dispatch(closeWindow(windowEnum.prevRouteMenu));
    dispatch(closeWindow(windowEnum.altitudeMenu));
    dispatch(closeWindow(windowEnum.planOptions));
    dispatch(closeWindow(windowEnum.holdMenu));
    dispatch(closeWindow(windowEnum.cancelHoldMenu));
    dispatch(closeWindow(windowEnum.speedMenu));
    dispatch(closeWindow(windowEnum.headingMenu));
    dispatch(closeWindow(windowEnum.templateMenu));

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
            dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget, windowEnum.dep, false, cid));
          }
          break;
        default:
          if (!state.acl.manualPosting && field === aclRowFieldEnum.fid && aselAction === aclAselActionTriggerEnum.setVciNeutral && entry?.vciStatus === -1) {
            dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
          }
          dispatch(setAsel({cid: cid, field: field as aclRowFieldEnum, window: windowEnum.acl}));
          if (triggerOpenWindow) {
            dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget, windowEnum.acl, false, cid));
          }
          break;
      }
    }
  };
}
export function aclAircraftSelect(event: Event & any, cid: string, field: aclRowFieldEnum, aselAction?: aclAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | null) {
  return aircraftSelect(event, windowEnum.acl, cid, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(event: any & Event, cid: string, field: depRowFieldEnum, aselAction?: depAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | null) {
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
      const {x, y, height, width} = ref.getBoundingClientRect();
      switch (window) {
        case windowEnum.altitudeMenu:
          windowPos = {
            x: x + (plan ? 0 : width),
            y: plan ? ref.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case windowEnum.routeMenu:
          windowPos = (triggeredFromWindow !== windowEnum.dep) ? {
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
        case windowEnum.prevRouteMenu:
          windowPos = {
            x: x,
            y: plan ? ref.offsetTop : y - 2*height,
            w: width,
            h: height
          };
          break;
        case windowEnum.speedMenu:
          windowPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        case windowEnum.headingMenu:
          windowPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        default:
          windowPos = {
            x: ref.offsetLeft,
            y: ref.offsetTop + ref.offsetHeight
          };
      }
      dispatch(setWindowPosition({window: window, pos: windowPos}));
    }
    dispatch(openWindow({window: window, openedBy: triggeredFromWindow, openedWithCid: openedWithCid}));
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