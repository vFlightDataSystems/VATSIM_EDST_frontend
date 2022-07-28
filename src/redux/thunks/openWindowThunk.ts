import { EdstWindow } from "../../namespaces";
import { RootThunkAction } from "../store";
import { openWindow, setWindowPosition } from "../slices/appSlice";

export function openWindowThunk(window: EdstWindow, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow): RootThunkAction {
  return dispatch => {
    if (ref) {
      const { x, y } = ref.getBoundingClientRect();
      const windowPos = {
        x,
        y: y + ref.offsetHeight
      };
      dispatch(setWindowPosition({ window, pos: windowPos }));
    }
    dispatch(openWindow({ window, openedBy: triggeredFromWindow }));
  };
}
