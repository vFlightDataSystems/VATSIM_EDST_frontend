import { RefObject, useState } from "react";
import { useEventListener } from "usehooks-ts";

export const useFocused = (element: RefObject<HTMLElement>) => {
  const [focused, setFocused] = useState(false);
  useEventListener("mouseenter", () => setFocused(true), element);
  useEventListener("mouseleave", () => setFocused(false), element);
  return focused;
};