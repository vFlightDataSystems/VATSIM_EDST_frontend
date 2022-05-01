import {RefObject, useEffect, useState} from "react";
import {useEventListener} from "usehooks-ts";
import {invoke} from "@tauri-apps/api/tauri";

export const useFocused = (element: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener('mouseenter', () => setFocused(true), element);
  useEventListener('mouseleave', () => setFocused(false), element);
  return focused;
}

export const useCenterCursor = (element: RefObject<HTMLElement>, deps: any[] = []) => {
  useEffect(() => {
    if (window.__TAURI__ && element.current) {
      const rect = element.current?.getBoundingClientRect();
      const newCursorPos = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
      invoke('set_cursor_position', newCursorPos);
    } // eslint-disable-next-line
  }, deps);
}