import React, { useMemo, useRef, useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { mraMsgSelector, pushZStack, setMraMessage, windowPositionSelector, zStackSelector } from "../../redux/slices/appSlice";
import { FloatingWindowDiv } from "../../styles/floatingWindowStyles";
import { EdstDraggingOutline } from "../utils/EdstDraggingOutline";
import { useDragging } from "../../hooks/useDragging";
import { EdstWindow } from "../../typeDefinitions/enums/edstWindow";
import { eramFontFamily, floatingFontSizes } from "../../styles/styles";
import { useWindowOptions } from "../../hooks/useWindowOptions";
import { FloatingWindowOptionContainer } from "../utils/FloatingWindowOptionContainer";
import { windowOptionsSelector } from "../../redux/slices/windowOptionsSlice";

type MessageResponseAreaDivProps = { width: number };
const MessageResponseAreaDiv = styled(FloatingWindowDiv).attrs(({ width }: MessageResponseAreaDivProps) => ({
  width: `${width}ch`
}))<MessageResponseAreaDivProps>`
  font-size: ${props => floatingFontSizes[props.theme.fontSize - 1]};
  line-height: 1em;
  padding: 0 2px;
  min-height: 4em;
  width: ${props => props.width};
  background-color: #000000;
  border: 1px solid #adadad;
  overflow-wrap: anywhere;
  white-space: pre-line;
  font-family: ${eramFontFamily};
  color: rgba(173, 173, 173, ${props => (props.theme.brightness ?? 80) / 100});
`;

export const MessageResponseArea = () => {
  const pos = useRootSelector(windowPositionSelector(EdstWindow.MESSAGE_RESPONSE_AREA));
  const msg = useRootSelector(mraMsgSelector);
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_RESPONSE_AREA, "mousedown");

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.MESSAGE_RESPONSE_AREA));
  const extraOptions = useMemo(
    () => ({
      clear: { value: "CLEAR", backgroundColor: "#000000", onMouseDown: () => dispatch(setMraMessage("")) }
    }),
    [dispatch]
  );
  const options = useWindowOptions(EdstWindow.MESSAGE_RESPONSE_AREA, extraOptions);

  const onMraMouseDown: React.MouseEventHandler<HTMLDivElement> = event => {
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
  const rect = ref.current?.getBoundingClientRect();

  return (
    pos && (
      <>
        <ThemeProvider theme={windowOptions}>
          <MessageResponseAreaDiv
            width={windowOptions.width}
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
        </ThemeProvider>
        {showOptions && rect && (
          <FloatingWindowOptionContainer
            pos={{
              x: pos.x + rect.width,
              y: pos.y
            }}
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
