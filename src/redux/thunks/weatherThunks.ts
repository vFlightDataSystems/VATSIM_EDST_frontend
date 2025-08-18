import { lineString, lineToPolygon } from "@turf/turf";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchSigmets } from "~/api/api";
import type { RootState, RootThunkAction } from "~redux/store";
import { addGIEntries } from "~redux/slices/appSlice";
import type { AirmetEntry, SigmetEntry } from "~redux/slices/weatherSlice";
import { addAirmets, addSigmets } from "~redux/slices/weatherSlice";
import { artccIdSelector } from "../slices/sectorSlice";

export const refreshAirSigmets = createAsyncThunk<void, void, { state: RootState }>("refreshAirSigmets", async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const airSigmetEntries = await fetchSigmets(artccIdSelector(state));
  const newSigmetEntries = airSigmetEntries.reverse();
  const weather = thunkAPI.getState().weather;
  const newSigmets = newSigmetEntries.filter((s) => !Object.keys(weather.sigmetMap).includes(s.rawAirSigmet) && s.airSigmetType === "SIGMET");
  const newAirmets = newSigmetEntries.filter((s) => !Object.keys(weather.airmetMap).includes(s.rawAirSigmet) && s.airSigmetType === "AIRMET");
  const newSigmetMap: Record<string, SigmetEntry> = {};
  const newAirmetMap: Record<string, AirmetEntry> = {};

  newSigmets.forEach((s) => {
    const key = s.rawAirSigmet.slice(0);
    const polygons = lineToPolygon(lineString(s.coords.map((coord) => [coord.lon, coord.lat])));
    const observationTime = s.rawAirSigmet.match(/\d{6}/)?.[0];
    if (observationTime) {
      s.rawAirSigmet = s.rawAirSigmet.slice(s.rawAirSigmet.lastIndexOf(observationTime) + 2).split(/\n\s*\n/)[0];
      newSigmetMap[key] = {
        suppressed: false,
        acknowledged: false,
        polygons,
        ...s,
      };
    }
  });
  newAirmets.forEach((s) => {
    const key = s.rawAirSigmet.slice(0);
    const polygons = lineToPolygon(lineString(s.coords.map((coord) => [coord.lon, coord.lat])));
    const observationTime = s.rawAirSigmet.match(/\d{6}/)?.[0];
    if (observationTime) {
      s.rawAirSigmet = s.rawAirSigmet.slice(s.rawAirSigmet.lastIndexOf(observationTime) + 2).split(/\n\s*\n/)[0];
      const splitText = s.rawAirSigmet.split("\n");
      const regions = splitText[2].split("...")[1];
      const validUntil = splitText[1].match(/VALID UNTIL \d+/)?.[0];
      if (validUntil) {
        s.rawAirSigmet = `GI ${splitText[0]} ${splitText[1].replace(validUntil, "").trim()} WITHIN ${regions} ${validUntil}`;
        newAirmetMap[key] = { acknowledged: false, polygons, ...s };
      }
    }
  });
  const newGIEntries = Object.fromEntries(Object.entries(newAirmetMap).map(([k, v]) => [k, { text: v.rawAirSigmet, acknowledged: v.acknowledged }]));
  thunkAPI.dispatch(addGIEntries(newGIEntries));
  thunkAPI.dispatch(addAirmets(newAirmetMap));
  thunkAPI.dispatch(addSigmets(newSigmetMap));
});

export const refreshWeatherThunk: RootThunkAction = (dispatch) => {
  dispatch(refreshAirSigmets());
};
