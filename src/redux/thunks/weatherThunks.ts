import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";
import { addSigmets, delAltimeter, delMetar, setAltimeter, setMetar } from "../slices/weatherSlice";
import { fetchAirportMetar, fetchSigmets } from "../../api/api";

const setMetarThunk = createAsyncThunk("weather/setMetar", async (airports: string[], thunkAPI) => {
  async function dispatchFetch(airport: string) {
    if (airport.length === 3) {
      airport = `K${airport}`;
    }
    return fetchAirportMetar(airport)
      .then(response => response.json())
      .then(metarData => {
        if (metarData) {
          // remove remarks and leading "K" for US airports
          let metar: string = metarData[0].split("RMK")[0].trim();
          metar = metar.replace(airport, airport.slice(1));
          // substitute time to display HHMM only
          const time = metar.match(/\d\d(\d{4})Z/)?.[1];
          if (time) {
            metar = metar.replace(/\d\d(\d{4})Z/, time);
          }
          thunkAPI.dispatch(setMetar({ airport: airport.slice(1), metar }));
        }
      });
  }

  airports.forEach(airport => {
    dispatchFetch(airport);
  });
});

export const toggleMetarThunk = createAsyncThunk("weather/toggleMetar", async (airports: string[], thunkAPI) => {
  const { metarMap } = (thunkAPI.getState() as RootState).weather;

  function dispatchAirportAddMetar(airport: string) {
    if (airport.length === 3) {
      airport = `K${airport}`;
    }
    if (Object.keys(metarMap).includes(airport.slice(1))) {
      return thunkAPI.dispatch(delMetar(airport.slice(1)));
    }
    return thunkAPI.dispatch(setMetarThunk([airport]));
  }

  airports.forEach(airport => {
    dispatchAirportAddMetar(airport);
  });
});

const setAltimeterThunk = createAsyncThunk("weather/setAltimeter", async (airport: string, thunkAPI) => {
  async function dispatchFetch(airport: string) {
    if (airport.length === 3) {
      airport = `K${airport}`;
    }
    return fetchAirportMetar(airport)
      .then(response => response.json())
      .then(metarData => {
        const metarString: string = metarData[0];
        const time = metarString.match(/\d\d(\d{4})Z/)?.[1];
        const altimeter = metarString.match(/A(\d{4})/)?.[1];
        if (time && altimeter) {
          thunkAPI.dispatch(setAltimeter({ airport: airport.slice(1), time, altimeter }));
        }
      });
  }
  await dispatchFetch(airport);
});

export const toggleAltimeterThunk = createAsyncThunk("weather/toggleAltimeter", async (airports: string[], thunkAPI) => {
  const { altimeterMap } = (thunkAPI.getState() as RootState).weather;

  function dispatchAirportAddAltimeter(airport: string) {
    if (airport.length === 3) {
      airport = `K${airport}`;
    }
    if (Object.keys(altimeterMap).includes(airport.slice(1))) {
      thunkAPI.dispatch(delAltimeter(airport.slice(1)));
    } else {
      thunkAPI.dispatch(setAltimeterThunk(airport));
    }
  }

  airports.forEach(airport => {
    dispatchAirportAddAltimeter(airport);
  });
});

export const refreshSigmets = createAsyncThunk("weather/refreshSigmets", async (_args, thunkAPI) => {
  // const sectors = (thunkAPI.getState() as RootState).sectorData.sectors;
  await fetchSigmets().then(sigmetEntries => {
    thunkAPI.dispatch(addSigmets(sigmetEntries.reverse()));
  });
});

export const refreshWeatherThunk: RootThunkAction = (dispatch, getState) => {
  const weatherState = getState().weather;
  const altimeterAirports = Object.keys(weatherState.altimeterMap);
  const metarAirports = Object.keys(weatherState.metarMap);
  if (altimeterAirports) {
    dispatch(setMetarThunk(altimeterAirports));
  }
  if (metarAirports) {
    dispatch(setMetarThunk(metarAirports));
  }
  dispatch(refreshSigmets());
};
