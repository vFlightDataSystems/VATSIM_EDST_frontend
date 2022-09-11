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
  startDrag: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export const FloatingWindowHeader = ({ title, handleOptionsMouseDown, onClose, startDrag }: FloatingWindowHeaderProps) => {
  return (
    <FloatingWindowHeaderDiv>
      <FloatingWindowHeaderColDivRect onMouseDown={handleOptionsMouseDown}>M</FloatingWindowHeaderColDivRect>
      <FloatingWindowHeaderColDivFlex onMouseDown={startDrag}>{title}</FloatingWindowHeaderColDivFlex>
      <FloatingWindowHeaderColDivRect onMouseDown={onClose}>
        <FloatingWindowHeaderBlock8x2 />
      </FloatingWindowHeaderColDivRect>
    </FloatingWindowHeaderDiv>
  );
};
