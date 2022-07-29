import { RefObject, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

export const useCenterCursor = (element: RefObject<HTMLElement>, deps: any[] = []) => {
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__TAURI__ && element.current) {
      const rect = element.current.getBoundingClientRect();
      const newCursorPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      invoke("set_cursor_position", newCursorPos).then();
    }
  }, deps);
};