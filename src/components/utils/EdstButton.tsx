import type { CSSProperties } from "react";
import React, { useCallback, useRef } from "react";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import { useSharedUiListenerWithElement } from "hooks/useSharedUiListener";
import { EdstTooltip } from "components/utils/EdstTooltip";
import socket from "~socket";
import type { EdstWindow } from "types/edstWindow";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useRootDispatch } from "~redux/hooks";
import buttonStyles from "css/button.module.scss";
import clsx from "clsx";

type EdstButtonCSSProps = Pick<CSSProperties, "width" | "height" | "margin" | "padding">;
type EdstButtonProps = {
  disabled?: boolean;
  selected?: boolean;
  title?: string;
  content?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
} & EdstButtonCSSProps;
export const EdstButton = ({ disabled, selected, margin = "0", title, onMouseDown, content, ...props }: EdstButtonProps) => {
  return (
    <EdstTooltip title={title}>
      <div style={{ margin }} className={clsx(buttonStyles.outerButton, { isDisabled: disabled })} onMouseDownCapture={onMouseDown}>
        <div style={props} className={clsx(buttonStyles.innerButton, { isDisabled: disabled, selected })}>
          {content}
        </div>
      </div>
    </EdstTooltip>
  );
};

type EdstButtonFixedSizeProps = Omit<EdstButtonProps, "width" | "height">;
type ExitButtonProps = {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  title?: string;
};
export const ExitButton = (props: ExitButtonProps) => <EdstButton content="Exit" {...props} />;

export const EdstTemplateButton10ch = (props: Omit<EdstButtonFixedSizeProps, "margin">) => <EdstButton width="10ch" margin="0 4px" {...props} />;

type EdstWindowHeaderButtonProps = {
  title?: string;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  content: string;
  width?: CSSProperties["width"];
};
export function EdstWindowHeaderButton({ onMouseDown, title, disabled, content, width }: EdstWindowHeaderButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <EdstTooltip title={title}>
      <div
        ref={ref}
        className={clsx(buttonStyles.outerButton, "header", { isDisabled: disabled })}
        onMouseDownCapture={(event) => {
          if (onMouseDown) {
            onMouseDown(event);
            event.stopPropagation();
          }
        }}
      >
        <div className={clsx(buttonStyles.innerButton)} style={{ width }}>
          {content}
        </div>
      </div>
    </EdstTooltip>
  );
}

type EdstWindowHeaderButtonWithSharedEventProps = Omit<EdstWindowHeaderButtonProps, "onMouseDown"> & {
  sharedUiEventId: SharedUiEvent;
  edstWindow: EdstWindow;
};
export function EdstWindowHeaderButtonWithSharedEvent({
  sharedUiEventId,
  edstWindow,
  title,
  disabled,
  content,
}: EdstWindowHeaderButtonWithSharedEventProps) {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const sharedUiEventHandler = useCallback(
    (element: HTMLElement) => {
      dispatch(openMenuThunk(edstWindow, element));
    },
    [dispatch, edstWindow]
  );
  useSharedUiListenerWithElement(sharedUiEventId, ref.current, sharedUiEventHandler);

  return (
    <EdstTooltip title={title}>
      <div
        ref={ref}
        className={clsx(buttonStyles.outerButton, "header", { isDisabled: disabled })}
        onMouseDownCapture={(event) => {
          dispatch(openMenuThunk(edstWindow, event.currentTarget));
          if (sharedUiEventId) {
            socket.dispatchUiEvent(sharedUiEventId);
          }
          event.stopPropagation();
        }}
      >
        <div className={clsx(buttonStyles.innerButton)}>{content}</div>
      </div>
    </EdstTooltip>
  );
}

const HoldDirButton = ({ width, disabled, selected, ...props }: Omit<EdstButtonProps, "margin">) => (
  <EdstTooltip title={props.title}>
    <div className={clsx(buttonStyles.outerButton, "holdDirButton", { isDisabled: disabled })} onMouseDownCapture={props.onMouseDown}>
      <div style={{ width }} className={clsx(buttonStyles.innerButton, { isDisabled: disabled, selected })}>
        {props.content}
      </div>
    </div>
  </EdstTooltip>
);
export const HoldDirButton2ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2ch" {...props} />;
export const HoldDirButton22ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2.2ch" {...props} />;
export const HoldDirButton5ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="5ch" {...props} />;
