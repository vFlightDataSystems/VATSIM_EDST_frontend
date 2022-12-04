import { useWindowSize } from "usehooks-ts";
import type { RefObject } from "react";
import { useLayoutEffect } from "react";
import { setWindowPosition, windowPositionSelector } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { EdstWindow } from "types/edstWindow";

export const useFitWindowToScreen = (ref: RefObject<HTMLElement>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const pos = useRootSelector((state) => windowPositionSelector(state, edstWindow));
  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    if (ref.current && windowSize.width > 0 && windowSize.height > 0) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.left + rect.width > windowSize.width || rect.top + rect.height > windowSize.height) {
        const newLeft = Math.min(pos.left, windowSize.width - rect.width);
        const newTop = Math.min(pos.top, windowSize.height - rect.height);
        if (newLeft !== pos.left || newTop !== pos.top) {
          dispatch(setWindowPosition({ window: edstWindow, pos: { left: newLeft, top: newTop } }));
        }
      }
    }
  }, [dispatch, edstWindow, pos.left, pos.top, ref, windowSize.height, windowSize.width]);
};
