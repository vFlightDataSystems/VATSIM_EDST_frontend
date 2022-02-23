import {fetchFavData, fetchReferenceFixes} from "../../api";
import {RootState} from "../store";
import {setArtccId, setReferenceFixes, setSectorId, setSectors} from "../slices/sectorSlice";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {refreshEntriesThunk} from "../slices/entriesSlice";

export const initThunk = createAsyncThunk(
  'app/init',
  async (_args, thunkAPI) => {
    let sectorData = (thunkAPI.getState() as RootState).sectorData;
    let artccId: string;
    let sectorId: string;
    if (process.env.NODE_ENV === 'development') {
      artccId = 'zbw';
      // artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
      sectorId = '37';
    } else {
      artccId = prompt('Choose an ARTCC')?.trim().toLowerCase() ?? '';
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
    return thunkAPI.dispatch(refreshEntriesThunk());
  }
);

