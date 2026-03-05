import type { RefObject } from "react";
import { useState } from "react";
import { useEventListener } from "usehooks-ts";

/**
 * provides a focused value which becomes true onMouseEnter and false onMouseLeave
 * @param ref ref to a DOM element
 */
export const useFocused = (ref: RefObject<HTMLElement | null>) => {
  const [focused, setFocused] = useState(false);
  // At runtime, the ref will always point to the HTMLElement after the component mounts, so these assertions are safe
  useEventListener("mouseenter", () => setFocused(true), ref as RefObject<HTMLElement>);
  useEventListener("mouseleave", () => setFocused(false), ref as RefObject<HTMLElement>);
  return focused;
};
