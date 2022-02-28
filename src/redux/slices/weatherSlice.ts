import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";

export type WeatherStateType = {
  altimeterList: { [airport: string]: AltimeterEntryType },
  metarList: { [airport: string]: MetarEntryType },
  sigmetList: { [id: string]: SigmetEntryType }
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

export type SigmetEntryType = {
  sigmetString: string,
  suppressed: boolean
}

const initialState = {altimeterList: {}, metarList: {}, sigmetList: {}};

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
    },
    addSigmets(state, action: { payload: string[] }) {
      for (let s of action.payload) {
        if (!Object.keys(state.sigmetList).includes(btoa(s))) {
          state.sigmetList[btoa(s)] = {sigmetString: s, suppressed: false};
        }
      }

    },
    setSigmetSupressionState(state, action: { payload: { id: string, value: boolean } }) {
      if (Object.keys(state.sigmetList).includes(action.payload.id)) {
        state.sigmetList[action.payload.id].suppressed = action.payload.value;
      }
    }
  }
});

export const {
  setAirportMetar,
  removeAirportMetar,
  setAirportAltimeter,
  removeAirportAltimeter,
  addSigmets,
  setSigmetSupressionState
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const altimeterSelector = (state: RootState) => state.weather.altimeterList;
export const metarSelector = (state: RootState) => state.weather.metarList;
export const sigmetSelector = (state: RootState) => state.weather.sigmetList;