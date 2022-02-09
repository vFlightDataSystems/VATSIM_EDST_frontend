import {AselType} from "../../types";
import {
  ActionType,
  ADD_DEP_CID,
  DELETE_DEP_CID,
  SET_DEP_CID_LIST,
  SET_DEP_MANUAL_POSTING,
  SET_DEP_SORT
} from "../actionTypes";

export type DepType = {
  cidList: string[],
  deletedList: string[],
  asel: AselType | null,
  sortData: { name: string, sector: boolean },
  manualPosting: boolean
};

const initialState = {
  cidList: [],
  deletedList: [],
  asel: null,
  sortData: {name: 'ACID', sector: false},
  manualPosting: true
};

export function depReducer(state: DepType = initialState, action: ActionType) {
  const cid = action.payload?.cid;
  let cidListCopy, deletedListCopy;
  switch (action.type) {
    case ADD_DEP_CID:
      if (cid) {
        cidListCopy = new Set(state.cidList);
        deletedListCopy = new Set(state.deletedList);
        cidListCopy.add(cid);
        deletedListCopy.delete(cid);
        return {...state, cidList: [...cidListCopy], deletedList: [...deletedListCopy]};
      }
      return state;
    case DELETE_DEP_CID:
      if (cid) {
        cidListCopy = new Set(state.cidList);
        deletedListCopy = new Set(state.deletedList);
        deletedListCopy.add(cid);
        cidListCopy.delete(cid);
        return {...state, cidList: [...cidListCopy], deletedList: [...deletedListCopy]};
      }
      return state;
    case SET_DEP_CID_LIST:
      return {...state, cidList: action.payload.cidList, deletedList: action.payload.deletedList};
    case SET_DEP_SORT:
      return {...state, sortData: action.payload};
    case SET_DEP_MANUAL_POSTING:
      return {...state, manualPosting: action.payload.manualPosting};
    default:
      return state;
  }
}
