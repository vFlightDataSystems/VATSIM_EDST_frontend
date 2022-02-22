import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export type WeatherStateType = {
  altimeterList: { [airport: string]: AltimeterEntryType },
  metarList: { [airport: string]: MetarEntryType }
}

export type MetarEntryType = {
  airport: string,
  metar: string
}

export type AltimeterEntryType = {
  airport: string,
  time: string,
  altimeter: string
}

const initialState = {altimeterList: {}, metarList: {}};

const weatherSlice = createSlice({
  name: 'weather',
  initialState: initialState as WeatherStateType,
  reducers: {
    setAirportMetar(state, action: { payload: MetarEntryType }) {
      state.metarList[action.payload.airport] = action.payload;
    },
    removeAirportMetar(state, action: { payload: string }) {
      delete state.metarList[action.payload];
    },
    setAirportAltimeter(state, action: { payload: AltimeterEntryType }) {
      state.altimeterList[action.payload.airport] = action.payload;
    },
    removeAirportAltimeter(state, action: { payload: string }) {
      delete state.altimeterList[action.payload];
    }
  }
});

export const {
  setAirportMetar,
  removeAirportMetar,
  setAirportAltimeter,
  removeAirportAltimeter
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const altimeterSelector = (state: RootState) => state.weather.altimeterList;
export const metarSelector = (state: RootState) => state.weather.metarList;