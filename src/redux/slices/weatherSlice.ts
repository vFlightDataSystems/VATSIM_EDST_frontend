import { createSlice } from "@reduxjs/toolkit";
import { Feature, lineString, lineToPolygon, MultiPolygon, Polygon, Position } from "@turf/turf";
import { RootState } from "../store";

export type WeatherState = {
  altimeterList: Record<string, AltimeterEntry>;
  metarList: Record<string, MetarEntry>;
  sigmetList: Record<string, SigmetEntry>;
  viewSigmetSuppressed: boolean;
};

export type MetarEntry = {
  airport: string;
  metar: string;
};

export type AltimeterEntry = {
  airport: string;
  time: string;
  altimeter: string;
};

export type ApiSigmet = {
  airsigmet_type: string;
  text: string;
  area: Position[];
  hazard: { severity: string; type: string };
  altitude: { max_ft_msg: string; min_ft_msl: string };
  sectorIntersects?: Record<string, boolean>;
};

export type SigmetEntry = ApiSigmet & {
  suppressed: boolean;
  acknowledged: boolean;
  polygons: Feature<Polygon | MultiPolygon>;
};

const initialState: WeatherState = { altimeterList: {}, metarList: {}, sigmetList: {}, viewSigmetSuppressed: true };

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setAirportMetar(state, action: { payload: MetarEntry }) {
      state.metarList[action.payload.airport] = action.payload;
    },
    removeAirportMetar(state, action: { payload: string }) {
      delete state.metarList[action.payload];
    },
    setAirportAltimeter(state, action: { payload: AltimeterEntry }) {
      state.altimeterList[action.payload.airport] = action.payload;
    },
    removeAirportAltimeter(state, action: { payload: string }) {
      delete state.altimeterList[action.payload];
    },
    addSigmets(state, action: { payload: ApiSigmet[] }) {
      action.payload.forEach(s => {
        if (!Object.keys(state.sigmetList).includes(s.text) && /\sSIG\w?\s/.test(s.text)) {
          const polygons = lineToPolygon(lineString(s.area));
          state.sigmetList[s.text] = { suppressed: false, acknowledged: false, polygons, ...s };
        }
      });
    },
    setSigmetSuppressionState(state, action: { payload: { id: string; value: boolean } }) {
      if (Object.keys(state.sigmetList).includes(action.payload.id)) {
        state.sigmetList[action.payload.id].suppressed = action.payload.value;
      }
    },
    setSigmetAcknowledged(state, action: { payload: { id: string; value: boolean } }) {
      if (Object.keys(state.sigmetList).includes(action.payload.id)) {
        state.sigmetList[action.payload.id].acknowledged = action.payload.value;
      }
    },
    setViewSigmetSuppressed(state, action: { payload: boolean }) {
      state.viewSigmetSuppressed = action.payload;
    }
  }
});

export const {
  setAirportMetar,
  removeAirportMetar,
  setAirportAltimeter,
  removeAirportAltimeter,
  addSigmets,
  setSigmetSuppressionState,
  setSigmetAcknowledged,
  setViewSigmetSuppressed
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const altimeterSelector = (state: RootState) => state.weather.altimeterList;
export const metarSelector = (state: RootState) => state.weather.metarList;
export const sigmetSelector = (state: RootState) => state.weather.sigmetList;
export const viewSigmetSuppressedSelector = (state: RootState) => state.weather.viewSigmetSuppressed;
