import type { DependencyList, RefObject } from "react";
import { useEffect } from "react";
import { appWindow, LogicalPosition } from "@tauri-apps/api/window";

/**
 * hook for tauri to center the mouse in the middle of element
 * @param ref ref to a DOM element
 * @param deps
 */
export const useCenterCursor = (ref: RefObject<HTMLElement | null>, deps: DependencyList = []) => {
  useEffect(() => {
    if (window.__TAURI__ && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const newCursorPos = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      void appWindow.setCursorPosition(new LogicalPosition(newCursorPos.x - 1, newCursorPos.y - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
};
