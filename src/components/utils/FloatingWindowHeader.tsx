import React from "react";
import clsx from "clsx";
import floatingStyles from "css/floatingWindow.module.scss";

type FloatingWindowHeaderProps = {
  title: string;
  handleOptionsMouseDown?: () => void;
  onClose: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
};

export const FloatingWindowHeader = ({ title, handleOptionsMouseDown, onClose, startDrag }: FloatingWindowHeaderProps) => {
  return (
    <div className={floatingStyles.header}>
      <div
        className={clsx(floatingStyles.col, "rect")}
        onMouseDown={(event) => {
          // TODO: a click event will not close any option menus this way, needs fixing
          event.preventDefault();
          handleOptionsMouseDown?.();
        }}
      >
        M
      </div>
      <div className={clsx(floatingStyles.col, "flex")} onMouseDown={startDrag}>
        {title}
      </div>
      <div className={clsx(floatingStyles.col, "rect")} onMouseDown={onClose}>
        <div className={clsx(floatingStyles.headerBlock, "block1")} />
      </div>
    </div>
  );
};
