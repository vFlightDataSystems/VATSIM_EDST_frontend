import { RootThunkAction } from "../store";
import { openWindow, setWindowPosition } from "../slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import sharedSocket from "../../sharedState/socket";

export function openWindowThunk(window: EdstWindow, element?: HTMLElement | null, triggeredBySharedState?: boolean): RootThunkAction {
  return dispatch => {
    if (element) {
      const { x, y } = element.getBoundingClientRect();
      const windowPos = {
        x,
        y: y + element.offsetHeight
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(openWindow(window));
    if (!triggeredBySharedState) {
      sharedSocket.openSharedWindow(window);
    }
  };
}
