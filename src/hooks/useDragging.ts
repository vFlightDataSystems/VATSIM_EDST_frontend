import React, { RefObject, useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { anyDraggingSelector, setAnyDragging, setWindowPosition, windowsSelector } from "../redux/slices/appSlice";
import { WindowPosition } from "../types/windowPosition";
import { DragPreviewStyle } from "../types/dragPreviewStyle";
import { EdstWindow } from "../enums/edstWindow";

const DRAGGING_REPOSITION_CURSOR: EdstWindow[] = [
  EdstWindow.STATUS,
  EdstWindow.OUTAGE,
  EdstWindow.MESSAGE_COMPOSE_AREA,
  EdstWindow.MESSAGE_RESPONSE_AREA,
  EdstWindow.ALTIMETER,
  EdstWindow.METAR,
  EdstWindow.SIGMETS
];
export const useDragging = (element: RefObject<HTMLElement>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = useState(false);
  const windows = useRootSelector(windowsSelector);
  const repositionCursor = DRAGGING_REPOSITION_CURSOR.includes(edstWindow);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<DragPreviewStyle | null>(null);
  let ppos: WindowPosition | null = null;
  ppos = windows[edstWindow as EdstWindow].position;

  useEffect(() => {
    return () => {
      dispatch(setAnyDragging(false));
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const computePreviewPos = (x: number, y: number, _width: number, _height: number): { left: number; top: number } => {
    return {
      left: x - 1,
      top: y
    };
  };

  const draggingHandler = useCallback(
    (event: MouseEvent) => {
      if (event && element.current) {
        if (repositionCursor) {
          setDragPreviewStyle(prevStyle => ({
            ...prevStyle!,
            left: event.clientX,
            top: event.clientY
          }));
        } else {
          const { clientWidth: width, clientHeight: height } = element.current;
          setDragPreviewStyle(prevStyle => ({
            ...prevStyle!,
            ...computePreviewPos(event.pageX + prevStyle!.relX, event.pageY + prevStyle!.relY, width, height)
          }));
        }
      }
    },
    [element, repositionCursor]
  );

  const startDrag = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (element.current && ppos && !anyDragging) {
        let previewPos;
        let relX = 0;
        let relY = 0;
        // eslint-disable-next-line no-underscore-dangle
        if (window.__TAURI__) {
          invoke("set_cursor_grab", { value: true }).then();
        }
        if (DRAGGING_REPOSITION_CURSOR.includes(edstWindow)) {
          // eslint-disable-next-line no-underscore-dangle
          if (window.__TAURI__) {
            previewPos = { x: ppos.x, y: ppos.y };
            invoke("set_cursor_position", previewPos).then();
          } else {
            previewPos = { x: event.pageX, y: event.pageY };
          }
        } else {
          previewPos = { x: event.pageX, y: event.pageY };
          relX = ppos.x - event.pageX;
          relY = ppos.y - event.pageY;
        }
        const style = {
          left: previewPos.x + relX - 1,
          top: previewPos.y + relY,
          relX,
          relY,
          height:
            element.current.clientHeight +
            parseFloat(getComputedStyle(element.current).getPropertyValue("border")) +
            parseFloat(getComputedStyle(element.current).getPropertyValue("margin")) * 2,
          width:
            element.current.clientWidth +
            parseFloat(getComputedStyle(element.current).getPropertyValue("border")) +
            parseFloat(getComputedStyle(element.current).getPropertyValue("margin")) * 2
        };
        setDragPreviewStyle(style);
        setDragging(true);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
      }
    },
    [anyDragging, dispatch, draggingHandler, edstWindow, element, ppos]
  );

  const stopDrag = useCallback(() => {
    if (dragging && element?.current && dragPreviewStyle) {
      const { left: x, top: y } = dragPreviewStyle;
      const newPos = { x: x + 1, y };
      // eslint-disable-next-line no-underscore-dangle
      if (window.__TAURI__) {
        invoke("set_cursor_grab", { value: false }).then();
      }
      dispatch(
        setWindowPosition({
          window: edstWindow as EdstWindow,
          pos: newPos
        })
      );
      dispatch(setAnyDragging(false));
      setDragging(false);
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, dragging, draggingHandler, edstWindow, element]);

  return { startDrag, stopDrag, dragPreviewStyle, anyDragging };
};
