import React, { ComponentType, PropsWithChildren, useRef } from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { useFocused } from "../../hooks/useFocused";
import { pushZStack, windowDimensionSelector, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useDragging } from "../../hooks/useDragging";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstDraggingOutline } from "./EdstDraggingOutline";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";

export type HeaderComponentProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
};

type FullscreenWindowProps = PropsWithChildren<{
  edstWindow: EdstWindow;
  HeaderComponent: ComponentType<HeaderComponentProps>;
  BodyComponent: ComponentType<unknown>;
}>;

export const FullscreenWindow = ({ edstWindow, HeaderComponent, BodyComponent, ...props }: FullscreenWindowProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const pos = useRootSelector(windowPositionSelector(edstWindow));
  const dimension = useRootSelector(windowDimensionSelector(edstWindow));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, edstWindow);

  const onMouseDownHandler = () => zStack.indexOf(edstWindow) < zStack.length - 1 && !isFullscreen && dispatch(pushZStack(edstWindow));

  return (
    <ResizableFloatingWindowDiv
      ref={ref}
      pos={pos}
      dimension={dimension}
      anyDragging={anyDragging}
      fullscreen={isFullscreen}
      zIndex={zStack.indexOf(edstWindow)}
      onMouseDownCapture={onMouseDownHandler}
    >
      {!isFullscreen && dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <HeaderComponent
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => !isFullscreen && startDrag(e)}
        {...props}
      />
      <BodyComponent />
    </ResizableFloatingWindowDiv>
  );
};
