import React, { useRef } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow, zStackSelector, pushZStack, windowSelector } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { EdstButton, ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import sortStyles from "css/sortMenu.module.scss";
import clsx from "clsx";

type SortMenuProps = {
  menu: "ACL_SORT_MENU" | "DEP_SORT_MENU";
  onSubmit: () => void;
  children: React.ReactNode;
};

export const SortMenu = ({ menu, onSubmit, children }: SortMenuProps) => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, menu));
  const zStack = useRootSelector(zStackSelector);

  const ref = useRef<HTMLDivElement>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, menu, "mouseup");

  return (
    <div
      className={clsx(sortStyles.root, { isDragging: anyDragging })}
      style={{ ...windowProps.position, zIndex: 10000 + zStack.indexOf(menu) }}
      ref={ref}
      onMouseDown={() => zStack.indexOf(menu) < zStack.length - 1 && dispatch(pushZStack(menu))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(sortStyles.header, { focused })} onMouseDown={startDrag}>
        Sort Menu
      </div>
      <div className={sortStyles.body}>
        {children}
        <div className={optionStyles.bottomRow}>
          <div className={optionStyles.col}>
            <EdstButton
              content="OK"
              onMouseDown={() => {
                onSubmit();
                dispatch(closeWindow(menu));
              }}
            />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <ExitButton onMouseDown={() => dispatch(closeWindow(menu))} />
          </div>
        </div>
      </div>
    </div>
  );
};
