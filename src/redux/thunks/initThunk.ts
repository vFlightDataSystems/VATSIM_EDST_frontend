import { refreshAirSigmets } from "~redux/thunks/weatherThunks";
import type { RootThunkAction } from "~redux/store";

export function initThunk(): RootThunkAction {
  return async (dispatch) => {
    dispatch(refreshAirSigmets());
  };
}
