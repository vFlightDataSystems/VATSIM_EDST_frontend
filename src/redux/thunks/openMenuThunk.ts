import { RootThunkAction } from "../store";
import { WindowPosition } from "../../types/windowPosition";
import { openWindow, setWindowPosition } from "../slices/appSlice";
import { EdstWindow } from "../../enums/edstWindow";

export function openMenuThunk(window: EdstWindow, ref?: EventTarget & any, triggeredFromWindow?: EdstWindow, plan = false): RootThunkAction {
  return dispatch => {
    if (ref) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = ref.getBoundingClientRect();
      switch (window) {
        case EdstWindow.ALTITUDE_MENU:
          menuPos = {
            x: x + (plan ? 0 : width),
            y: plan ? ref.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case EdstWindow.ROUTE_MENU:
          menuPos =
            triggeredFromWindow !== EdstWindow.DEP
              ? {
                  x: x - (plan ? 0 : 569),
                  y: plan ? ref.offsetTop : y - 3 * height,
                  w: width,
                  h: height
                }
              : {
                  x: x - 1,
                  y: 200,
                  w: width,
                  h: height
                };
          break;
        case EdstWindow.PREV_ROUTE_MENU:
          menuPos = {
            x,
            y: plan ? ref.offsetTop : y - 2 * height,
            w: width,
            h: height
          };
          break;
        case EdstWindow.SPEED_MENU:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        case EdstWindow.HEADING_MENU:
          menuPos = {
            x: x + width,
            y: 200,
            w: width,
            h: height
          };
          break;
        default:
          menuPos = {
            x,
            y: y + ref.offsetHeight
          };
      }
      dispatch(setWindowPosition({ window, pos: menuPos }));
    }
    dispatch(openWindow({ window, openedBy: triggeredFromWindow }));
  };
}
