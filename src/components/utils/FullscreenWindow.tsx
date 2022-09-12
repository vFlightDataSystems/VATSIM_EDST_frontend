import React, { JSXElementConstructor, PropsWithChildren, useRef } from "react";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { useFocused } from "../../hooks/useFocused";
import { pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { useDragging } from "../../hooks/useDragging";
import { useFullscreen } from "../../hooks/useFullscreen";
import { EdstDraggingOutline } from "./EdstDraggingOutline";
import { ResizableFloatingWindowDiv } from "../../styles/floatingWindowStyles";

type FullscreenWindowProps = PropsWithChildren<{
  edstWindow: EdstWindow;
  HeaderComponent: JSXElementConstructor<HeaderComponentProps>;
  BodyComponent: JSXElementConstructor<unknown>;
}>;

type HeaderComponentProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const FullscreenWindow = ({ edstWindow, HeaderComponent, BodyComponent, ...props }: FullscreenWindowProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  const zStack = useRootSelector(zStackSelector);
  const pos = useRootSelector(windowPositionSelector(edstWindow));
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mouseup");
  const { isFullscreen, toggleFullscreen } = useFullscreen(ref, edstWindow);

  const onMouseDownHandler = () => zStack.indexOf(edstWindow) < zStack.length - 1 && !isFullscreen && dispatch(pushZStack(edstWindow));

  return (
    <ResizableFloatingWindowDiv
      ref={ref}
      pos={pos}
      anyDragging={anyDragging}
      fullscreen={isFullscreen}
      zIndex={zStack.indexOf(edstWindow)}
      onMouseDown={onMouseDownHandler}
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
