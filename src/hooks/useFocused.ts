import type { RefObject } from "react";
import { useState } from "react";
import { useEventListener } from "usehooks-ts";

/**
 * provides a focused value which becomes true onMouseEnter and false onMouseLeave
 * @param ref ref to a DOM element
 */
export const useFocused = (ref: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener("mouseenter", () => setFocused(true), ref);
  useEventListener("mouseleave", () => setFocused(false), ref);
  return focused;
};
