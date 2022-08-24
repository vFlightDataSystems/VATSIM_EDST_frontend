import { SharedUiState } from "../../../types/sharedStateTypes/sharedUiState";
import { RootThunkAction } from "../../store";
import { receiveAclStateThunk } from "./receiveAclStateThunk";
import { receiveDepStateThunk } from "./receiveDepStateThunk";
import { receiveGpdStateThunk } from "./receiveGpdStateThunk";
import { receivePlansDisplayStateThunk } from "./receivePlansDisplayStateThunk";

export function receiveUiStateThunk(uiState: SharedUiState): RootThunkAction {
  return dispatch => {
    dispatch(receiveAclStateThunk(uiState.acl));
    dispatch(receiveDepStateThunk(uiState.dep));
    dispatch(receiveGpdStateThunk(uiState.gpd));
    dispatch(receivePlansDisplayStateThunk(uiState.plansDisplay));
  };
}
