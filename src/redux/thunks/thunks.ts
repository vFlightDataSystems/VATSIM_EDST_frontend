import { createAsyncThunk } from "@reduxjs/toolkit";
import _ from "lodash";
import { RootState, RootThunkAction } from "../store";
import { equipmentIcaoToNas, getRemainingRouteFixes, getRouteFixesDistance, REMOVAL_TIMEOUT } from "../../lib";
import { addEntryToAcl, addEntryToDep, rmvEntryFromAcl, setEntry, updateEntries, updateEntry } from "../slices/entrySlice";
import { closeAircraftMenus, closeWindow, openWindow, setAsel, setWindowPosition } from "../slices/appSlice";
import { addPlan, removePlan, Plan } from "../slices/planSlice";
import {
  fetchPar,
  fetchPdar,
  fetchPdr,
  fetchFormatRoute,
  fetchRouteFixes,
  memoizedFetchAirportInfo,
  memoizedFetchFormatRoute,
  memoizedFetchRouteFixes
} from "../../api/api";
import { setTrack } from "../slices/trackSlice";
import { depFilter, entryFilter } from "../../filters";
import { AclAselActionTrigger, AclRowField, DepAselActionTrigger, DepRowField, EDST_MENU_LIST, EdstWindow } from "../../namespaces";
import { ApiFlightplan } from "../../types/apiFlightplan";
import { ApiAircraftTrack } from "../../types/apiAircraftTrack";
import { ApiAirportInfo } from "../../types/apiAirportInfo";
import { LocalVEdstEntry } from "../../types/localVEdstEntry";
import { WindowPosition } from "../../types/windowPosition";
import { EdstEntry } from "../../types/edstEntry";
import { DerivedFlightplanData } from "../../types/derivedFlightplanData";

export const aclCleanup: RootThunkAction = (dispatch, getState) => {
  const state = getState();
  const { entries } = state;
  const now = new Date().getTime();
  const pendingRemovalEntryList = Object.values(entries).filter(entry => entry.aclDisplay && now - (entry?.pendingRemoval ?? now) > REMOVAL_TIMEOUT);
  pendingRemovalEntryList.forEach(entry => {
    dispatch(rmvEntryFromAcl(entry.aircraftId));
  });
};

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

export const addPlanThunk = createAsyncThunk<void, Plan>("plan/trial/route", async (plan, thunkAPI) => {
  thunkAPI.dispatch(addPlan(plan));
  thunkAPI.dispatch(openWindow({ window: EdstWindow.PLANS_DISPLAY }));
});

export function removePlanThunk(index: number): RootThunkAction {
  return (dispatch, getState) => {
    dispatch(removePlan(index));
    if (getState().plan.planQueue.length === 0) {
      dispatch(closeWindow(EdstWindow.PLANS_DISPLAY));
    }
  };
}

async function createEntryFromFlightplan(fp: ApiFlightplan, artcc: string): Promise<EdstEntry | null> {
  if (!(fp.departure.startsWith("K") || fp.destination.startsWith("K"))) {
    return null;
  }
  const depInfo = fp.departure
    ? await memoizedFetchAirportInfo(fp.departure).then(data => {
        if (data) {
          return { ...data, lat: Number(data.lat), lon: Number(data.lon) } as ApiAirportInfo;
        }
        return null;
      })
    : null;
  const destInfo = fp.destination
    ? await memoizedFetchAirportInfo(fp.destination).then(data => {
        if (data) {
          return { ...data, lat: Number(data.lat), lon: Number(data.lon) } as ApiAirportInfo;
        }
        return null;
      })
    : null;
  if (!(depInfo || destInfo)) {
    return null;
  }
  const [formattedRoute, routeFixes, preferentialArrivalRoutes, preferentialDepartureRoutes, preferentialDepartureArrivalRoutes] = await Promise.all([
    memoizedFetchFormatRoute(fp.route, fp.departure, fp.destination),
    memoizedFetchRouteFixes(fp.route, fp.departure, fp.destination),
    fetchPar(artcc, fp.route, fp.equipment.split("/")[0], fp.destination, fp.altitude),
    fetchPdr(artcc, fp.route, fp.equipment.split("/")[0], fp.departure, fp.altitude),
    fetchPdar(artcc, fp.equipment.split("/")[0], fp.departure, fp.destination)
  ]);

  let nasSuffix = "";
  const icaoFields = fp.equipment.split("/").slice(1);
  if (icaoFields.length === 2) {
    icaoFields[0] = icaoFields[0].split("-").pop() as string;
    nasSuffix = equipmentIcaoToNas(icaoFields[0], icaoFields[1]);
  }
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
    routeFixes,
    currentRoute: formattedRoute,
    currentRouteFixes: routeFixes,
    preferentialDepartureRoutes,
    preferentialDepartureArrivalRoutes,
    preferentialArrivalRoutes,
    spa: false,
    vciStatus: -1,
    aclRouteDisplay: null,
    assignedHeading: null,
    assignedSpeed: null,
    interimAltitude: null
  };
}

