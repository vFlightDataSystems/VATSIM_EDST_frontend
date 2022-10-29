import type { Nullable } from "types/utility-types";
import type { WindowPosition } from "types/windowPosition";
import { EdstWindow } from "enums/edstWindow";
import type { RootThunkAction } from "../store";
import { openWindow, setWindowPosition } from "../slices/appSlice";
import sharedSocket from "../../sharedState/socket";

export function openMenuThunk(
  window: EdstWindow,
  element: Nullable<HTMLElement>,
  triggerSharedState = false,
  plan = false,
  centerMenu = false
): RootThunkAction {
  return (dispatch) => {
    if (element) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = element.getBoundingClientRect();
      switch (window) {
        case EdstWindow.ALTITUDE_MENU:
          menuPos = {
            left: x + (plan ? 0 : width),
            top: plan ? element.offsetTop : y - 76,
          };
          break;
        case EdstWindow.ROUTE_MENU:
          menuPos = !centerMenu
            ? {
                left: x - (plan ? 0 : 569),
                top: plan ? element.offsetTop : y - 3 * height,
              }
            : {
                left: x - 1,
                top: 200,
              };
          break;
        case EdstWindow.PREV_ROUTE_MENU:
          menuPos = {
            left: x,
            top: plan ? element.offsetTop : y - 2 * height,
          };
          break;
        case EdstWindow.SPEED_MENU:
          menuPos = {
            left: x + width,
            top: 200,
          };
          break;
        case EdstWindow.HEADING_MENU:
          menuPos = {
            left: x + width,
            top: 200,
          };
          break;
        case EdstWindow.TEMPLATE_MENU:
          menuPos = {
            left: 200,
            top: 200,
          };
          break;
        default:
          menuPos = {
            left: x,
            top: y + element.offsetHeight,
          };
      }
      dispatch(setWindowPosition({ window, pos: menuPos }));
    }
    dispatch(openWindow(window));
    if (triggerSharedState) {
      sharedSocket.openSharedWindow(window);
    }
  };
}
