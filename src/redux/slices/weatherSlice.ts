import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, lineString, lineToPolygon, MultiPolygon, Polygon, Position } from "@turf/turf";
import { RootState, RootThunkAction } from "../store";

type WeatherState = {
  sigmetMap: Record<string, SigmetEntry>;
  airmetMap: Record<string, AirmetEntry>;
  altimeterAirports: string[];
  metarAirports: string[];
  viewSuppressedSigmet: boolean;
};

export type ApiAirSigmet = {
  airsigmet_type: string;
  text: string;
  area: Position[];
  hazard: { severity: string; type: string };
  altitude: { max_ft_msg: string; min_ft_msl: string };
  sectorIntersects?: Record<string, boolean>;
};

export type SigmetEntry = ApiAirSigmet & {
  suppressed: boolean;
  acknowledged: boolean;
  polygons: Feature<Polygon | MultiPolygon>;
};

type AirmetEntry = ApiAirSigmet & { acknowledged: boolean; polygons: Feature<Polygon | MultiPolygon> };

const initialState: WeatherState = {
  sigmetMap: {},
  airmetMap: {},
  altimeterAirports: [],
  metarAirports: [],
  viewSuppressedSigmet: true
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addSigmets(state, action: PayloadAction<ApiAirSigmet[]>) {
      action.payload.forEach(s => {
        const polygons = lineToPolygon(lineString(s.area));
        const observationTime = s.text.match(/\d{6}/)?.[0];
        if (observationTime) {
          s.text = s.text.slice(s.text.lastIndexOf(observationTime) + 2).split(/\n\s*\n/)[0];
          if (/\sSIG\w?\s/.test(s.text)) {
            state.sigmetMap[s.text] = { suppressed: false, acknowledged: false, polygons, ...s };
          } else {
            const splitText = s.text.split("\n");
            const regions = splitText[2].split("...")[1];
            const validUntil = splitText[1].match(/VALID UNTIL \d+/)?.[0];
            if (validUntil) {
              s.text = `GI ${splitText[0]} ${splitText[1].replace(validUntil, "").trim()} WITHIN ${regions} ${validUntil}`;
              state.airmetMap[s.text] = { acknowledged: false, polygons, ...s };
            }
          }
        }
      });
    },
    setSigmetSuppressed(state, action: PayloadAction<{ id: string; value: boolean }>) {
      if (Object.keys(state.sigmetMap).includes(action.payload.id)) {
        state.sigmetMap[action.payload.id].suppressed = action.payload.value;
      }
    },
    setSigmetAcknowledged(state, action: PayloadAction<{ id: string; value: boolean }>) {
      if (Object.keys(state.sigmetMap).includes(action.payload.id)) {
        state.sigmetMap[action.payload.id].acknowledged = action.payload.value;
      }
    },
    setViewSuppressedSigmet(state, action: PayloadAction<boolean>) {
      state.viewSuppressedSigmet = action.payload;
    },
    delAirmet(state, action: PayloadAction<string>) {
      if (Object.keys(state.airmetMap).includes(action.payload)) {
        delete state.airmetMap[action.payload];
      }
    },
    addAltimeter(state, action: PayloadAction<string>) {
      if (!state.altimeterAirports.includes(action.payload)) {
        state.altimeterAirports.push(action.payload);
      }
    },
    delAltimeter(state, action: PayloadAction<string>) {
      const index = state.altimeterAirports.indexOf(action.payload);
      if (index > -1) {
        state.altimeterAirports.splice(index, 1);
      }
    },
    addMetar(state, action: PayloadAction<string>) {
      if (!state.metarAirports.includes(action.payload)) {
        state.metarAirports.push(action.payload);
      }
    },
    delMetar(state, action: PayloadAction<string>) {
      const index = state.metarAirports.indexOf(action.payload);
      if (index > -1) {
        state.metarAirports.splice(index, 1);
      }
    }
  }
});

export function toggleAltimeter(airports: string[]): RootThunkAction {
  return (dispatch, getState) => {
    const currentAirports = getState().weather.altimeterAirports;
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

export function toggleMetar(airports: string[]): RootThunkAction {
  return (dispatch, getState) => {
    const currentAirports = getState().weather.metarAirports;
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

export const {
  addSigmets,
  setSigmetSuppressed,
  setSigmetAcknowledged,
  setViewSuppressedSigmet,
  delAirmet,
  addAltimeter,
  delAltimeter,
  addMetar,
  delMetar
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const sigmetSelector = (state: RootState) => state.weather.sigmetMap;
export const airmetSelector = (state: RootState) => state.weather.airmetMap;
export const altimeterAirportsSelector = (state: RootState) => state.weather.altimeterAirports;
export const metarAirportsSelector = (state: RootState) => state.weather.metarAirports;
export const viewSuppressedSigmetSelector = (state: RootState) => state.weather.viewSuppressedSigmet;
