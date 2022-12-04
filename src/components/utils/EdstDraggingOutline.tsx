import React from "react";
import type { DragPreviewStyle } from "types/dragPreviewStyle";

type EdstDraggingOutlineProps = {
  style: DragPreviewStyle;
};
export const EdstDraggingOutline = ({ style }: EdstDraggingOutlineProps) => <div className="draggingOutline" style={style} />;
