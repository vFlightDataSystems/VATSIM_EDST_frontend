import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Feature, lineString, lineToPolygon, MultiPolygon, Polygon, Position } from "@turf/turf";
import { RootState } from "../store";

type AirportCode = string;

type WeatherState = {
  altimeterMap: Record<AirportCode, AltimeterEntry>;
  metarMap: Record<AirportCode, MetarEntry>;
  sigmetMap: Record<string, SigmetEntry>;
  viewSuppressedSigmet: boolean;
};

type MetarEntry = {
  airport: AirportCode;
  metar: string;
};

type AltimeterEntry = {
  airport: AirportCode;
  time: string;
  altimeter: string;
};

export type ApiAirSigmet = {
  airsigmet_type: string;
  text: string;
  area: Position[];
  hazard: { severity: string; type: string };
  altitude: { max_ft_msg: string; min_ft_msl: string };
  sectorIntersects?: Record<string, boolean>;
};

type SigmetEntry = ApiAirSigmet & {
  suppressed: boolean;
  acknowledged: boolean;
  polygons: Feature<Polygon | MultiPolygon>;
};

const initialState: WeatherState = { altimeterMap: {}, metarMap: {}, sigmetMap: {}, viewSuppressedSigmet: true };

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setMetar(state, action: PayloadAction<MetarEntry>) {
      state.metarMap[action.payload.airport] = action.payload;
    },
    delMetar(state, action: PayloadAction<AirportCode>) {
      delete state.metarMap[action.payload];
    },
    setAltimeter(state, action: PayloadAction<AltimeterEntry>) {
      state.altimeterMap[action.payload.airport] = action.payload;
    },
    delAltimeter(state, action: PayloadAction<AirportCode>) {
      delete state.altimeterMap[action.payload];
    },
    addSigmets(state, action: PayloadAction<ApiAirSigmet[]>) {
      action.payload.forEach(s => {
        if (!Object.keys(state.sigmetMap).includes(s.text) && /\sSIG\w?\s/.test(s.text)) {
          const polygons = lineToPolygon(lineString(s.area));
          state.sigmetMap[s.text] = { suppressed: false, acknowledged: false, polygons, ...s };
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
    }
  }
});

export const {
  setMetar,
  delMetar,
  setAltimeter,
  delAltimeter,
  addSigmets,
  setSigmetSuppressed,
  setSigmetAcknowledged,
  setViewSuppressedSigmet
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const altimeterSelector = (state: RootState) => state.weather.altimeterMap;
export const metarSelector = (state: RootState) => state.weather.metarMap;
export const sigmetSelector = (state: RootState) => state.weather.sigmetMap;
export const viewSuppressedSigmetSelector = (state: RootState) => state.weather.viewSuppressedSigmet;
