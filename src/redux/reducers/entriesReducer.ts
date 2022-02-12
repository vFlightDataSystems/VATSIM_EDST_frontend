import {EdstEntryType} from "../../types";
import {ActionType} from "../actionTypes";

export type EntriesStateType = {
  [cid: string]: EdstEntryType
};

const initialState = {};

export function entriesReducer(state: EntriesStateType = initialState, action: ActionType) {
  switch (action.type) {
    default:
      return state;
  }
}
