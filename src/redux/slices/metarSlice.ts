import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";

type MetarState = {
  brightness: number;
  lines: number;
  fontSize: number;
  airports: string[];
};

const initialState: MetarState = {
  brightness: 80,
  lines: 10,
  fontSize: 2,
  airports: []
};

const metarSlice = createSlice({
  name: "metar",
  initialState,
  reducers: {
    addMetar(state, action: PayloadAction<string>) {
      if (!state.airports.includes(action.payload)) {
        state.airports.push(action.payload);
      }
    },
    delMetar(state, action: PayloadAction<string>) {
      const index = state.airports.indexOf(action.payload);
      if (index > -1) {
        state.airports.splice(index, 1);
      }
    }
  }
});

export function toggleMetar(airports: string[]): RootThunkAction {
  return (dispatch, getState) => {
    const currentAirports = getState().metar.airports;
    airports.forEach(airport => {
      if (airport.length === 4 && airport.startsWith("K")) {
        airport = airport.slice(1);
      }
      if (currentAirports.includes(airport)) {
        dispatch(delMetar(airport));
      } else {
        dispatch(addMetar(airport));
      }
    });
  };
}

export const { addMetar, delMetar } = metarSlice.actions;
export default metarSlice.reducer;

export const metarStateSelector = (state: RootState) => state.metar;
