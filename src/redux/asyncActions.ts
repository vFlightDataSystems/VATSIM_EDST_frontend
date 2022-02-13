import {getBoundaryData, getReferenceFixes} from "../api";
import {RootState} from "./store";
import {setReferenceFixes, setSectors} from "./slices/sectorSlice";

export const fetchSectorData = (dispatch: any, getState: () => RootState) => {
  const state = getState();
  getBoundaryData(state.sectorData.artccId)
    .then(response => response.json())
    .then(sectors => {
      dispatch(setSectors(sectors));
    });
};

export const fetchReferenceFixes = (dispatch: any, getState: () => RootState) => {
  const state = getState();
  getReferenceFixes(state.sectorData.artccId)
    .then(response => response.json())
    .then(referenceFixes => {
      if (referenceFixes) {
        dispatch(setReferenceFixes(referenceFixes));
      }
    });
};