import type { Nullable } from "types/utility-types";
import type { WindowPosition } from "types/windowPosition";
import type { EdstWindow } from "types/edstWindow";
import type { RootThunkAction } from "~redux/store";
import { openWindow, setWindowPosition } from "~redux/slices/appSlice";
import sharedSocket from "~socket";

const NO_REPOSITION_WINDOW: EdstWindow[] = ["ROUTE_MENU", "HOLD_MENU"];

export function openMenuThunk(
  edstWindow: EdstWindow,
  element?: Nullable<HTMLElement>,
  triggerSharedState = false,
  plan = false,
  centerMenu = false
): RootThunkAction {
  return (dispatch) => {
    if (element && !NO_REPOSITION_WINDOW.includes(edstWindow)) {
      let menuPos: WindowPosition;
      const { x, y, height, width } = element.getBoundingClientRect();
      switch (edstWindow) {
        case "ALTITUDE_MENU":
          menuPos = {
            left: x + (plan ? 0 : width),
            top: plan ? element.offsetTop : y - 76,
          };
          break;
        case "PREV_ROUTE_MENU":
          menuPos = {
            left: x,
            top: plan ? element.offsetTop : y - 2 * height,
          };
          break;
        case "SPEED_MENU":
          menuPos = {
            left: x + width,
            top: 200,
          };
          break;
        case "HEADING_MENU":
          menuPos = {
            left: x + width,
            top: 200,
          };
          break;
        case "TEMPLATE_MENU":
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
      dispatch(setWindowPosition({ window: edstWindow, pos: menuPos }));
    }
    dispatch(openWindow(edstWindow));
    if (triggerSharedState) {
      sharedSocket.openSharedWindow(edstWindow);
    }
  };
}
