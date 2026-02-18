import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Feature, MultiPolygon, Polygon} from "geojson";
import type { RootState } from "~redux/store";
import { fetchAirportInfo } from "api/vNasDataApi";
import { assert } from "~/utility-functions";

type WeatherState = {
  sigmetMap: Record<string, SigmetEntry>;
  airmetMap: Record<string, AirmetEntry>;
  altimeterAirports: string[];
  metarAirports: string[];
  viewSuppressedSigmet: boolean;
  airportIdMap: Record<string, string>;
};

export type ApiAirSigmet = {
  airSigmetId: number;
  icaoId: string;
  alphaChar: string;
  receiptTime: string;
  creationTime: string;
  validTimeFrom: number;
  validTimeTo: number;
  airSigmetType: "AIRMET" | "SIGMET";
  hazard: string;
  severity: number;
  altitudeLow1: number | null;
  altitudeLow2: number | null;
  altitudeHi1: number | null;
  altitudeHi2: number | null;
  movementDir: number | null;
  movementSpd: number | null;
  rawAirSigmet: string;
  postProcessFlag: number;
  coords: Array<{
    lat: number;
    lon: number;
  }>;
  sectorIntersects?: Record<string, boolean>;
};

export type SigmetEntry = ApiAirSigmet & {
  suppressed: boolean;
  acknowledged: boolean;
  polygons: Feature<Polygon | MultiPolygon>;
};

export type AirmetEntry = ApiAirSigmet & {
  acknowledged: boolean;
  polygons: Feature<Polygon | MultiPolygon>;
};

const initialState: WeatherState = {
  sigmetMap: {},
  airmetMap: {},
  altimeterAirports: [],
  metarAirports: [],
  viewSuppressedSigmet: true,
  airportIdMap: {},
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addAirmets(state, action: PayloadAction<Record<string, AirmetEntry>>) {
      state.airmetMap = { ...state.airmetMap, ...action.payload };
    },
    addSigmets(state, action: PayloadAction<Record<string, SigmetEntry>>) {
      state.sigmetMap = { ...state.sigmetMap, ...action.payload };
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
    },
    setAirportIdMap(state, action: PayloadAction<Record<string, string>>) {
      Object.assign(state.airportIdMap, action.payload);
    },
  },
});

export async function getAirportInfoList(apiBaseUrl: string, airports: string[]) {
  const results = await Promise.all(
    airports.map(async (airport) => {
      try {
        const airportInfo = await fetchAirportInfo(apiBaseUrl, airport);

        if (!airportInfo) {
          throw new Error(`INVALID APT ID`);
        }

        const icaoId = airportInfo.icaoId || airport;
        const airportId = icaoId.length === 4 ? icaoId : `K${icaoId}`;

        return [airportId, airportInfo.faaId ?? airportId] as const;
      } catch (err) {
        throw new Error(`INVALID APT ID`);
      }
    })
  );

  return results;
}


export const toggleAltimeter = createAsyncThunk<void, string[], { state: RootState }>(
  "weather/toggleAsyncAltimeter",
  async (airports, { dispatch, getState }) => {
    const env = getState().auth.environment;
    assert(env, "Environment not set");
    const airportList = await getAirportInfoList(env.apiBaseUrl, airports);
    console.log("Received airport list from info fetch:", airportList);

    const currentAirports = getState().weather.altimeterAirports;
    console.log("Current Altimeter Airports: ", currentAirports);
    airportList.forEach(([airportId]) => {
      if (currentAirports.includes(airportId)) {
        dispatch(delAltimeter(airportId));
      } else {
        dispatch(addAltimeter(airportId));
      }
    });
    dispatch(weatherSlice.actions.setAirportIdMap(Object.fromEntries(airportList)));
  }
);

export const toggleMetar = createAsyncThunk<void, string[], { state: RootState }>(
  "weather/toggleAsyncMetar",
  async (airports, { dispatch, getState, rejectWithValue }) => {
    try {
      const env = getState().auth.environment;
      assert(env, "Environment not set");

      const airportList = await getAirportInfoList(env.apiBaseUrl, airports);

      const currentAirports = getState().weather.metarAirports;

      airportList.forEach(([airportId]) => {
        if (currentAirports.includes(airportId)) {
          dispatch(delMetar(airportId));
        } else {
          dispatch(addMetar(airportId));
        }
      });

      dispatch(weatherSlice.actions.setAirportIdMap(Object.fromEntries(airportList)));
    } catch (err) {
      console.error("toggleMetar failed:", err);
      return rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

export const {
  addAirmets,
  addSigmets,
  setSigmetSuppressed,
  setSigmetAcknowledged,
  setViewSuppressedSigmet,
  delAirmet,
  addAltimeter,
  delAltimeter,
  addMetar,
  delMetar,
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const sigmetSelector = (state: RootState) => state.weather.sigmetMap;
export const airmetSelector = (state: RootState) => state.weather.airmetMap;
export const altimeterAirportsSelector = (state: RootState) => state.weather.altimeterAirports;
export const metarAirportsSelector = (state: RootState) => state.weather.metarAirports;
export const viewSuppressedSigmetSelector = (state: RootState) => state.weather.viewSuppressedSigmet;
export const airportIdSelector = (state: RootState, airport: string) => state.weather.airportIdMap[airport];
