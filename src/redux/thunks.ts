import {RootState} from "./store";
import {addAclCid, setAclLists} from "./slices/aclSlice";
import {addDepCid} from "./slices/depSlice";
import {
  aclAselActionTriggerEnum,
  aclRowFieldEnum,
  depAselActionTriggerEnum,
  depRowFieldEnum,
  windowEnum
} from "../enums";
import {REMOVAL_TIMEOUT} from "../lib";
import _ from "lodash";
import {updateEntry} from "./slices/entriesSlice";
import {WindowPositionType} from "../types";
import {closeWindow, openWindow, setAsel, setWindowPosition} from "./slices/appSlice";
import {addTrialPlan, planCleanup, PlanType} from "./slices/planSlice";


function addEntryThunk(fid: string, window: windowEnum) {
  return (dispatch: any, getState: () => RootState) => {
    const entries = getState().entries;
    let cid = Object.values(entries ?? {})?.find(e => String(e?.cid) === fid || String(e.callsign) === fid || String(e.beacon) === fid)?.cid;
    if (cid) {
      switch (window) {
        case windowEnum.acl:
          dispatch(addAclCid(cid));
          dispatch(setAsel({cid: cid, field: aclRowFieldEnum.fid, window: windowEnum.acl}));
          break;
        case windowEnum.dep:
          dispatch(addDepCid(cid));
          dispatch(setAsel({cid: cid, field: depRowFieldEnum.fid, window: windowEnum.dep}));
          break;
        default:
          break;
      }
    }
  };
}

export function addAclEntry(fid: string) {
  return addEntryThunk(fid, windowEnum.acl);
}

export function addDepEntry(fid: string) {
  return addEntryThunk(fid, windowEnum.dep);
}

export function aclCleanup(dispatch: any, getState: () => RootState) {
  const state = getState();
  let {entries} = state;
  const {cidList, deletedList} = state.acl;
  const now = new Date().getTime();
  let aclCidListCopy, aclDeletedListCopy;
  const pendingRemovalCidList = cidList.filter(cid => (now - (entries[cid]?.pending_removal ?? now) > REMOVAL_TIMEOUT));

  aclCidListCopy = _.difference(cidList, pendingRemovalCidList);
  aclDeletedListCopy = deletedList.concat(pendingRemovalCidList);
  dispatch(setAclLists({cidList: [...aclCidListCopy], deletedList: [...new Set(aclDeletedListCopy)]}));
}

const aircraftSelect = (event: any & Event,
                        window: windowEnum | null,
                        cid: string,
                        field: aclRowFieldEnum | depRowFieldEnum,
                        aselAction: aclAselActionTriggerEnum | depAselActionTriggerEnum | null = null,
                        triggerOpenWindow?: windowEnum | null
  ) => {
    return (dispatch: any, getState: () => RootState) => {
      const state = getState();
      let asel = state.app.asel;
      if (asel?.cid === cid && asel?.field === field && asel?.window === window) {
        dispatch(closeWindow(windowEnum.routeMenu));
        dispatch(closeWindow(windowEnum.altitudeMenu));
        dispatch(closeWindow(windowEnum.planOptions));
        dispatch(closeWindow(windowEnum.holdMenu));
        dispatch(closeWindow(windowEnum.prevRouteMenu));
        dispatch(closeWindow(windowEnum.speedMenu));
        dispatch(closeWindow(windowEnum.headingMenu));
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
              dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget, windowEnum.dep));
            }
            break;
          default:
            if (!state.acl.manualPosting && field === aclRowFieldEnum.fid && aselAction === aclAselActionTriggerEnum.setVciNeutral && entry?.vciStatus === -1) {
              dispatch(updateEntry({cid: cid, data: {vciStatus: 0}}));
            }
            dispatch(setAsel({cid: cid, field: field as aclRowFieldEnum, window: windowEnum.acl}));
            if (triggerOpenWindow) {
              dispatch(openWindowThunk(triggerOpenWindow, event.currentTarget, windowEnum.acl));
            }
            break;
        }
      }


      // let needOpenMenu: boolean = true;
      // if (window === windowEnum.dep) {
      //   if (asel?.cid === cid && asel?.field === field) {
      //     needOpenMenu = false;
      //   }
      //   dispatch(setAsel({cid: cid, window: window, field: depRowFieldEnum.fid}));
      // }
      // if (window === windowEnum.acl) {
      //   if (asel?.cid === cid && asel?.field === field) {
      //     needOpenMenu = false;
      //   }
      //   dispatch(setAsel(cid, field as aclRowFieldEnum, aselAction as aclAselActionTriggerEnum));
      // }
      // if (needOpenMenu && triggerOpenWindow) {
      //   const entry = state.entries[cid];
      //   if (window === windowEnum.acl && !state.acl.manualPosting && aselAction ===
      // aclAselActionTriggerEnum.setVciNeutral && entry?.vciStatus === -1) { dispatch(updateEntry({cid: cid, data:
      // {vciStatus: 0}})); } if (window === windowEnum.dep && !state.dep.manualPosting && aselAction ===
      // depAselActionTriggerEnum.setDepStatusNeutral && entry?.depStatus === -1) { dispatch(updateEntry({cid: cid,
      // data: {depStatus: 0}})); } dispatch(openWindowThunk(window as windowEnum, event.target, triggerOpenWindow,
      // false)); }

      // switch (field) {
      //   case 'alt':
      //     this.openMenu(event.target, 'alt-menu', false, asel);
      //     break;
      //   case 'route':
      //     if (entry.aclRouteDisplay === 'hold_data') {
      //       this.openMenu(event.target, 'hold-menu', false, asel);
      //     } else {
      //       this.openMenu(event.target, 'route-menu', false, asel);
      //     }
      //     break;
      //   case 'spd':
      //     this.openMenu(event.target, 'speed-menu', false, asel);
      //     break;
      //   case 'hdg':
      //     this.openMenu(event.target, 'heading-menu', false, asel);
      //     break;
      //   case 'hold':
      //     this.openMenu(event.target, 'hold-menu', false, asel);
      //     break;
      //   case 'cancel-hold':
      //     this.openMenu(event.target, 'cancel-hold-menu', false, asel);
      //     break;
      //   default:
      //     break;
      // }
    };
  }
;

export function aclAircraftSelect(event: any & Event, cid: string, field: aclRowFieldEnum, aselAction?: aclAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | null) {
  return aircraftSelect(event, windowEnum.acl, cid, field, aselAction, triggerOpenWindow);
}

export function depAircraftSelect(event: any & Event, cid: string, field: depRowFieldEnum, aselAction?: depAselActionTriggerEnum | null, triggerOpenWindow?: windowEnum | null) {
  return aircraftSelect(event, windowEnum.dep, cid, field, aselAction, triggerOpenWindow);
}

export function planCleanupThunk() {
  return (dispatch: any, getState: () => RootState) => {
    dispatch(planCleanup());
  };
}

export function openWindowThunk(window: windowEnum, ref?: EventTarget | any, triggeredFromWindow?: windowEnum, plan: boolean = false) {
  return (dispatch: any, getState: () => RootState) => {
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
    dispatch(openWindow({window: window, openedBy: triggeredFromWindow}));
  };
}

export function addTrialPlanThunk(plan: PlanType) {
  return (dispatch: any, getState: () => RootState) => {
    dispatch(addTrialPlan(plan));
    dispatch(openWindow({window: windowEnum.plansDisplay}));
  }
}