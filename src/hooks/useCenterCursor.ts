import { DependencyList, RefObject, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";

/**
 * hook for tauri to center the mouse in the middle of element
 * @param ref ref to a DOM element
 * @param deps
 */
export const useCenterCursor = (ref: RefObject<HTMLElement>, deps: DependencyList = []) => {
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__TAURI__ && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const newCursorPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      invoke("set_cursor_position", newCursorPos).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
};
