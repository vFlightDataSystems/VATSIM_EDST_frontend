import type { SharedUiState } from "types/sharedStateTypes/sharedUiState";
import type { RootThunkAction } from "../../store";
import { closeAllWindows, openWindow, setAsel } from "../../slices/appSlice";
import { setAclState } from "../../slices/aclSlice";
import { setDepState } from "../../slices/depSlice";
import { setGpdState } from "../../slices/gpdSlice";
import { setPlanState } from "../../slices/planSlice";

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
