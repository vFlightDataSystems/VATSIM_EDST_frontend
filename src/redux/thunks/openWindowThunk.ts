import type { Nullable } from "types/utility-types";
import type { EdstWindow } from "enums/edstWindow";
import type { RootThunkAction } from "~redux/store";
import { openWindow, setWindowPosition } from "~redux/slices/appSlice";
import sharedSocket from "~socket";

export function openWindowThunk(window: EdstWindow, element?: Nullable<HTMLElement>, triggerSharedState = true): RootThunkAction {
  return (dispatch) => {
    if (element) {
      const { x, y } = element.getBoundingClientRect();
      const windowPos = {
        left: x,
        top: y + element.offsetHeight,
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(openWindow(window));
    if (triggerSharedState) {
      sharedSocket.openSharedWindow(window);
    }
  };
}
