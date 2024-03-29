import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useEventListener } from "usehooks-ts";
import type { Nullable } from "types/utility-types";
import { anyDraggingSelector, pushZStack, setAnyDragging, setWindowPosition, windowsSelector, zStackSelector } from "~redux/slices/appSlice";
import type { WindowPosition } from "types/windowPosition";
import type { DragPreviewStyle } from "types/dragPreviewStyle";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { EdstWindow } from "types/edstWindow";
import { appWindow, LogicalPosition } from "@tauri-apps/api/window";

const DRAGGING_REPOSITION_CURSOR: EdstWindow[] = [
  "ROUTE_MENU",
  "HOLD_MENU",
  "STATUS",
  "OUTAGE",
  "MESSAGE_COMPOSE_AREA",
  "MESSAGE_RESPONSE_AREA",
  "ALTIMETER",
  "METAR",
  "SIGMETS",
  "GI",
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const computePreviewPos = (x: number, y: number, _width: number, _height: number): WindowPosition => {
  return {
    left: x - 1,
    top: y,
  };
};

type StopDragOn = "mousedown" | "mouseup";

/**
 * hook to provide startDrag/endDrag functions with a previewStyle to render the previewWindow
 * @param ref ref to a DOM element
 * @param edstWindow window for which to trigger dragging events
 * @param stopDragOn whether to listen for stopDrag onMouseDown or onMouseUp
 * @returns
 */
export const useDragging = (ref: React.RefObject<HTMLElement>, edstWindow: EdstWindow, stopDragOn: StopDragOn) => {
  const dispatch = useRootDispatch();
  // on middleClick I always want to stop drag onmouseup
  const [currentStopDragOn, setCurrentStopDragOn] = useState(stopDragOn);
  const zStack = useRootSelector(zStackSelector);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = useState(false);
  const windows = useRootSelector(windowsSelector);
  const repositionCursor = DRAGGING_REPOSITION_CURSOR.includes(edstWindow);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<Nullable<DragPreviewStyle>>(null);
  let ppos: Nullable<WindowPosition> = null;
  ppos = windows[edstWindow].position;

  useEffect(() => {
    return () => {
      dispatch(setAnyDragging(false));
    };
  }, [dispatch]);

  const draggingHandler = useCallback(
    (event: MouseEvent) => {
      if (ref.current) {
        if (repositionCursor) {
          setDragPreviewStyle((prevStyle) => ({
            ...prevStyle!,
            left: event.clientX,
            top: event.clientY,
          }));
        } else {
          const { clientWidth: width, clientHeight: height } = ref.current;
          setDragPreviewStyle((prevStyle) => ({
            ...prevStyle!,
            ...computePreviewPos(event.pageX + prevStyle!.relX, event.pageY + prevStyle!.relY, width, height),
          }));
        }
      }
    },
    [ref, repositionCursor]
  );

  const startDrag: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (ref.current && ppos && !anyDragging && (event.button === 0 || event.button === 1)) {
        if (event.button === 1) {
          setCurrentStopDragOn("mousedown");
        }
        if (zStack.indexOf(edstWindow) < zStack.length - 1) {
          dispatch(pushZStack(edstWindow));
        }
        let previewPos;
        let relX = 0;
        let relY = 0;
        if (window.__TAURI__) {
          void appWindow.setCursorGrab(true);
        }
        if (DRAGGING_REPOSITION_CURSOR.includes(edstWindow)) {
          if (window.__TAURI__) {
            previewPos = { x: ppos.left, y: ppos.top };
            void appWindow.setCursorPosition(new LogicalPosition(previewPos.x - 1, previewPos.y - 1));
          } else {
            previewPos = { x: event.pageX, y: event.pageY };
          }
        } else {
          previewPos = { x: event.pageX, y: event.pageY };
          relX = ppos.left - event.pageX;
          relY = ppos.top - event.pageY;
        }
        const style = {
          left: previewPos.x + relX - 1,
          top: previewPos.y + relY,
          relX,
          relY,
          height:
            ref.current.clientHeight +
            parseFloat(getComputedStyle(ref.current).getPropertyValue("border")) +
            parseFloat(getComputedStyle(ref.current).getPropertyValue("margin")) * 2,
          width:
            ref.current.clientWidth +
            parseFloat(getComputedStyle(ref.current).getPropertyValue("border")) +
            parseFloat(getComputedStyle(ref.current).getPropertyValue("margin")) * 2,
        };
        setDragPreviewStyle(style);
        setDragging(true);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
      }
    },
    [anyDragging, dispatch, draggingHandler, edstWindow, ref, ppos, zStack]
  );

  const stopDrag = useCallback(() => {
    if (dragging && ref?.current && dragPreviewStyle) {
      const { left, top } = dragPreviewStyle;
      const newPos = { left: left + 1, top };
      if (window.__TAURI__) {
        void appWindow.setCursorGrab(false);
      }
      dispatch(
        setWindowPosition({
          window: edstWindow,
          pos: newPos,
        })
      );
      dispatch(setAnyDragging(false));
      setDragging(false);
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, dragging, draggingHandler, edstWindow, ref]);

  useEventListener(
    currentStopDragOn,
    (event) => {
      if (dragPreviewStyle && event.button === 0) {
        setCurrentStopDragOn(stopDragOn);
        stopDrag();
      }
    },
    undefined,
    true
  );

  return { startDrag, dragPreviewStyle, anyDragging };
};
