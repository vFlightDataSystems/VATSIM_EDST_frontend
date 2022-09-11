import styled from "styled-components";
import React from "react";
import { DragPreviewStyle } from "../../typeDefinitions/types/dragPreviewStyle";

const EdstDraggingOutlineDiv = styled.div<{ absolute?: boolean }>`
  position: ${props => (props.absolute ? "absolute" : "fixed")};
  pointer-events: all;
  z-index: 30000;
  background-color: transparent;
  border: 1px solid #ffffff;
`;

type EdstDraggingOutlineProps = {
  absolute?: boolean;
  style: DragPreviewStyle;
  onMouseUp?: () => void;
  onMouseDown?: () => void;
};

export const EdstDraggingOutline = (props: EdstDraggingOutlineProps) => {
  return <EdstDraggingOutlineDiv {...props} />;
};
