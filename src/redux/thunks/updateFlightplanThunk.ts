import { createAsyncThunk } from "@reduxjs/toolkit";
import _ from "lodash";
import { ApiFlightplan } from "../../types/apiTypes/apiFlightplan";
import { RootState } from "../store";
import { DerivedFlightplanData } from "../../types/derivedFlightplanData";
import { LocalVEdstEntry } from "../../types/localVEdstEntry";
import {
  fetchFormatRoute,
  fetchPar,
  fetchPdar,
  fetchPdr,
  fetchRouteFixes,
  memoizedFetchAirportInfo,
  memoizedFetchFormatRoute,
  memoizedFetchRouteFixes
} from "../../api/api";
import { setEntry, updateEntry } from "../slices/entrySlice";
import { EdstEntry } from "../../types/edstEntry";
import { ApiAirportInfo } from "../../types/apiTypes/apiAirportInfo";

async function createEntryFromFlightplan(fp: ApiFlightplan, artcc: string): Promise<EdstEntry | null> {
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
  return {
    ...fp,
    aclDeleted: false,
    aclDisplay: false,
    boundaryTime: 0,
    depDeleted: false,
    depDisplay: false,
    depInfo,
    destInfo,
    depStatus: -1,
    formattedRoute,
    freeTextContent: "",
    holdAnnotations: null,
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
    interimAltitude: null,
    aclHighlighted: false,
    depHighlighted: false,
    keep: false,
    pendingRemoval: null,
    previousRoute: null,
    remarksChecked: false,
    scratchpadHeading: null,
    scratchpadSpeed: null,
    showFreeText: false,
    uplinkEligible: false,
    voiceType: ""
  };
}

const updateDerivedFlightplanThunk = createAsyncThunk<void, ApiFlightplan>("entries/updateDerivedFlightplan", async (fp, thunkAPI) => {
  const { entries, sectorData } = thunkAPI.getState() as RootState;
  // const { sectors, selectedSectorIds } = sectorData;
  // const polygons = selectedSectorIds ? selectedSectorIds.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
  const entry = { ...entries[fp.aircraftId] };
  // const aircraftTrack = aircraftTracks[fp.aircraftId];
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
      _.assign(amendedData, {
        preferentialArrivalRoutes,
        preferentialDepartureRoutes,
        preferentialDepartureArrivalRoutes
      });
    }
    // const pos = [aircraftTrack.location.lon, aircraftTrack.location.lat];
    // const routeFixesDistance = getRouteFixesDistance(entry.routeFixes, pos);
    // const remainingRouteFixes = getRemainingRouteFixes(entry.formattedRoute, routeFixesDistance, pos, entry.destination, polygons);
    const remainingRouteFixes = { currentRoute: amendedData.formattedRoute, currentRouteFixes: amendedData.routeFixes };
    thunkAPI.dispatch(
      updateEntry({
        aircraftId: fp.aircraftId,
        data: { ...amendedData, ...remainingRouteFixes }
      })
    );
  }
});
export const updateFlightplanThunk = createAsyncThunk<void, ApiFlightplan>("entries/updateFlightplan", async (flightplan, thunkAPI) => {
  const { entries, sectorData } = thunkAPI.getState() as RootState;
  const aircraftIds = Object.keys(entries);
  if (aircraftIds.includes(flightplan.aircraftId)) {
    thunkAPI.dispatch(updateDerivedFlightplanThunk(flightplan));
  } else {
    const entry = await createEntryFromFlightplan(flightplan, sectorData.artccId);
    if (entry !== null) {
      thunkAPI.dispatch(setEntry(entry));
    }
  }
});
