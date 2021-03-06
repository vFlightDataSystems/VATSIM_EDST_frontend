import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {
  addSigmets, ApiSigmetType,
  removeAirportAltimeter,
  removeAirportMetar,
  setAirportAltimeter,
  setAirportMetar
} from "../slices/weatherSlice";
import {fetchAirportMetar, fetchSigmets} from "../../api";

const setMetarThunk = createAsyncThunk(
  'weather/setMetar',
  async (airports: string | string[], thunkAPI) => {

    async function dispatchFetch(airport: string) {
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      return fetchAirportMetar(airport)
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

    if (airports instanceof Array) {
      for (let airport of airports) {
        await dispatchFetch(airport);
      }
    } else {
      await dispatchFetch(airports);
    }
  }
);

export const toggleMetarThunk = createAsyncThunk(
  'weather/toggleMetar',
  async (airports: string | string[], thunkAPI) => {
    const metarList = (thunkAPI.getState() as RootState).weather.metarList;

    function dispatchAirportAddMetar(airport: string) {
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      if (Object.keys(metarList).includes(airport.slice(1))) {
        return thunkAPI.dispatch(removeAirportMetar(airport.slice(1)));
      } else {
        return thunkAPI.dispatch(setMetarThunk(airport));
      }
    }

    if (airports instanceof Array) {
      for (let airport of airports) {
        dispatchAirportAddMetar(airport);
      }
    } else {
      dispatchAirportAddMetar(airports);
    }
  }
);

const setAltimeterThunk = createAsyncThunk(
  'weather/setAltimeter',
  async (airports: string | string[], thunkAPI) => {

    async function dispatchFetch(airport: string) {
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      return fetchAirportMetar(airport)
        .then(response => response.json())
        .then(metarData => {
          const metarString: string = metarData[0];
          const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
          const altimeter = metarString.match(/A(\d{4})/)?.[1];
          if (time && altimeter) {
            thunkAPI.dispatch(setAirportAltimeter({airport: airport.slice(1), time: time, altimeter: altimeter}));
          }
        });
    }

    if (airports instanceof Array) {
      for (let airport of airports) {
        await dispatchFetch(airport);
      }
    } else {
      await dispatchFetch(airports);
    }
  }
);

export const toggleAltimeterThunk = createAsyncThunk(
  'weather/toggleAltimeter',
  async (airports: string | string[], thunkAPI) => {
    const altimeterList = (thunkAPI.getState() as RootState).weather.altimeterList;

    function dispatchAirportAddAltimeter(airport: string) {
      if (airport.length === 3) {
        airport = 'K' + airport;
      }
      if (Object.keys(altimeterList).includes(airport.slice(1))) {
        thunkAPI.dispatch(removeAirportAltimeter(airport.slice(1)));
      } else {
        thunkAPI.dispatch(setAltimeterThunk(airport));
      }
    }

    if (airports instanceof Array) {
      for (let airport of airports) {
        dispatchAirportAddAltimeter(airport);
      }
    } else {
      dispatchAirportAddAltimeter(airports);
    }
  }
);

export const refreshSigmets = createAsyncThunk(
  'weather/refreshSigmets',
  async (_args, thunkAPI) => {
    // const sectors = (thunkAPI.getState() as RootState).sectorData.sectors;
    await fetchSigmets()
      .then(response => response.json())
      .then((sigmetEntries: ApiSigmetType[]) => {
        for (let sigmetEntry of sigmetEntries) {
          const observationTime = sigmetEntry.text.match(/\d{6}/)?.[0];
          if (observationTime) {
            sigmetEntry.text = sigmetEntry.text.slice(sigmetEntry.text.lastIndexOf(observationTime) + 2);
          }
        }
        thunkAPI.dispatch(addSigmets(sigmetEntries.reverse()));
      });
  }
);

export function refreshWeatherThunk(dispatch: any, getState: () => RootState) {
  const weatherState = getState().weather;
  const altimeterAirports = Object.keys(weatherState.altimeterList);
  const metarAirports = Object.keys(weatherState.metarList);
  if (altimeterAirports) {
    dispatch(setMetarThunk(altimeterAirports));
  }
  if (metarAirports) {
    dispatch(setMetarThunk(metarAirports));
  }
  dispatch(refreshSigmets());
}