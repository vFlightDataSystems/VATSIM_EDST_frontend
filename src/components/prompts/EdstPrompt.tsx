import type { CSSProperties } from "react";
import React, { useRef } from "react";
import { closeWindow, pushZStack, windowPositionSelector, zStackSelector } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { useFocused } from "hooks/useFocused";
import { useDragging } from "hooks/useDragging";
import { useCenterCursor } from "hooks/useCenterCursor";
import type { EdstWindow } from "types/edstWindow";
import { EdstButton } from "components/utils/EdstButton";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import optionStyles from "css/optionMenu.module.scss";
import clsx from "clsx";
import speedStyles from "css/hdgSpdMenu.module.scss";

type EdstPromptProps = {
  title: string;
  width?: CSSProperties["width"];
  windowId: EdstWindow;
  submitText: string;
  onSubmit: () => void;
  cancelText: string;
  onCancel?: () => void;
  stopDragOn?: "mousedown" | "mouseup";
  children: React.ReactNode;
};

export const EdstPrompt = ({ stopDragOn = "mouseup", ...props }: EdstPromptProps) => {
  const pos = useRootSelector((state) => windowPositionSelector(state, props.windowId));
  const ref = useRef<HTMLDivElement>(null);
  const zStack = useRootSelector(zStackSelector);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, props.windowId, stopDragOn);
  const dispatch = useRootDispatch();
  useCenterCursor(ref);

  return (
    <div
      className={clsx(optionStyles.root, { isDragging: anyDragging })}
      style={{ ...pos, zIndex: 10000 + zStack.indexOf(props.windowId), "--width": props.width }}
      ref={ref}
      onMouseDown={() => zStack.indexOf(props.windowId) < zStack.length - 1 && dispatch(pushZStack(props.windowId))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        {props.title}
      </div>
      <div className={optionStyles.body}>
        {props.children}
        <div className={speedStyles.row}>
          <div className={optionStyles.col}>
            <EdstButton content={props.submitText} onMouseDown={props.onSubmit} />
          </div>
          <div className={clsx(optionStyles.col, "right")}>
            <EdstButton
              content={props.cancelText}
              onMouseDown={() => {
                dispatch(closeWindow(props.windowId));
                props.onCancel?.();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
