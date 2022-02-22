import {fetchAirportMetar, fetchFavData, fetchReferenceFixes, updateEdstEntry} from "../api";
import {RootState} from "./store";
import {setArtccId, setReferenceFixes, setSectorId, setSectors} from "./slices/sectorSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {refreshEntriesThunk, setEntry} from "./slices/entriesSlice";
import {refreshEntry} from "./refresh";
import {removeDestFromRouteString} from "../lib";
import _ from "lodash";
import {removeAirportAltimeter, removeAirportMetar, setAirportAltimeter, setAirportMetar} from "./slices/weatherSlice";

export const initThunk = createAsyncThunk(
  'app/init',
  async (_args, thunkAPI) => {
    let sectorData = (thunkAPI.getState() as RootState).sectorData;
    let artccId: string;
    let sectorId: string;
    if (process.env.NODE_ENV === 'development') {
      artccId = 'zlc';
      // artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    }
    thunkAPI.dispatch(setArtccId(artccId));
    thunkAPI.dispatch(setSectorId(sectorId));
    if (Object.keys(sectorData.sectors).length === 0) {
      await fetchFavData(artccId)
        .then(response => response.json())
        .then(sectors => {
          thunkAPI.dispatch(setSectors(sectors));
        });
    }
    sectorData = (thunkAPI.getState() as RootState).sectorData;
    // if we have no reference fixes for computing FRD, get some
    if (!(sectorData.referenceFixes.length > 0)) {
      await fetchReferenceFixes(artccId)
        .then(response => response.json())
        .then(referenceFixes => {
          if (referenceFixes) {
            thunkAPI.dispatch(setReferenceFixes(referenceFixes));
          }
        });
    }
    return thunkAPI.dispatch(refreshEntriesThunk());
  }
);

export const amendEntryThunk = createAsyncThunk(
  'entries/amend',
  async ({cid, planData}: { cid: string, planData: any }, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const {sectors, selectedSectors, artccId} = state.sectorData;
    const polygons = selectedSectors ? selectedSectors.map(id => sectors[id]) : Object.values(sectors).slice(0, 1);
    let currentEntry = state.entries[cid];
    if (Object.keys(planData).includes('altitude')) {
      planData.interim = null;
    }
    if (Object.keys(planData).includes('route')) {
      const dest = currentEntry.dest;
      planData.route = removeDestFromRouteString(planData.route.slice(0), dest);
      planData.previous_route = currentEntry.depDisplay ? currentEntry.route : currentEntry._route;
      planData.previous_route_data = currentEntry.depDisplay ? currentEntry.route_data : currentEntry._route_data;
    }
    planData.callsign = currentEntry.callsign;
    return updateEdstEntry(planData)
      .then(response => response.json())
      .then(updatedEntry => {
        if (updatedEntry) {
          updatedEntry = refreshEntry(updatedEntry, polygons, artccId, _.cloneDeep(currentEntry));
          updatedEntry.pending_removal = null;
          if (planData.scratch_hdg !== undefined) updatedEntry.scratch_hdg = planData.scratch_hdg;
          if (planData.scratch_spd !== undefined) updatedEntry.scratch_spd = planData.scratch_spd;
          thunkAPI.dispatch(setEntry(updatedEntry));
        }
      });
  }
);

export const addMetarThunk = createAsyncThunk(
  'weather/addMetar',
  async (airports: string | string[], thunkAPI) => {
    const metarList = (thunkAPI.getState() as RootState).weather.metarList;
    if (airports instanceof Array) {
      for (let airport of airports) {
        if (airport.length === 3) {
          airport = 'K' + airport;
        }
        if (Object.keys(metarList).includes(airport.slice(1))) {
          thunkAPI.dispatch(removeAirportMetar(airport.slice(1)));
        } else {
          await fetchAirportMetar(airport)
            .then(response => response.json())
            .then(metarData => {
              if (metarData) {
                // remove remarks and leading "K" for US airports
                let metar: string = metarData[0].split('RMK')[0].trim();
                metar = metar.replace(airport, airport.slice(1));
                // substitute time to display HHMM only
                const time = metar.match(/\d\d(\d{4})Z/)?.[1];
                if (time) {
                  metar = metar.replace(/\d\d(\d{4})Z/, time);
                }
                thunkAPI.dispatch(setAirportMetar({airport: airport.slice(1), metar: metar}));
              }
            });
        }
      }
    } else {
      let airport = airports;
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      if (Object.keys(metarList).includes(airport.slice(1))) {
        thunkAPI.dispatch(removeAirportMetar(airport.slice(1)));
      } else {
        await fetchAirportMetar(airport)
          .then(response => response.json())
          .then(metarData => {
            if (metarData) {
              // remove remarks
              let metar: string = metarData[0].split('RMK')[0].trim();
              // substitute time to display HHMM only
              const time = metar.match(/\d\d(\d{4})Z/)?.[1];
              if (time) {
                metar = metar.replace(/\d\d(\d{4})Z/, time);
              }
              thunkAPI.dispatch(setAirportMetar({airport: airport.slice(1), metar: metar}));
            }
          });
      }

    }
  }
);

export const addAltimeterThunk = createAsyncThunk(
  'weather/addMetar',
  async (airports: string | string[], thunkAPI) => {
    const altimeterList = (thunkAPI.getState() as RootState).weather.altimeterList;
    if (airports instanceof Array) {
      for (let airport of airports) {
        if (airport.length === 3) {
          airport = 'K' + airport;
        }
        if (Object.keys(altimeterList).includes(airport.slice(1))) {
          thunkAPI.dispatch(removeAirportAltimeter(airport.slice(1)));
        }
        else {
          await fetchAirportMetar(airport)
            .then(response => response.json())
            .then(metarData => {
              const metarString: string = metarData[0];
              const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
              const altimeter = metarString.match(/A\d(\d{3})/)?.[1];
              if (time && altimeter) {
                thunkAPI.dispatch(setAirportAltimeter({airport: airport.slice(1), time: time, altimeter: altimeter}));
              }
            });
        }
      }
    } else {
      let airport = airports;
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      if (Object.keys(altimeterList).includes(airport.slice(1))) {
        thunkAPI.dispatch(removeAirportAltimeter(airport.slice(1)));
      } else {
        await fetchAirportMetar(airport)
          .then(response => response.json())
          .then(metarData => {
            const metarString: string = metarData[0];
            const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
            const altimeter = metarString.match(/A\d(\d{3})/)?.[1];
            if (time && altimeter) {
              thunkAPI.dispatch(setAirportAltimeter({airport: airport.slice(1), time: time, altimeter: altimeter}));
            }
          });
      }
    }
  }
);