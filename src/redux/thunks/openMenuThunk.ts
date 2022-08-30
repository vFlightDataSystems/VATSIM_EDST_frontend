import { RootThunkAction } from "../store";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { openWindow, setWindowPosition } from "../slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import sharedSocket from "../../sharedState/socket";

export function openMenuThunk(window: EdstWindow, element: HTMLElement | null, triggeredBySharedState?: boolean, plan = false): RootThunkAction {
  return dispatch => {
    if (element) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = element.getBoundingClientRect();
      switch (window) {
        case EdstWindow.ALTITUDE_MENU:
          menuPos = {
            x: x + (plan ? 0 : width),
            y: plan ? element.offsetTop : y - 76,
            w: width,
            h: height
          };
          break;
        case EdstWindow.ROUTE_MENU:
          menuPos = {
            x: x - (plan ? 0 : 569),
            y: plan ? element.offsetTop : y - 3 * height,
            w: width,
            h: height
          };
          break;
        case EdstWindow.PREV_ROUTE_MENU:
          menuPos = {
            x,
            y: plan ? element.offsetTop : y - 2 * height,
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
            y: y + element.offsetHeight
          };
      }
      dispatch(setWindowPosition({ window, pos: menuPos }));
    }
    dispatch(openWindow(window));
    if (!triggeredBySharedState) {
      sharedSocket.openSharedWindow(window);
    }
  };
}