const updateDerivedFlightplanThunk = createAsyncThunk<void, ApiFlightplan>("entries/updateDerivedFlightplan", async (fp, thunkAPI) => {
  const { aircraftTracks, entries, sectorData } = thunkAPI.getState() as RootState;
  const { sectors, selectedSectorIds } = sectorData;
  const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const entry = { ...entries[fp.aircraftId] };
  const aircraftTrack = aircraftTracks[fp.aircraftId];
  if (entry) {
    const amendedData: ApiFlightplan & Partial<DerivedFlightplanData & LocalVEdstEntry> = { ...fp };
    if (fp.route !== entry.route) {
      amendedData.formattedRoute = await fetchFormatRoute(fp.route, fp.departure, fp.destination).then(data => data ?? "");
      amendedData.routeFixes = await fetchRouteFixes(fp.route, fp.departure, fp.destination).then(data => data ?? []);
    }
    if (fp.equipment !== entry.equipment) {
      const [preferentialArrivalRoutes, preferentialDepartureRoutes, preferentialDepartureArrivalRoutes] = await Promise.all([
        fetchPar(sectorData.artccId, fp.route, fp.equipment.split("/")[0], fp.destination, fp.altitude),
        fetchPdr(sectorData.artccId, fp.route, fp.equipment.split("/")[0], fp.departure, fp.altitude),
        fetchPdar(sectorData.artccId, fp.equipment.split("/")[0], fp.departure, fp.destination)
      ]);
      _.assign(amendedData, { preferentialArrivalRoutes, preferentialDepartureRoutes, preferentialDepartureArrivalRoutes });
    }
    const pos = [aircraftTrack.location.lon, aircraftTrack.location.lat];
    const routeFixesDistance = getRouteFixesDistance(entry.routeFixes, pos);
    const remainingRouteFixes = getRemainingRouteFixes(entry.formattedRoute, routeFixesDistance, pos, entry.destination, polygons);
    thunkAPI.dispatch(
      updateEntry({
        aircraftId: fp.aircraftId,
        data: { ...amendedData, ...remainingRouteFixes }
      })
    );
  }
});

export const updateFlightplanThunk = createAsyncThunk<void, ApiFlightplan>("entries/updateFlightplan", async (fp, thunkAPI) => {
  if (fp.isIfr) {
    const { entries, sectorData } = thunkAPI.getState() as RootState;
    const aircraftIds = Object.keys(entries);
    const flightplan = {
      ...fp,
      equipment: fp.equipment.slice(0, 6)
    };
    if (aircraftIds.includes(flightplan.aircraftId)) {
      thunkAPI.dispatch(updateDerivedFlightplanThunk(fp));
    } else {
      const entry = await createEntryFromFlightplan(flightplan, sectorData.artccId);
      if (entry !== null) {
        thunkAPI.dispatch(setEntry(entry));
      }
    }
  }
});

export function updateAircraftTrackThunk(newAircraftTrack: ApiAircraftTrack): RootThunkAction {
  return (dispatch, getState) => {
    const updateTime = new Date().getTime();
    const { aircraftTracks, entries, sectorData } = getState();
    const { sectors, selectedSectorIds } = sectorData;
    const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    const oldTrack = aircraftTracks[newAircraftTrack.aircraftId];
    const updateData: Record<string, Partial<EdstEntry>> = {};
    if (!oldTrack || updateTime - oldTrack.lastUpdated > 4000) {
      const entry = entries[newAircraftTrack.aircraftId];
      dispatch(setTrack({ ...newAircraftTrack, lastUpdated: updateTime }));
      if (entry) {
        const pos = [newAircraftTrack.location.lon, newAircraftTrack.location.lat];
        const routeFixesDistance = getRouteFixesDistance(entry.routeFixes, pos);
        // const boundaryTime = computeBoundaryTime(entry, newAircraftTrack, polygons);
        updateData[entry.aircraftId] = getRemainingRouteFixes(entry.formattedRoute, routeFixesDistance, pos, entry.destination);
      }
      // console.log(newAircraftTrack, entry);
      // console.log(polygons, entry);
      if (polygons && entry && !entry.aclDisplay && entryFilter(entry, newAircraftTrack, polygons)) {
        dispatch(addEntryToAcl(newAircraftTrack.aircraftId));
      } else if (entry && !entry.depDisplay && depFilter(entry, newAircraftTrack, sectorData.artccId)) {
        dispatch(addEntryToDep(newAircraftTrack.aircraftId));
      }
    }
    dispatch(updateEntries(updateData));
  };
}
