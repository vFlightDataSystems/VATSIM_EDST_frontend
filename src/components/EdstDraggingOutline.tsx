import styled from "styled-components";
import React from "react";
import { DragPreviewStyle } from "../types/dragPreviewStyle";

const EdstDraggingOutlineDiv = styled.div`
  pointer-events: all;
  position: fixed;
  z-index: 30000;
  background-color: transparent;
  border: 1px solid #ffffff;
`;

type EdstDraggingOutlineProps = {
  style: DragPreviewStyle;
  onMouseUp?: () => void;
  onMouseDown?: () => void;
};

export const EdstDraggingOutline = ({ style, onMouseDown, onMouseUp }: EdstDraggingOutlineProps) => {
  return <EdstDraggingOutlineDiv style={style} onMouseUp={onMouseUp} onMouseDown={onMouseDown} />;
};
