import React, { useRef, useState } from "react";
import styled, { css } from "styled-components";
import { useResizeDetector } from "react-resize-detector";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { mcaFeedbackSelector, pushZStack, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { FloatingWindowDiv } from "styles/floatingWindowStyles";
import { useDragging } from "hooks/useDragging";
import { EdstWindow } from "enums/edstWindow";
import { useWindowOptions } from "hooks/useWindowOptions";
import { windowOptionsSelector } from "~redux/slices/windowOptionsSlice";
import { FloatingWindowOptionContainer } from "components/utils/FloatingWindowOptionContainer";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { useMcaInput } from "hooks/useMcaInput";

function chunkString(str: string, length: number) {
  return str.match(new RegExp(`.{1,${length}}`, "g")) ?? [""];
}

type MessageComposeAreaDivProps = { brightness: number; fontSizeIndex: number };
const MessageComposeAreaDiv = styled(FloatingWindowDiv)<MessageComposeAreaDivProps>`
  ${(props) =>
    css`
      color: rgba(${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.brightness});
    `};
  background-color: #000000;
  border: 1px solid #adadad;
  line-height: 1em;
  font-family: ${(props) => props.theme.fontProps.eramFontFamily};
  font-size: ${(props) => props.theme.fontProps.floatingFontSizes[props.fontSizeIndex - 1]};
`;

type McaInputAreaProps = { width: number; paLines: number };
const MessageComposeInputAreaDiv = styled.div<McaInputAreaProps>`
  height: calc(${(props) => `${props.paLines}em`} + 6px);
  width: auto;
  overflow: hidden;
  > pre {
    width: ${(props) => `${props.width}ch`};
    margin: 2px;
  }
  text-transform: uppercase;
  border-bottom: 1px solid #adadad;
`;

type McaCursorProps = { insertMode: boolean };
const MessageComposeCursor = styled.span<McaCursorProps>`
  display: inline-block;
  height: 1em;
  width: 1ch;
  border-bottom: 1px solid #adadad;
  // if not in insert mode, left and right borders are white
  ${(props) =>
    !props.insertMode &&
    css`
      box-shadow: -1px 0 #adadad, 1px 0 #adadad;
    `}
`;

const FeedbackContainerDiv = styled.div`
  min-height: calc(3em + 12px);
`;
const ResponseFeedbackRowDiv = styled.div`
  height: 1em;
  line-height: 1;
  padding: 2px;
  display: flex;
  flex-grow: 1;
`;

const AcceptCheckmarkSpan = styled.span`
  color: #00ad00;
  height: 1em;

  ::before {
    content: "\u2713";
  }
`;

const RejectCrossSpan = styled.span`
  color: #ad0000;
  height: 1em;

  ::before {
    content: "\u2715";
  }
`;

export const MessageComposeArea = () => {
  const mcaFeedbackString = useRootSelector(mcaFeedbackSelector);
  const pos = useRootSelector((state) => windowPositionSelector(state, EdstWindow.MESSAGE_COMPOSE_AREA));
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.MESSAGE_COMPOSE_AREA, "mousedown");
  const { width } = useResizeDetector({ targetRef: ref });

  const [showOptions, setShowOptions] = useState(false);
  const windowOptions = useRootSelector(windowOptionsSelector(EdstWindow.MESSAGE_COMPOSE_AREA));
  const options = useWindowOptions(EdstWindow.MESSAGE_COMPOSE_AREA);

  const { mcaInputValue, cursorPosition, insertMode } = useMcaInput();

  const feedbackRows = mcaFeedbackString.toUpperCase().split("\n");

  const onMcaMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    switch (event.button) {
      case 1:
        setShowOptions(true);
        event.stopPropagation();
        break;
      default:
        startDrag(event);
        if (zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA) < zStack.length - 1) {
          dispatch(pushZStack(EdstWindow.MESSAGE_COMPOSE_AREA));
        }
        break;
    }
  };

  const zIndex = zStack.indexOf(EdstWindow.MESSAGE_COMPOSE_AREA);

  return (
    pos && (
      <>
        <MessageComposeAreaDiv
          ref={ref}
          id="edst-mca"
          fontSizeIndex={windowOptions.fontSizeIndex}
          brightness={windowOptions.brightness}
          anyDragging={anyDragging}
          pos={pos}
          zIndex={zIndex}
          onMouseDownCapture={onMcaMouseDown}
        >
          {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
          <MessageComposeInputAreaDiv {...windowOptions}>
            {chunkString(`${mcaInputValue} `, windowOptions.width).map((chunk, i) => {
              const cursorIndex = cursorPosition - windowOptions.width * i;
              if (cursorIndex >= 0 && cursorIndex < windowOptions.width) {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <pre key={i}>
                    {chunk.slice(0, cursorIndex)}
                    <MessageComposeCursor insertMode={insertMode}>{chunk[cursorIndex]}</MessageComposeCursor>
                    {chunk.slice(cursorIndex + 1)}
                  </pre>
                );
              }
              // eslint-disable-next-line react/no-array-index-key
              return <pre key={i}>{chunk}</pre>;
            })}
          </MessageComposeInputAreaDiv>
          <FeedbackContainerDiv>
            <ResponseFeedbackRowDiv>
              {mcaFeedbackString.startsWith("ACCEPT") && <AcceptCheckmarkSpan />}
              {mcaFeedbackString.startsWith("REJECT") && <RejectCrossSpan />}
              {feedbackRows[0]}
            </ResponseFeedbackRowDiv>
            {feedbackRows.slice(1, 30).flatMap((s, i) =>
              chunkString(s, windowOptions.width).map((chunk, j) => (
                // eslint-disable-next-line react/no-array-index-key
                <ResponseFeedbackRowDiv key={`${i}-${j}`}>{chunk}</ResponseFeedbackRowDiv>
              ))
            )}
          </FeedbackContainerDiv>
        </MessageComposeAreaDiv>
        {showOptions && width && (
          <FloatingWindowOptionContainer
            parentWidth={width + 2}
            parentPos={pos}
            zIndex={zIndex}
            title="MCA"
            onClose={() => setShowOptions(false)}
            options={options}
          />
        )}
      </>
    )
  );
};
