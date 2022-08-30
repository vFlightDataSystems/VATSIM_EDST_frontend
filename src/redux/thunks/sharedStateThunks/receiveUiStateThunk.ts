import { SharedUiState } from "../../../typeDefinitions/types/sharedStateTypes/sharedUiState";
import { RootThunkAction } from "../../store";
import { receiveAclStateThunk } from "./receiveAclStateThunk";
import { receiveDepStateThunk } from "./receiveDepStateThunk";
import { receiveGpdStateThunk } from "./receiveGpdStateThunk";
import { receivePlansDisplayStateThunk } from "./receivePlansDisplayStateThunk";
import { closeAllWindows, openWindow, setAsel } from "../../slices/appSlice";

export function receiveUiStateThunk(uiState: SharedUiState): RootThunkAction {
  return dispatch => {
    dispatch(closeAllWindows());
    dispatch(receiveAclStateThunk(uiState.acl));
    dispatch(receiveDepStateThunk(uiState.dep));
    dispatch(receiveGpdStateThunk());
    dispatch(receivePlansDisplayStateThunk(uiState.plansDisplay));
    dispatch(setAsel(uiState.asel, null, true));
    uiState.openWindows.forEach(edstWindow => {
      dispatch(openWindow(edstWindow));
    });
  };
}
