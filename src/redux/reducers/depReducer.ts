import { AselProps } from "../../interfaces";
import { ActionType, ADD_DEP_CID, DELETE_DEP_CID, SET_DEP_CID_LIST } from "../actionTypes";

export type DepType = { cid_list: Array<string>, deleted_list: Array<string>, asel: AselProps | null, sort_data: {name: string, sector: null} };

const initial_acl_state = {cid_list: [], deleted_list: [], asel: null, sort_data: {name: 'ACID', sector: null}};

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
        return { ...state, cid_list: [...cid_list_copy], deleted_list: [...deleted_list_copy] };
      }
      return state;
    case DELETE_DEP_CID:
      if (cid) {
        cid_list_copy = new Set(state.cid_list);
        deleted_list_copy = new Set(state.deleted_list);
        deleted_list_copy.add(cid);
        cid_list_copy.delete(cid);
        return { ...state, cid_list: [...cid_list_copy], deleted_list: [...deleted_list_copy] };
      }
      return state;
    case SET_DEP_CID_LIST:
      return { ...state, cid_list: action.payload.cid_list, deleted_list: action.payload.deleted_list };
    default:
      return state;
  }
}
