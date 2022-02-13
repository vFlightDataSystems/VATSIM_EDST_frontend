import {fetchBoundaryData, fetchReferenceFixes} from "../api";
import {RootState} from "./store";
import {setReferenceFixes, setSectors} from "./slices/sectorSlice";

export const fetchSectorData = (dispatch: any, getState: () => RootState) => {
  const state = getState();
  fetchBoundaryData(state.sectorData.artccId)
    .then(response => response.json())
    .then(sectors => {
      dispatch(setSectors(sectors));
    });
};

export const getReferenceFixes = (dispatch: any, getState: () => RootState) => {
  const state = getState();
  fetchReferenceFixes(state.sectorData.artccId)
    .then(response => response.json())
    .then(referenceFixes => {
      if (referenceFixes) {
        dispatch(setReferenceFixes(referenceFixes));
      }
    });
};