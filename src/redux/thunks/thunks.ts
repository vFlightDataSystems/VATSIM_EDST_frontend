import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";
import { computeBoundaryTime, getRemainingRouteData, getRouteDataDistance, REMOVAL_TIMEOUT } from "../../lib";
import { addAclEntry, addDepEntry, deleteAclEntry, setEntry, updateEntry } from "../slices/entriesSlice";
import { AircraftTrack, AirportInfo, DerivedFlightplanData, Flightplan, RouteFix, WindowPosition } from "../../types";
import { closeAircraftMenus, closeWindow, openWindow, setAsel, setWindowPosition } from "../slices/appSlice";
import { addTrialPlan, removeTrialPlan, TrialPlan } from "../slices/planSlice";
import { fetchAirportInfo, fetchFormatRoute, fetchRouteData } from "../../api";
import { setAircraftTrack } from "../slices/aircraftTrackSlice";
import { depFilter, entryFilter } from "../../filters";
import { EDST_MENU_LIST, EdstWindow, AclRowField, DepRowField, AclAselActionTrigger, DepAselActionTrigger } from "../../namespaces";

export const aclCleanup: RootThunkAction = (dispatch, getState) => {
  const state = getState();
  const { entries } = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay && now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT);
  pendingRemovalEntryList.forEach(entry => {
    dispatch(deleteAclEntry(entry.aircraftId));
  });
};

