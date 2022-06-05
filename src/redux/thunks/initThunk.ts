import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchArtccAirways,
  fetchArtccNavaids,
  fetchArtccSectorTypes,
  fetchArtccWaypoints,
  fetchCtrFavData,
  fetchCtrProfiles,
  fetchReferenceFixes
} from "../../api";
import { RootState } from "../store";
import { setArtccId, setReferenceFixes, setSectorId, setSectorProfiles, setSectors } from "../slices/sectorSlice";
import { refreshSigmets } from "./weatherThunks";
import { SectorType, setAirways, setNavaids, setSectorTypes, setWaypoints } from "../slices/gpdSlice";
import { Fix } from "../../types";

const DISCLAIMER_MESSAGE = `
!!! WARNING !!!\n
This vEDST project is not considered “usable” by the developers at this time.\n
Features may not always work as intended and at times will stop working completely.\n
If you wish to contribute to this project, please checkout the GitHub Repository 
https://github.com/vFlightDataSystems/VATSIM_EDST_frontend.\n
`;

export const initThunk = createAsyncThunk("app/init", async (_args, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  let { sectorData } = state;
  const gpdData = state.gpd;
  let artccId: string;
  let sectorId: string;
  if (process.env.NODE_ENV === "development") {
    artccId = process.env.REACT_APP_DEV_DEFAULT_ARTCC ?? "zbw";
    // artccId = await prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
    sectorId = "37";
  } else {
    // eslint-disable-next-line no-alert
    await alert(DISCLAIMER_MESSAGE);
    artccId =
      // eslint-disable-next-line no-alert
      (await prompt("Choose an ARTCC")
        ?.trim()
        .toLowerCase()) ?? "";
    sectorId = "37";
  }
  thunkAPI.dispatch(setArtccId(artccId));
  thunkAPI.dispatch(setSectorId(sectorId));
  if (Object.keys(sectorData.sectors).length === 0) {
    await fetchCtrFavData(artccId)
      .then(response => response.json())
      .then(sectors => {
        thunkAPI.dispatch(setSectors(sectors));
      });
  }
  sectorData = (thunkAPI.getState() as RootState).sectorData;
  // if we have no reference fixes for computing FRD, get some
  if (!(sectorData.referenceFixes.length > 0)) {
    await fetchReferenceFixes(artccId)
      .then(response => response.json())
      .then(referenceFixes => {
        if (referenceFixes) {
          thunkAPI.dispatch(setReferenceFixes(referenceFixes));
        }
      });
  }
  if (!(Object.keys(gpdData.sectorTypes).length > 0)) {
    await fetchArtccSectorTypes(artccId)
      .then(response => response.json())
      .then(sectorTypeData => {
        if (sectorTypeData) {
          const data: Record<string, SectorType> = {};
          sectorTypeData.forEach((elem: any) => {
            data[elem.id] = elem.type;
          });
          thunkAPI.dispatch(setSectorTypes(data));
        }
      });
  }
  if (!(Object.keys(sectorData.profiles).length > 0)) {
    await fetchCtrProfiles(artccId)
      .then(response => response.json())
      .then(profiles => {
        if (profiles) {
          thunkAPI.dispatch(setSectorProfiles(profiles));
        }
      });
  }
  if (!(gpdData.navaids.length > 0)) {
    await fetchArtccNavaids(artccId)
      .then(response => response.json())
      .then((navaidList: (Partial<Fix> & any)[]) => {
        if (navaidList) {
          // remove duplicates, thanks to https://stackoverflow.com/a/36744732
          navaidList = navaidList.filter((value, index, self) => index === self.findIndex(t => t.navaid_id === value.navaid_id));
          thunkAPI.dispatch(setNavaids(navaidList.map(navaid => ({ ...navaid, waypoint_id: navaid.navaid_id }))));
        }
      });
  }
  if (!(gpdData.waypoints.length > 0)) {
    await fetchArtccWaypoints(artccId)
      .then(response => response.json())
      .then((waypointList: Fix[]) => {
        if (waypointList) {
          // remove duplicates, thanks to https://stackoverflow.com/a/36744732
          waypointList = waypointList.filter((value, index, self) => index === self.findIndex(t => t.waypoint_id === value.waypoint_id));
          thunkAPI.dispatch(setWaypoints(waypointList));
        }
      });
  }
  if (!(Object.keys(gpdData.airways).length > 0)) {
    await fetchArtccAirways(artccId)
      .then(response => response.json())
      .then(aiwaySegmentList => {
        if (aiwaySegmentList) {
          thunkAPI.dispatch(setAirways(aiwaySegmentList));
        }
      });
  }
  thunkAPI.dispatch(refreshSigmets());
});
