import React, { useMemo, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useResizeDetector } from "react-resize-detector";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { mraMsgSelector, pushZStack, setMraMessage, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { FloatingWindowDiv } from "styles/floatingWindowStyles";
import { useDragging } from "hooks/useDragging";
import { EdstWindow } from "enums/edstWindow";
import { useWindowOptions } from "hooks/useWindowOptions";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";

type MessageResponseAreaDivProps = {
  width: number;
  fontSizeIndex: number;
  brightness: number;
};
const MessageResponseAreaDiv = styled(FloatingWindowDiv)<MessageResponseAreaDivProps>`
  font-size: ${(props) => props.theme.fontProps.floatingFontSizes[props.fontSizeIndex - 1]};
  line-height: 1em;
  padding: 0 2px;
  min-height: 4em;
  width: ${(props) => `${props.width}ch`};
  background-color: #000000;
  border: 1px solid #adadad;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: ${(props) => props.theme.fontProps.eramFontFamily};
  ${(props) =>
    css`
      color: rgba(${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.brightness});
    `};
`;

export const MessageResponseArea = () => {
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.MESSAGE_RESPONSE_AREA));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_RESPONSE_AREA, "mousedown");
  const { width } = useResizeDetector({ targetRef: ref });

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.MESSAGE_RESPONSE_AREA));
  const extraOptions = useMemo(
    () => ({
      clear: {
        value: "CLEAR",
        backgroundColor: "#000000",
        onMouseDown: () => dispatch(setMraMessage("")),
      },
    }),
    [dispatch]
  );
  const options = useWindowOptions(EdstWindow.MESSAGE_RESPONSE_AREA, extraOptions);

  const onMraMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 1:
        setShowOptions(true);
        event.stopPropagation();
        break;
      default:
        startDrag(event);
        if (zStack.indexOf(EdstWindow.MESSAGE_RESPONSE_AREA) < zStack.length - 1) {
          dispatch(pushZStack(EdstWindow.MESSAGE_RESPONSE_AREA));
        }
        break;
    }
  };

  const zIndex = zStack.indexOf(EdstWindow.MESSAGE_RESPONSE_AREA);

  return (
    pos && (
      <>
        <MessageResponseAreaDiv
          {...windowOptions}
          pos={pos}
          zIndex={zIndex}
          ref={ref}
          anyDragging={anyDragging}
          id="edst-mra"
          onMouseDownCapture={onMraMouseDown}
        >
          {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
          {msg}
        </MessageResponseAreaDiv>
        {showOptions && width && (
          <FloatingWindowOptionContainer
            parentWidth={width + 6}
            parentPos={pos}
            zIndex={zIndex}
            title="RA"
            onClose={() => setShowOptions(false)}
            options={options}
          />
        )}
      </>
    )
  );
};
