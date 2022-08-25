import { RefObject } from "react";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { setIsFullscreen, windowIsFullscreenSelector } from "../redux/slices/appSlice";

export const useFullscreen = (element: RefObject<HTMLElement>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const isFullscreen = useRootSelector(windowIsFullscreenSelector(edstWindow));

  const toggleFullscreen = () => {
    if (element.current) {
      if (!isFullscreen) {
        element.current.style.width = `calc(100% - 10px)`;
        element.current.style.height = `calc(100% - 10px)`;
      } else {
        element.current.style.width = "auto";
        element.current.style.height = "auto";
      }
    }
    dispatch(setIsFullscreen({ window: edstWindow, value: !isFullscreen }));
  };

  return { isFullscreen, toggleFullscreen };
};
