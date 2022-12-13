import React from "react";
import type { DragPreviewStyle } from "types/dragPreviewStyle";
import { Portal } from "react-portal";

type EdstDraggingOutlineProps = {
  style: DragPreviewStyle;
};
export const EdstDraggingOutline = ({ style }: EdstDraggingOutlineProps) => (
  <Portal>
    <div className="draggingOutline" style={style} />
  </Portal>
);
