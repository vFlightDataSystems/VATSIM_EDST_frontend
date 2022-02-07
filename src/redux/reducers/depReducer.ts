import {AselProps} from "../../types";
import {
  ActionType,
  ADD_DEP_CID,
  DELETE_DEP_CID,
  SET_DEP_CID_LIST,
  SET_DEP_MANUAL_POSTING,
  SET_DEP_SORT
} from "../actionTypes";

export type DepType = {
  cid_list: string[],
  deleted_list: string[],
  asel: AselProps | null,
  sort_data: { name: string, sector: boolean },
  manual_posting: boolean
};

const initial_acl_state = {
  cid_list: [],
  deleted_list: [],
  asel: null,
  sort_data: {name: 'ACID', sector: false},
  manual_posting: true
};

export function depReducer(state: DepType = initial_acl_state, action: ActionType) {
  const cid = action.payload?.cid;
  let cid_list_copy, deleted_list_copy;
  switch (action.type) {
    case ADD_DEP_CID:
      if (cid) {
        cid_list_copy = new Set(state.cid_list);
        deleted_list_copy = new Set(state.deleted_list);
        cid_list_copy.add(cid);
        deleted_list_copy.delete(cid);
        return {...state, cid_list: [...cid_list_copy], deleted_list: [...deleted_list_copy]};
      }
      return state;
    case DELETE_DEP_CID:
      if (cid) {
        cid_list_copy = new Set(state.cid_list);
        deleted_list_copy = new Set(state.deleted_list);
        deleted_list_copy.add(cid);
        cid_list_copy.delete(cid);
        return {...state, cid_list: [...cid_list_copy], deleted_list: [...deleted_list_copy]};
      }
      return state;
    case SET_DEP_CID_LIST:
      return {...state, cid_list: action.payload.cid_list, deleted_list: action.payload.deleted_list};
    case SET_DEP_SORT:
      return {...state, sort_data: action.payload};
    case SET_DEP_MANUAL_POSTING:
      return {...state, manual_posting: action.payload.manual_posting};
    default:
      return state;
  }
}
