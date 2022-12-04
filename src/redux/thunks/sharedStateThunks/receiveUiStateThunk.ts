import type { SharedUiState } from "types/sharedStateTypes/sharedUiState";
import type { RootThunkAction } from "~redux/store";
import { closeAllWindows, openWindow, setAsel } from "~redux/slices/appSlice";
import { setAclState } from "~redux/slices/aclSlice";
import { setDepState } from "~redux/slices/depSlice";
import { setGpdState } from "~redux/slices/gpdSlice";
import { setPlanState } from "~redux/slices/planSlice";

export function receiveUiStateThunk(uiState: SharedUiState): RootThunkAction {
  return (dispatch) => {
    dispatch(closeAllWindows());
    dispatch(setAclState(uiState.acl));
    dispatch(setDepState(uiState.dep));
    dispatch(setGpdState(uiState.gpd));
    dispatch(setPlanState(uiState.plansDisplay));
    dispatch(setAsel(uiState.asel, null, false));
    uiState.openWindows.forEach((edstWindow) => {
      dispatch(openWindow(edstWindow));
    });
  };
}
