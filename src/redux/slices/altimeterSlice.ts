import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, RootThunkAction } from "../store";

type AltimeterState = {
  brightness: number;
  columns: number;
  lines: number;
  fontSize: number;
  airports: string[];
};

const initialState: AltimeterState = {
  brightness: 80,
  columns: 1,
  lines: 10,
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
    }
  }
});

export function toggleAltimeter(airports: string[]): RootThunkAction {
  return (dispatch, getState) => {
    const currentAirports = getState().altimeter.airports;
    airports.forEach(airport => {
      if (currentAirports.includes(airport)) {
        dispatch(delAltimeter(airport));
      } else {
        dispatch(addAltimeter(airport));
      }
    });
  };
}

export const { addAltimeter, delAltimeter } = altimeterSlice.actions;
export default altimeterSlice.reducer;

export const altimeterStateSelector = (state: RootState) => state.altimeter;
