import { RefObject, useState } from "react";
import { useEventListener } from "usehooks-ts";

/**
 * provides a focused value which becomes true onMouseEnter and false onMouseLeave
 * @param element ref to a DOM element
 */
export const useFocused = (element: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener("mouseenter", () => setFocused(true), element);
  useEventListener("mouseleave", () => setFocused(false), element);
  return focused;
};
