import { RootThunkAction } from "../store";
import { openWindow, pushZStack, setWindowPosition } from "../slices/appSlice";
import { EdstWindow } from "../../enums/edstWindow";

export function openWindowThunk(window: EdstWindow, ref?: EventTarget & any): RootThunkAction {
  return dispatch => {
    if (ref) {
      const { x, y } = ref.getBoundingClientRect();
      const windowPos = {
        x,
        y: y + ref.offsetHeight
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(pushZStack(window));
    dispatch(openWindow(window));
  };
}
