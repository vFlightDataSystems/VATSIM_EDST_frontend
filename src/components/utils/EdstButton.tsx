import React, { useCallback, useRef } from "react";
import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import type { SharedUiEvent } from "types/sharedStateTypes/sharedUiEvent";
import { useSharedUiListenerWithElement } from "hooks/useSharedUiListener";
import { buttonBorder2px, buttonBorderInverted2px, outlineHover } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";
import socket from "~socket";
import type { EdstWindow } from "enums/edstWindow";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useRootDispatch } from "~redux/hooks";

type EdstOuterButtonCSSProps = Pick<CSSProperties, "width" | "height" | "margin">;
type EdstOuterButtonProps = Partial<{ disabled: boolean } & EdstOuterButtonCSSProps>;
const EdstOuterButton = styled.div<EdstOuterButtonProps>`
  display: inline-flex;
  border: 1px solid transparent;

  padding: 0;
  width: ${(props) => props.width ?? "auto"};
  height: ${(props) => props.height ?? "auto"};
  margin: ${(props) => props.margin ?? "auto"};
  &[disabled] {
    pointer-events: none;
  }
`;

const EdstOuterHeaderButton = styled(EdstOuterButton)`
  font-size: inherit;
  margin-left: 6px;
  margin-right: 6px;
  margin-bottom: 1px;
`;

type EdstInnerButtonCSSProps = Pick<CSSProperties, "padding" | "flexGrow">;
type EdstInnerButtonProps = Partial<{ selected: boolean; disabled: boolean } & EdstInnerButtonCSSProps>;
const EdstInnerButton = styled.div<EdstInnerButtonProps>`
  font-size: inherit;
  display: flex;
  flex-grow: ${(props) => props.flexGrow ?? 1};
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.selected ? "#000000" : props.theme.colors.grey)};
  background-color: ${(props) => (props.selected ? props.theme.colors.grey : "#000000")};
  ${(props) => (props.selected ? buttonBorderInverted2px : buttonBorder2px)};
  margin: 0;
  padding: ${(props) => props.padding ?? "0 4px"};
  ${outlineHover};
  &[disabled] {
    pointer-events: none;
    color: #707070;
  }
`;

type EdstButtonCSSProps = Pick<CSSProperties, "width" | "height" | "margin" | "padding">;
type EdstButtonProps = Partial<
  {
    disabled: boolean;
    selected: boolean;
    title: string;
    content: string;
    onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  } & EdstButtonCSSProps
>;

export const EdstButton = (props: EdstButtonProps) => {
  return (
    <EdstTooltip title={props.title}>
      <EdstOuterButton
        disabled={props.disabled}
        width={props.width}
        height={props.height}
        margin={props.margin}
        onMouseDownCapture={props.onMouseDown}
      >
        <EdstInnerButton selected={props.selected} disabled={props.disabled} padding={props.padding}>
          {props.content}
        </EdstInnerButton>
      </EdstOuterButton>
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
      <EdstOuterHeaderButton
        ref={ref}
        disabled={disabled}
        onMouseDownCapture={(event) => {
          if (onMouseDown) {
            onMouseDown(event);
            event.stopPropagation();
          }
        }}
        width={width}
      >
        <EdstInnerButton disabled={disabled}>{content}</EdstInnerButton>
      </EdstOuterHeaderButton>
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
      <EdstOuterHeaderButton
        ref={ref}
        disabled={disabled}
        onMouseDownCapture={(event) => {
          dispatch(openMenuThunk(edstWindow, event.currentTarget));
          if (sharedUiEventId) {
            socket.dispatchUiEvent(sharedUiEventId);
          }
          event.stopPropagation();
        }}
      >
        <EdstInnerButton disabled={disabled}>{content}</EdstInnerButton>
      </EdstOuterHeaderButton>
    </EdstTooltip>
  );
}

const HoldDirButton = (props: Omit<EdstButtonProps, "margin">) => (
  <EdstTooltip title={props.title}>
    <EdstOuterButton disabled={props.disabled} margin="0 2px" onMouseDownCapture={props.onMouseDown} width={props.width}>
      <EdstInnerButton selected={props.selected} disabled={props.disabled} flexGrow={0}>
        {props.content}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>
);
export const HoldDirButton2ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2ch" {...props} />;
export const HoldDirButton22ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2.2ch" {...props} />;
export const HoldDirButton6ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="6ch" {...props} />;