function aircraftSelect(
  event: Event & any,
  window: EdstWindow | null,
  aircraftId: string,
  field: AclRowField | DepRowField,
  aselAction: AclAselActionTrigger | DepAselActionTrigger | null = null,
  triggerOpenWindow: EdstWindow | null = null
): RootThunkAction {
  return (dispatch, getState) => {
    const state = getState();
    const { asel } = state.app;

    dispatch(closeAircraftMenus());

    if (asel?.aircraftId === aircraftId && asel?.field === field && asel?.window === window) {
      dispatch(setAsel(null));
    } else {
      const entry = state.entries[aircraftId];
      switch (window) {
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
        default:
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

// export function planCleanupThunk() {
//   return (dispatch: any) => {
//     dispatch(planCleanup());
//   };
// }

export function openWindowThunk(window: EdstWindow, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow): RootThunkAction {
  return dispatch => {
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

export function openMenuThunk(window: EdstWindow, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow, plan = false): RootThunkAction {
  return dispatch => {
    if (ref) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = ref.getBoundingClientRect();
      switch (window) {
        case EdstWindow.ALTITUDE_MENU:
          menuPos = {
            x: x + (plan ? 0 : width),
            y: plan ? ref.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case EdstWindow.ROUTE_MENU:
          menuPos =
            triggeredFromWindow !== EdstWindow.DEP
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
        case EdstWindow.PREV_ROUTE_MENU:
          menuPos = {
            x,
            y: plan ? ref.offsetTop : y - 2 * height,
            w: width,
            h: height
          };
          break;
        case EdstWindow.SPEED_MENU:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        case EdstWindow.HEADING_MENU:
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
      dispatch(setWindowPosition({ window, pos: menuPos }));
    }
    dispatch(openWindow({ window, openedBy: triggeredFromWindow }));
  };
}

export const addTrialPlanThunk = createAsyncThunk<void, TrialPlan>("plan/trial/route", async (plan, thunkAPI) => {
  thunkAPI.dispatch(addTrialPlan(plan));
  thunkAPI.dispatch(openWindow({ window: EdstWindow.PLANS_DISPLAY }));
});

export function removeTrialPlanThunk(index: number): RootThunkAction {
  return (dispatch, getState) => {
    dispatch(removeTrialPlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
    }
  };
}

async function createEntryFromFlightplan(fp: Flightplan) {
  const depInfo = fp.departure
    ? await fetchAirportInfo(fp.departure)
        .then(response => response.json())
        .then(data => {
          if (data) {
            return { ...data, lat: Number(data.lat), lon: Number(data.lon) } as AirportInfo;
          }
          return null;
        })
    : null;
  const destInfo = fp.destination
    ? await fetchAirportInfo(fp.destination)
        .then(response => response.json())
        .then(data => {
          if (data) {
            return { ...data, lat: Number(data.lat), lon: Number(data.lon) } as AirportInfo;
          }
          return null;
        })
    : null;
  if (!(depInfo || destInfo)) {
    return null;
  }
  const formattedRoute: string = await fetchFormatRoute(fp.route, fp.departure, fp.destination)
    .then(response => response.json())
    .then(data => data ?? "");
  const routeData = (await fetchRouteData(fp.route, fp.departure, fp.destination)
    .then(response => response.json())
    .then(data => data ?? [])) as RouteFix[];
  // const icaoFields = fp.equipment.split("/").slice(1);
  // icaoFields[0] = icaoFields[0].split("-").pop() as string;
  // const nasSuffix = icaoFields?.length === 2 ? equipmentIcaoToNas(icaoFields[0], icaoFields[1]) : null;
  const nasSuffix = null;
  return {
    ...fp,
    aclDeleted: false,
    aclDisplay: false,
    boundaryTime: 0,
    depDeleted: false,
    depDisplay: false,
    nasSuffix,
    depInfo,
    destInfo,
    depStatus: -1,
    formattedRoute,
    freeTextContent: "",
    holdData: null,
    routeData,
    currentRoute: formattedRoute,
    currentRouteData: routeData,
    spa: false,
    vciStatus: -1
  };
}

const updateDerivedFlightplanThunk = createAsyncThunk<void, Flightplan>("entries/updateDerivedFlightplan", async (fp, thunkAPI) => {
  const { aircraftTracks, entries, sectorData } = thunkAPI.getState() as RootState;
  const { sectors, selectedSectorIds } = sectorData;
  const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const entry = { ...entries[fp.aircraftId] };
  const aircraftTrack = aircraftTracks[fp.aircraftId];
  if (entry) {
    const amendedData: Flightplan & Partial<DerivedFlightplanData> = { ...fp };
    if (fp.route !== entry.route) {
      amendedData.formattedRoute = await fetchFormatRoute(fp.route, fp.departure, fp.destination)
        .then(response => response.json())
        .then(data => data ?? "");
      amendedData.routeData = (await fetchRouteData(fp.route, fp.departure, fp.destination)
        .then(response => response.json())
        .then(data => data ?? [])) as RouteFix[];
    }
    const pos = [aircraftTrack.location.lon, aircraftTrack.location.lat];
    const routeDataDistance = getRouteDataDistance(entry.routeData, pos);
    const remainingRouteData = getRemainingRouteData(entry.formattedRoute, routeDataDistance, pos, entry.destination, polygons);
    thunkAPI.dispatch(
      updateEntry({
        aircraftId: fp.aircraftId,
        data: { ...amendedData, ...remainingRouteData }
      })
    );
  }
});

export const updateFlightplanThunk = createAsyncThunk<void, Flightplan>("entries/updateFlightplan", async (fp, thunkAPI) => {
  const { entries } = thunkAPI.getState() as RootState;
  const aircraftIds = Object.keys(entries);
  const flightplan = {
    ...fp,
    equipment: fp.equipment.slice(0, 6)
  };
  if (aircraftIds.includes(flightplan.aircraftId)) {
    thunkAPI.dispatch(updateDerivedFlightplanThunk(fp));
  } else {
    const entry = await createEntryFromFlightplan(flightplan);
    if (entry !== null) {
      thunkAPI.dispatch(setEntry(entry));
    }
  }
});

export function updateAircraftTrackThunk(newAircraftTrack: AircraftTrack): RootThunkAction {
  return (dispatch, getState) => {
    const updateTime = new Date().getTime();
    const { aircraftTracks, entries, sectorData } = getState();
    const { sectors, selectedSectorIds } = sectorData;
    const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    const oldTrack = aircraftTracks[newAircraftTrack.aircraftId];
    if (!oldTrack || updateTime - oldTrack.lastUpdated > 4000) {
      const entry = entries[newAircraftTrack.aircraftId];
      dispatch(setAircraftTrack({ ...newAircraftTrack, lastUpdated: updateTime }));
      if (entry) {
        const pos = [newAircraftTrack.location.lon, newAircraftTrack.location.lat];
        const routeDataDistance = getRouteDataDistance(entry.routeData, pos);
        const remainingRouteData = getRemainingRouteData(entry.formattedRoute, routeDataDistance, pos, entry.destination, polygons);
        // const boundaryTime = computeBoundaryTime(entry, newAircraftTrack, polygons);
        dispatch(
          updateEntry({
            aircraftId: newAircraftTrack.aircraftId,
            data: remainingRouteData
          })
        );
      }
      // console.log(newAircraftTrack, entry);
      // console.log(polygons, entry);
      if (polygons && entry && !entry.aclDisplay && entryFilter(entry, newAircraftTrack, polygons)) {
        dispatch(addAclEntry(newAircraftTrack.aircraftId));
      } else if (entry && !entry.depDisplay && depFilter(entry, newAircraftTrack, sectorData.artccId)) {
        dispatch(addDepEntry(newAircraftTrack.aircraftId));
      }
    }
  };
}
