import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";

type AltimeterState = {
  brightness: number;
  columns: number;
  lines: number;
  fontSize: number;
  airports: string[];
};

export type AltimCountableKeys = keyof Omit<AltimeterState, "airports" | "columns" | "lines">;

const maxValues: Record<AltimCountableKeys, number> = {
  brightness: 100,
  fontSize: 5
};

const initialState: AltimeterState = {
  brightness: 80,
  columns: 1,
  lines: 5,
  fontSize: 2,
  airports: []
};

const altimeterSlice = createSlice({
  name: "altimeter",
  initialState,
  reducers: {
    addAltimeter(state, action: PayloadAction<string>) {
      if (!state.airports.includes(action.payload)) {
        state.airports.push(action.payload);
      }
    },
    delAltimeter(state, action: PayloadAction<string>) {
      const index = state.airports.indexOf(action.payload);
      if (index > -1) {
        state.airports.splice(index, 1);
      }
    },
    decValue(state, action: PayloadAction<AltimCountableKeys>) {
      if (state[action.payload] > 1) {
        state[action.payload] -= 1;
      }
    },
    incValue(state, action: PayloadAction<AltimCountableKeys>) {
      if (state[action.payload] < maxValues[action.payload]) {
        state[action.payload] += 1;
      }
    }
  }
});

export function toggleAltimeter(airports: string[]): RootThunkAction {
  return (dispatch, getState) => {
    const currentAirports = getState().altimeter.airports;
    airports.forEach(airport => {
      if (airport.length === 4 && airport.startsWith("K")) {
        airport = airport.slice(1);
      }
      if (currentAirports.includes(airport)) {
        dispatch(delAltimeter(airport));
      } else {
        dispatch(addAltimeter(airport));
      }
    });
  };
}

export const { addAltimeter, delAltimeter, incValue: incAltimStateValue, decValue: decAltimStateValue } = altimeterSlice.actions;
export default altimeterSlice.reducer;

export const altimeterStateSelector = (state: RootState) => state.altimeter;
