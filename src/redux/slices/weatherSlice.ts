import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {Feature, lineString, lineToPolygon, MultiPolygon, Polygon, Position} from "@turf/turf";

export type WeatherStateType = {
  altimeterList: { [airport: string]: AltimeterEntryType },
  metarList: { [airport: string]: MetarEntryType },
  sigmetList: { [id: string]: SigmetEntryType },
  viewSigmetSuppressed: boolean
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

export type ApiSigmetType = {
  airsigmet_type: string,
  text: string,
  area: Position[],
  hazard: {severity: string, type: string},
  altitude: {max_ft_msg: string, min_ft_msl: string},
  sectorIntersects?: {[id: string]: boolean}
}

export type SigmetEntryType = ApiSigmetType & {
  suppressed: boolean,
  acknowledged: boolean,
  polygons: Feature<Polygon | MultiPolygon>
}

const initialState = {altimeterList: {}, metarList: {}, sigmetList: {}, viewSigmetSuppressed: true};

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
    addSigmets(state, action: { payload: ApiSigmetType[] }) {
      for (let s of action.payload) {
        if (!Object.keys(state.sigmetList).includes(btoa(s.text))) {
          const polygons = lineToPolygon(lineString(s.area));
          state.sigmetList[btoa(s.text)] = {suppressed: false, acknowledged: false, polygons: polygons, ...s};
        }
      }
    },
    setSigmetSupressionState(state, action: { payload: { id: string, value: boolean } }) {
      if (Object.keys(state.sigmetList).includes(action.payload.id)) {
        state.sigmetList[action.payload.id].suppressed = action.payload.value;
      }
    },
    setSigmetAcknowledged(state, action: { payload: { id: string, value: boolean } }) {
      if (Object.keys(state.sigmetList).includes(action.payload.id)) {
        state.sigmetList[action.payload.id].acknowledged = action.payload.value;
      }
    },
    setviewSigmetSuppressed(state, action: {payload: boolean}) {
      state.viewSigmetSuppressed = action.payload
    }
  }
});

export const {
  setAirportMetar,
  removeAirportMetar,
  setAirportAltimeter,
  removeAirportAltimeter,
  addSigmets,
  setSigmetSupressionState,
  setSigmetAcknowledged,
  setviewSigmetSuppressed
} = weatherSlice.actions;
export default weatherSlice.reducer;

export const altimeterSelector = (state: RootState) => state.weather.altimeterList;
export const metarSelector = (state: RootState) => state.weather.metarList;
export const sigmetSelector = (state: RootState) => state.weather.sigmetList;
export const viewSigmetSuppressedSelector = (state: RootState) => state.weather.viewSigmetSuppressed;