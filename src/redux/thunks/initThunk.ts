import {fetchFavData, fetchHighVorList, fetchLowVorList, fetchReferenceFixes} from "../../api";
import {RootState} from "../store";
import {
  setArtccId,
  setReferenceFixes,
  setSectorId,
  setSectors,
  setVorHighList,
  setVorLowList
} from "../slices/sectorSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {refreshEntriesThunk} from "../slices/entriesSlice";
import {refreshSigmets} from "./weatherThunks";

const DISCLAIMER_MESSAGE = `
!!! WARNING !!!\n
This vEDST project is not considered “usable” by the developers at this time.\n
Features may not always work as intended and at times will stop working completely.\n
If you wish to contribute to this project, please checkout the GitHub Repo 
https://github.com/CaptainTux/VATSIM_EDST_frontend.\n
`;

export const initThunk = createAsyncThunk(
  'app/init',
  async (_args, thunkAPI) => {
    let sectorData = (thunkAPI.getState() as RootState).sectorData;
    let artccId: string;
    let sectorId: string;

    if (process.env.NODE_ENV === 'development') {
      artccId = 'zbw';
      // artccId = await prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      await alert(DISCLAIMER_MESSAGE);
      artccId = await prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    }
    thunkAPI.dispatch(setArtccId(artccId));
    thunkAPI.dispatch(setSectorId(sectorId));
    if (Object.keys(sectorData.sectors).length === 0) {
      await fetchFavData(artccId)
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
    if (!(sectorData.vorHighList.length > 0)) {
      await fetchHighVorList(artccId)
        .then(response => response.json())
        .then(vorList => {
          if (vorList) {
            thunkAPI.dispatch(setVorHighList(vorList));
          }
        });
    }
    if (!(sectorData.vorHighList.length > 0)) {
      await fetchLowVorList(artccId)
        .then(response => response.json())
        .then(vorList => {
          if (vorList) {
            thunkAPI.dispatch(setVorLowList(vorList));
          }
        });
    }
    thunkAPI.dispatch(refreshSigmets());
    return thunkAPI.dispatch(refreshEntriesThunk());
  }
);

