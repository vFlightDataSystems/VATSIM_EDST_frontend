import { RefObject, useEffect } from "react";
import { useResizeDetector } from "react-resize-detector";
import { EdstWindow } from "../typeDefinitions/enums/edstWindow";
import { useRootDispatch, useRootSelector } from "../redux/hooks";
import { setIsFullscreen, setWindowDimension, windowDimensionSelector, windowIsFullscreenSelector } from "../redux/slices/appSlice";

export const useFullscreen = (ref: RefObject<HTMLElement>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const isFullscreen = useRootSelector(windowIsFullscreenSelector(edstWindow));
  const dimension = useRootSelector(windowDimensionSelector(edstWindow));
  const { width, height } = useResizeDetector({ targetRef: ref });

  const toggleFullscreen = () => {
    dispatch(setIsFullscreen({ window: edstWindow, value: !isFullscreen }));
    if (!isFullscreen) {
      if (ref.current) {
        ref.current.style.width = `calc(100% - 10px)`;
        ref.current.style.height = "calc(100% - 10px)";
      }
    } else if (dimension.width !== "auto" && dimension.height !== "auto") {
      if (ref.current) {
        ref.current.style.width = dimension.width;
        ref.current.style.height = dimension.height;
      }
    }
  };

  useEffect(() => {
    if (!isFullscreen && width && height) {
      dispatch(
        setWindowDimension({
          window: edstWindow,
          dim: {
            width: `${width}px`,
            height: `${height}px`
          }
        })
      );
    }
  }, [dispatch, edstWindow, isFullscreen, height, width]);

  return { isFullscreen, toggleFullscreen };
};
