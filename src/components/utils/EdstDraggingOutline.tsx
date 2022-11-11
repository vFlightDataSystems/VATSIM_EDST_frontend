import styled from "styled-components";
import type { DragPreviewStyle } from "types/dragPreviewStyle";

type EdstDraggingOutlineProps = {
  absolute?: boolean;
  style: DragPreviewStyle;
};
export const EdstDraggingOutline = styled.div<EdstDraggingOutlineProps>`
  position: ${(props) => (props.absolute ? "absolute" : "fixed")};
  pointer-events: all;
  z-index: 30000;
  background-color: transparent;
  border: 1px solid #ffffff;
`;
