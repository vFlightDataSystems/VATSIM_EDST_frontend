import React, {RefObject, useCallback, useEffect, useState} from "react";
import {useEventListener} from "usehooks-ts";
import {invoke} from "@tauri-apps/api/tauri";
import {menuEnum, windowEnum} from "./enums";
import {
  anyDraggingSelector,
  menusSelector,
  setAnyDragging,
  setMenuPosition,
  setWindowPosition,
  windowsSelector
} from "./redux/slices/appSlice";
import {useRootDispatch, useRootSelector} from "./redux/hooks";
import {WindowPositionType} from "./types";

export const useFocused = (element: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener('mouseenter', () => setFocused(true), element);
  useEventListener('mouseleave', () => setFocused(false), element);
  return focused;
}

export const useCenterCursor = (element: RefObject<HTMLElement>, deps: any[] = []) => {
  useEffect(() => {
    if (window.__TAURI__ && element.current) {
      const rect = element.current.getBoundingClientRect();
      const newCursorPos = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
      invoke('set_cursor_position', newCursorPos).then();
    } // eslint-disable-next-line
  }, deps);
}

const DRAGGING_REPOSITION_CURSOR: (windowEnum | menuEnum)[] = [
  windowEnum.status,
  windowEnum.outage,
  windowEnum.messageComposeArea,
  windowEnum.messageResponseArea,
  windowEnum.altimeter,
  windowEnum.metar,
  windowEnum.sigmets
];

export const useDragging = (element: RefObject<HTMLElement>, edstWindow: windowEnum | menuEnum) => {
  const dispatch = useRootDispatch();
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = useState(false);
  const windows = useRootSelector(windowsSelector);
  const menus = useRootSelector(menusSelector);
  const repositionCursor = DRAGGING_REPOSITION_CURSOR.includes(edstWindow);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<any | null>(null);
  let ppos: WindowPositionType | null = null;
  if (edstWindow in windowEnum) {
    ppos = windows[edstWindow as windowEnum].position;
  } else if (edstWindow in menuEnum) {
    ppos = menus[edstWindow as menuEnum].position;
  }

  useEffect(() => {
    return () => {
      dispatch(setAnyDragging(false));
    } // eslint-disable-next-line
  }, []);

  const computePreviewPos = (x: number, y: number, _width: number, _height: number): { left: number, top: number } => {
    return {
      left: x,
      top: y
    };
  }

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event && element.current) {
      if (repositionCursor) {
        setDragPreviewStyle((prevStyle: any) => ({
          ...prevStyle, left: event.clientX, top: event.clientY
        }));
      } else {
        const {clientWidth: width, clientHeight: height} = element.current;
        setDragPreviewStyle((prevStyle: any) => ({
          ...prevStyle, ...computePreviewPos(event.pageX + prevStyle.relX, event.pageY + prevStyle.relY, width, height)
        }));
      }
    }
  }, [element, repositionCursor]);

  const startDrag = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (element.current && ppos && !anyDragging) {
      let previewPos;
      let relX = 0, relY = 0;
      if (window.__TAURI__) {
        invoke('set_cursor_grab', {value: true}).then();
      }
      if (DRAGGING_REPOSITION_CURSOR.includes(edstWindow)) {
        if (window.__TAURI__) {
          previewPos = { x: ppos.x, y: ppos.y };
          let cursorPos = {x: ppos.x, y: ppos.y + 26}
          invoke('set_cursor_position', cursorPos).then();
        }
        else {
          previewPos = { x: event.pageX, y: event.pageY };
        }
      }
      else {
        previewPos = { x: event.pageX, y: event.pageY };
        relX = ppos.x - event.pageX;
        relY = ppos.y - event.pageY;
      }
      const style = {
        left: previewPos.x + relX,
        top: previewPos.y + relY,
        relX: relX,
        relY: relY,
        height: element.current.clientHeight,
        width: element.current.clientWidth
      };
      setDragPreviewStyle(style);
      setDragging(true);
      dispatch(setAnyDragging(true));
      window.addEventListener('mousemove', draggingHandler);
    }
  }, [anyDragging, dispatch, draggingHandler, edstWindow, element, ppos]);

  const stopDrag = useCallback((_event: React.MouseEvent<HTMLElement>) => {
    if (dragging && element?.current) {
      let newPos;
      const {left: x, top: y} = dragPreviewStyle;
      newPos = { x: x + 1, y: y};
      if (window.__TAURI__) {
        invoke('set_cursor_grab', {value: false}).then();
      }
      if (edstWindow in windowEnum) {
        dispatch(setWindowPosition({
          window: edstWindow as windowEnum,
          pos: newPos
        }));
      } else if (edstWindow in menuEnum) {
        dispatch(setMenuPosition({
          menu: edstWindow as menuEnum,
          pos: newPos
        }));
      }
      dispatch(setAnyDragging(false));
      setDragging(false);
      setDragPreviewStyle(null);
      window.removeEventListener('mousemove', draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, dragging, draggingHandler, edstWindow, element]);

  return {startDrag: startDrag, stopDrag: stopDrag, dragPreviewStyle: dragPreviewStyle};
}
