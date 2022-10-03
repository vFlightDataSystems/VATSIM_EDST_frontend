import React, { useRef } from "react";
import styled from "styled-components";
import { EdstTooltip } from "./EdstTooltip";
import { SharedUiEvent } from "../../typeDefinitions/types/sharedStateTypes/sharedUiEvent";
import { useSharedUiListenerWithElement } from "../../hooks/useSharedUiListener";
import socket from "../../sharedState/socket";
import { borderHover } from "../../styles/styles";

type EdstOuterButtonProps = Partial<{ width: string; height: string; margin: string; disabled: boolean }>;
const EdstOuterButton = styled.div.attrs((props: EdstOuterButtonProps) => ({
  width: props.width ?? "auto",
  height: props.height ?? "auto",
  margin: props.margin ?? "auto"
}))<EdstOuterButtonProps>`
  display: inline-flex;
  border: 1px solid #000000;

  width: ${props => props.width};
  height: ${props => props.height};
  margin: ${props => props.margin};
  ${borderHover};
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

type EdstInnerButtonProps = Partial<{ selected: boolean; flexGrow: number; width: string; height: string; padding: string; disabled: boolean }>;
const EdstInnerButton = styled.div.attrs((props: EdstInnerButtonProps) => ({
  width: props.width ?? "auto",
  height: props.height ?? "auto",
  padding: props.padding ?? "0 4px",
  flexGrow: props.flexGrow ?? 1
}))<EdstInnerButtonProps>`
  font-size: inherit;
  display: flex;
  flex-grow: ${props => props.flexGrow};
  justify-content: center;
  align-items: center;
  color: ${props => (props.selected ? "#000000" : props.theme.colors.grey)};
  background-color: ${props => (props.selected ? props.theme.colors.grey : "#000000")};
  border-bottom: 2px solid ${props => (props.selected ? "#888888" : "#575757")};
  border-right: 2px solid ${props => (props.selected ? "#888888" : "#575757")};
  border-top: 2px solid ${props => (props.selected ? "#575757" : "#888888")};
  border-left: 2px solid ${props => (props.selected ? "#575757" : "#888888")};
  padding: ${props => props.padding};
  width: ${props => props.width};
  height: ${props => props.height};
  &[disabled] {
    pointer-events: none;
    color: #707070;
  }
`;

type SharedUiEventProps<T> = {
  sharedUiEventId: SharedUiEvent;
  sharedUiEventHandler: (element: HTMLElement, args: T) => void;
  sharedUiEventHandlerArgs: T;
};

type EdstButtonProps = Partial<{
  disabled: boolean;
  selected: boolean;
  width: string;
  height: string;
  margin: string;
  padding: string;
  id: string;
  title: string;
  content: string;
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
}>;

export const EdstButton = (props: EdstButtonProps) => {
  return (
    <EdstTooltip title={props.title}>
      <EdstOuterButton
        disabled={props.disabled}
        width={props.width}
        height={props.height}
        margin={props.margin}
        id={props.id}
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
export const EdstButton12x12 = (props: EdstButtonFixedSizeProps) => <EdstButton width="12px" height="12px" {...props} />;
export const EdstButton20x20 = (props: EdstButtonFixedSizeProps) => <EdstButton width="20px" height="20px" {...props} />;
export const EdstRouteButton12x12 = (props: Omit<EdstButtonFixedSizeProps, "padding" | "margin">) => (
  <EdstButton12x12 padding="0 4px" margin="auto 5px 0 auto" {...props} />
);
export const EdstTemplateButton85 = (props: EdstButtonFixedSizeProps) => <EdstButton width="85px" margin="0 4px" {...props} />;

type EdstWindowHeaderButtonProps<T> = EdstButtonProps & Partial<SharedUiEventProps<T>>;
export function EdstWindowHeaderButton<T>({
  onMouseDown,
  id,
  sharedUiEventId,
  sharedUiEventHandler,
  sharedUiEventHandlerArgs,
  ...props
}: EdstWindowHeaderButtonProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useSharedUiListenerWithElement(sharedUiEventId, ref.current, sharedUiEventHandler, sharedUiEventHandlerArgs);
  return (
    <EdstTooltip title={props.title}>
      <EdstOuterHeaderButton
        ref={ref}
        disabled={props.disabled}
        id={id}
        onMouseDownCapture={event => {
          if (onMouseDown) {
            onMouseDown(event);
            if (sharedUiEventId) {
              socket.dispatchUiEvent(sharedUiEventId);
            }
            event.stopPropagation();
          }
        }}
      >
        <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width} height={props.height}>
          {props.content}
        </EdstInnerButton>
      </EdstOuterHeaderButton>
    </EdstTooltip>
  );
}

const HoldDirButton = (props: Omit<EdstButtonProps, "margin">) => (
  <EdstTooltip title={props.title}>
    <EdstOuterButton disabled={props.disabled} margin="0 2px" id={props.id} onMouseDownCapture={props.onMouseDown}>
      <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width} flexGrow={0}>
        {props.content}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>
);
export const HoldDirButton2ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2ch" {...props} />;
export const HoldDirButton22ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="2.2ch" {...props} />;
export const HoldDirButton6ch = (props: EdstButtonFixedSizeProps) => <HoldDirButton width="6ch" {...props} />;
