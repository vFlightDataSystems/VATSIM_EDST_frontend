import type { ReactNode } from "react";
import React, { useRef } from "react";
import movableMenu from "css/movableMenu.module.scss";
import clsx from "clsx";
import { useDragging } from "hooks/useDragging";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { useCenterCursor } from "hooks/useCenterCursor";

type MovableMenuProps = {
  menuName: "ROUTE_MENU" | "HOLD_MENU";
  rootClassName: string;
  title: string;
  centerCursorDeps?: any[];
  children: ReactNode;
};

export const MovableMenu = ({ menuName, title, rootClassName, centerCursorDeps = [], children }: MovableMenuProps) => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRootSelector((state) => windowPositionSelector(state, menuName));
  const zStack = useRootSelector(zStackSelector);
  useCenterCursor(ref, [...centerCursorDeps]);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, menuName, "mousedown");

  return (
    <div
      className={clsx(rootClassName, { noPointerEvents: anyDragging })}
      ref={ref}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf(menuName) }}
      onMouseDown={() => zStack.indexOf(menuName) < zStack.length - 1 && dispatch(pushZStack(menuName))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={movableMenu.header}>
        <div className={movableMenu.headerCol} onMouseDown={startDrag}>
          <div className={movableMenu.triangle} />
          {title}
        </div>
        <div className={movableMenu.headerXCol} onMouseDown={() => dispatch(closeWindow(menuName))}>
          X
        </div>
      </div>
      <div className={movableMenu.body}>{children}</div>
    </div>
  );
};
