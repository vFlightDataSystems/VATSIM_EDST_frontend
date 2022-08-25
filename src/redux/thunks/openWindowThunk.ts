import { RootThunkAction } from "../store";
import { openWindow, setWindowPosition } from "../slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";

export function openWindowThunk(window: EdstWindow, eventTarget?: EventTarget & HTMLElement): RootThunkAction {
  return dispatch => {
    if (eventTarget) {
      const { x, y } = eventTarget.getBoundingClientRect();
      const windowPos = {
        x,
        y: y + eventTarget.offsetHeight
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(openWindow(window));
  };
}
