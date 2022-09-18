import { refreshAirSigmets } from "./weatherThunks";
import { RootThunkAction } from "../store";

export function initThunk(): RootThunkAction {
  return async dispatch => {
    dispatch(refreshAirSigmets());
  };
}
