import React, { PropsWithChildren, useRef } from "react";
import { ThemeProvider } from "styled-components";
import { ModifiableWindowOptions, windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { FloatingWindowBodyDiv, FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { FloatingWindowOptionContainer, FloatingWindowOptions } from "./FloatingWindowOptionContainer";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { useDragging } from "../../hooks/useDragging";
import { useWindowOptions } from "../../hooks/useWindowOptions";
import { EdstDraggingOutline } from "./EdstDraggingOutline";
import { FloatingWindowHeader } from "./FloatingWindowHeader";

type FloatingWindowBodyProps = PropsWithChildren<{
  title: string;
  optionsHeaderTitle: string;
  minWidth: string;
  maxWidth?: string;
  window: keyof ModifiableWindowOptions;
  extraOptions?: FloatingWindowOptions;
  showOptions: boolean;
  setShowOptions: (value: boolean) => void;
}>;

export const FloatingWindow = ({ window: edstWindow, children, ...props }: FloatingWindowBodyProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, edstWindow, "mousedown");

  const pos = useRootSelector(windowPositionSelector(edstWindow));
  const zStack = useRootSelector(zStackSelector);

  const windowOptions = useRootSelector(windowOptionsSelector(edstWindow));
  const options = useWindowOptions(edstWindow, props.extraOptions);

  const zIndex = zStack.indexOf(edstWindow);

  const handleOptionsMouseDown = () => {
    props.setShowOptions(true);
  };

  return (
    pos && (
      <FloatingWindowDiv
        minWidth={props.minWidth}
        maxWidth={props.maxWidth}
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
        <ThemeProvider theme={windowOptions}>{children && <FloatingWindowBodyDiv>{children}</FloatingWindowBodyDiv>}</ThemeProvider>
        {props.showOptions && ref.current && (
          <FloatingWindowOptionContainer
            pos={{
              x: pos.x + ref.current.clientWidth,
              y: pos.y
            }}
            zIndex={zIndex}
            title={props.optionsHeaderTitle}
            onClose={() => props.setShowOptions(false)}
            options={options}
          />
        )}
      </FloatingWindowDiv>
    )
  );
};
