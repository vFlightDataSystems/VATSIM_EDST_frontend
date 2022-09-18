import { lineString, lineToPolygon } from "@turf/turf";
import { RootThunkAction } from "../store";
import { fetchSigmets } from "../../api/api";
import { addGIEntries } from "../slices/appSlice";
import { addAirmets, addSigmets, AirmetEntry, SigmetEntry } from "../slices/weatherSlice";

export function refreshAirSigmets(): RootThunkAction {
  return (dispatch, getState) => {
    fetchSigmets().then(airSigmetEntries => {
      const newSigmetEntries = airSigmetEntries.reverse();
      const { weather } = getState();
      const newSigmets = newSigmetEntries.filter(s => !Object.keys(weather.sigmetMap).includes(s.text) && s.airsigmet_type === "SIGMET");
      const newAirmets = newSigmetEntries.filter(s => !Object.keys(weather.airmetMap).includes(s.text) && s.airsigmet_type === "AIRMET");
      const newSigmetMap: Record<string, SigmetEntry> = {};
      const newAirmetMap: Record<string, AirmetEntry> = {};

      newSigmets.forEach(s => {
        const key = s.text.slice(0);
        const polygons = lineToPolygon(lineString(s.area));
        const observationTime = s.text.match(/\d{6}/)?.[0];
        if (observationTime) {
          s.text = s.text.slice(s.text.lastIndexOf(observationTime) + 2).split(/\n\s*\n/)[0];
          newSigmetMap[key] = { suppressed: false, acknowledged: false, polygons, ...s };
        }
      });
      newAirmets.forEach(s => {
        const key = s.text.slice(0);
        const polygons = lineToPolygon(lineString(s.area));
        const observationTime = s.text.match(/\d{6}/)?.[0];
        if (observationTime) {
          s.text = s.text.slice(s.text.lastIndexOf(observationTime) + 2).split(/\n\s*\n/)[0];
          const splitText = s.text.split("\n");
          const regions = splitText[2].split("...")[1];
          const validUntil = splitText[1].match(/VALID UNTIL \d+/)?.[0];
          if (validUntil) {
            s.text = `GI ${splitText[0]} ${splitText[1].replace(validUntil, "").trim()} WITHIN ${regions} ${validUntil}`;
            newAirmetMap[key] = { acknowledged: false, polygons, ...s };
          }
        }
      });
      const newGIEntries = Object.fromEntries(Object.entries(newAirmetMap).map(([k, v]) => [k, { text: v.text, acknowledged: v.acknowledged }]));
      dispatch(addGIEntries(newGIEntries));
      dispatch(addAirmets(newAirmetMap));
      dispatch(addSigmets(newSigmetMap));
    });
  };
}

export const refreshWeatherThunk: RootThunkAction = dispatch => {
  dispatch(refreshAirSigmets());
};
