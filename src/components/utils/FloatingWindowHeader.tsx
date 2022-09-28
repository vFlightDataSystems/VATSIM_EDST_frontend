import React from "react";
import {
  FloatingWindowHeaderBlock8x2,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderColDivRect,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";

type FloatingWindowHeaderProps = {
  title: string;
  handleOptionsMouseDown?: () => void;
  onClose: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
};

export const FloatingWindowHeader = ({ title, handleOptionsMouseDown, onClose, startDrag }: FloatingWindowHeaderProps) => {
  return (
    <FloatingWindowHeaderDiv>
      <FloatingWindowHeaderColDivRect
        onMouseDownCapture={event => {
          // TODO: a click event will not close any option menus this way, needs fixing
          event.stopPropagation();
          handleOptionsMouseDown?.();
        }}
      >
        M
      </FloatingWindowHeaderColDivRect>
      <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>{title}</FloatingWindowHeaderColDivFlex>
      <FloatingWindowHeaderColDivRect onMouseDown={onClose}>
        <FloatingWindowHeaderBlock8x2 />
      </FloatingWindowHeaderColDivRect>
    </FloatingWindowHeaderDiv>
  );
};
