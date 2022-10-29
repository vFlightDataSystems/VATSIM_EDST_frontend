import { refreshAirSigmets } from "./weatherThunks";
import type { RootThunkAction } from "../store";

export function initThunk(): RootThunkAction {
  return async (dispatch) => {
    dispatch(refreshAirSigmets());
  };
}
