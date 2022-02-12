import {
  ActionType, SET_ARTCC_ID, SET_REFERENCE_FIXES, SET_SECTOR_DATA, SET_SECTOR_ID, SET_SELECTED_SECTORS, TOGGLE_SECTOR
} from "../actionTypes";
import {Feature, Polygon} from "@turf/turf";

export type SectorDataStateType = {
  sectors: {[id: string]: Feature<Polygon>},
  selectedSectors: string[],
  referenceFixes: any[],
  sectorId: string,
  artccId: string
};

const initialState = {
  sectors: {},
  selectedSectors: [],
  referenceFixes: [],
  sectorId: '',
  artccId: ''
};

export function sectorReducer(state: SectorDataStateType = initialState, action: ActionType) {
  let selectedSectorsSet;
  switch (action.type) {
    case SET_SECTOR_DATA:
      return {...state, sectors: action.payload};
    case SET_SELECTED_SECTORS:
      return {...state, selectedSectors: action.payload};
    case TOGGLE_SECTOR:
      if (Object.keys(state.sectors).includes(action.payload)) {
        if (state.selectedSectors.includes(action.payload)) {
          selectedSectorsSet = new Set(state.selectedSectors);
          selectedSectorsSet.delete(action.payload);
          return {...state, selectedSectors: [...selectedSectorsSet]};
        }
        else {
          return {...state, selectedSectors: [...state.selectedSectors, action.payload]};
        }
      }
      else {
        return state;
      }
    case SET_ARTCC_ID:
      return {...state, artccId: action.payload};
    case SET_SECTOR_ID:
      return {...state, sectorId: action.payload};
    case SET_REFERENCE_FIXES:
      return {...state, referenceFixes: action.payload};
    default:
      return state;
  }
}
