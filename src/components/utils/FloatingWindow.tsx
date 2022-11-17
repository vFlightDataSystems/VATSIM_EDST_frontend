import React, { useRef } from "react";
import { useResizeDetector } from "react-resize-detector";
import type { CSSProperties } from "styled-components";
import type { ModifiableWindowOptions } from "~redux/slices/windowOptionsSlice";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { FloatingWindowBodyContainer, FloatingWindowBodyDiv, FloatingWindowDiv } from "styles/floatingWindowStyles";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useWindowOptions } from "hooks/useWindowOptions";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import type { FloatingWindowOptions } from "components/utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { FloatingWindowHeader } from "components/utils/FloatingWindowHeader";

type FloatingWindowBodyCSSProps = Pick<CSSProperties, "width">;
type FloatingWindowBodyProps = {
  title: string;
  optionsHeaderTitle: string;
  window: keyof ModifiableWindowOptions;
  extraOptions?: FloatingWindowOptions;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
  children?: React.ReactNode;
} & FloatingWindowBodyCSSProps;

export const FloatingWindow = ({ window: edstWindow, children, ...props }: FloatingWindowBodyProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mousedown");

  const pos = useRootSelector((state) => windowPositionSelector(state, edstWindow));
  const zStack = useRootSelector(zStackSelector);

  const windowOptions = useRootSelector(windowOptionsSelector(edstWindow));
  const options = useWindowOptions(edstWindow, props.extraOptions);
  const { width } = useResizeDetector({ targetRef: ref });

  const zIndex = zStack.indexOf(edstWindow);

  const handleOptionsMouseDown = () => {
    props.setShowOptions(true);
  };

  return (
    <FloatingWindowDiv
      pos={pos}
      zIndex={zIndex}
      onMouseDown={() => zIndex < zStack.length - 1 && dispatch(pushZStack(edstWindow))}
      ref={ref}
      anyDragging={anyDragging}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <FloatingWindowHeader
        title={props.title}
        handleOptionsMouseDown={handleOptionsMouseDown}
        onClose={() => dispatch(closeWindow(edstWindow))}
        startDrag={startDrag}
      />
      <FloatingWindowBodyContainer width={props.width} fontSize={windowOptions.fontSizeIndex}>
        {children && <FloatingWindowBodyDiv>{children}</FloatingWindowBodyDiv>}
      </FloatingWindowBodyContainer>
      {props.showOptions && width && (
        <FloatingWindowOptionContainer
          parentWidth={width}
          parentPos={pos}
          zIndex={zIndex}
          title={props.optionsHeaderTitle}
          onClose={() => props.setShowOptions(false)}
          options={options}
        />
      )}
    </FloatingWindowDiv>
  );
};
