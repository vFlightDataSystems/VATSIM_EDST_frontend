import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import type { EdstWindow } from "types/edstWindow";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { setIsFullscreen, setWindowDimension, windowDimensionSelector, windowIsFullscreenSelector } from "~redux/slices/appSlice";

export const useFullscreen = (ref: RefObject<HTMLElement | null>, edstWindow: EdstWindow) => {
  const dispatch = useRootDispatch();
  const isFullscreen = useRootSelector((state) => windowIsFullscreenSelector(state, edstWindow));
  const dim = useRootSelector((state) => windowDimensionSelector(state, edstWindow));
  const fullscreenDim = useRef<{ width: number; height: number } | null>(null);
  const { width, height } = useResizeDetector({ targetRef: ref });

  const toggleFullscreen = () => {
    dispatch(setIsFullscreen({ window: edstWindow, value: !isFullscreen }));
  };

  useEffect(() => {
    if ((dim.width === "auto" || dim.height === "auto") && width && height) {
      dispatch(
        setWindowDimension({
          window: edstWindow,
          dim: {
            width: `${width}px`,
            height: `${height}px`,
          },
        })
      );
    }
    if (isFullscreen && ref.current && width && height) {
      fullscreenDim.current = { width, height };
    }
  }, [width, height, isFullscreen, ref, dim.width, dim.height, dispatch, edstWindow]);

  useEffect(() => {
    if (!isFullscreen && width !== fullscreenDim.current?.width && height !== fullscreenDim.current?.height) {
      dispatch(
        setWindowDimension({
          window: edstWindow,
          dim: {
            width: `${width}px`,
            height: `${height}px`,
          },
        })
      );
    }
  }, [dispatch, edstWindow, isFullscreen, height, width, dim.width, dim.height]);

  return { isFullscreen, toggleFullscreen };
};
