import React, { useRef } from "react";
import styled, { CSSProperties } from "styled-components";
import { EdstTooltip } from "./EdstTooltip";
import { SharedUiEvent } from "../../typeDefinitions/types/sharedStateTypes/sharedUiEvent";
import { useSharedUiListenerWithElement } from "../../hooks/useSharedUiListener";
import socket from "../../sharedState/socket";
import { borderHover, buttonBorder2px, buttonBorderInverted2px } from "../../styles/styles";
import { AllOrNone } from "../../typeDefinitions/utility-types";

type EdstOuterButtonCSSProps = Pick<CSSProperties, "width" | "height" | "margin">;
type EdstOuterButtonProps = Partial<{ disabled: boolean } & EdstOuterButtonCSSProps>;
const EdstOuterButton = styled.div<EdstOuterButtonProps>`
  display: inline-flex;
  border: 1px solid #000000;

  width: ${props => props.width ?? "auto"};
  height: ${props => props.height ?? "auto"};
  margin: ${props => props.margin ?? "auto"};
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

type EdstInnerButtonCSSProps = Pick<CSSProperties, "width" | "height" | "padding" | "flexGrow">;
type EdstInnerButtonProps = Partial<{ selected: boolean; disabled: boolean } & EdstInnerButtonCSSProps>;
const EdstInnerButton = styled.div<EdstInnerButtonProps>`
  font-size: inherit;
  display: flex;
  flex-grow: ${props => props.flexGrow ?? 1};
  justify-content: center;
  align-items: center;
  color: ${props => (props.selected ? "#000000" : props.theme.colors.grey)};
  background-color: ${props => (props.selected ? props.theme.colors.grey : "#000000")};
  ${props => (props.selected ? buttonBorderInverted2px : buttonBorder2px)};
  padding: ${props => props.padding ?? "0 4px"};
  width: ${props => props.width ?? "auto"};
  height: ${props => props.height ?? "auto"};
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

type EdstButtonCSSProps = Pick<CSSProperties, "width" | "height" | "margin" | "padding">;
type EdstButtonProps = Partial<
  {
    disabled: boolean;
    selected: boolean;
    id: string;
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
export const EdstRouteButton12x12 = (props: Omit<EdstButtonFixedSizeProps, "padding" | "margin">) => (
  <EdstButton12x12 padding="0 4px" margin="auto 5px auto auto" {...props} />
);
type ExitButtonProps = { onMouseDown: React.MouseEventHandler<HTMLDivElement>; title?: string };
export const ExitButton = (props: ExitButtonProps) => <EdstButton content="Exit" {...props} />;

export const EdstTemplateButton10ch = (props: EdstButtonFixedSizeProps) => <EdstButton width="10ch" margin="0 4px" {...props} />;

type EdstWindowHeaderButtonProps<T> = EdstButtonProps & AllOrNone<SharedUiEventProps<T>>;
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
