import { RefObject } from "react";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { setIsFullscreen, windowIsFullscreenSelector } from "../redux/slices/appSlice";

export const useFullscreen = (ref: RefObject<HTMLElement>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const isFullscreen = useRootSelector(windowIsFullscreenSelector(edstWindow));

  const toggleFullscreen = () => {
    dispatch(setIsFullscreen({ window: edstWindow, value: !isFullscreen }));
    if (ref.current) {
      if (!isFullscreen) {
        ref.current.style.width = `calc(100% - 10px)`;
        ref.current.style.height = "calc(100% - 10px)";
      }
    }
  };

  return { isFullscreen, toggleFullscreen };
};
