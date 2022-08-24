import React, { PropsWithChildren } from "react";
import styled from "styled-components";
import { EdstTooltip } from "./EdstTooltip";
import { edstFontGrey } from "../../styles/colors";

type EdstOuterButtonProps = { width?: string; height?: string; margin?: string; disabled?: boolean };
const EdstOuterButton = styled.div.attrs((props: EdstOuterButtonProps) => ({
  width: props.width ?? "auto",
  height: props.height ?? "auto",
  margin: props.margin ?? "initial"
}))<EdstOuterButtonProps>`
  display: inline-flex;
  border: 1px solid #000000;

  width: ${props => props.width};
  height: ${props => props.height};
  margin: ${props => props.margin};
  &:hover {
    border: 1px solid #ffffff;
  }
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

type EdstInnerButtonProps = { selected?: boolean; flexGrow?: number; width?: string; height?: string; padding?: string; disabled?: boolean };
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
  color: ${props => (props.selected ? "#000000" : edstFontGrey)};
  background-color: ${props => (props.selected ? "#ADADAD" : "#000000")};
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

type EdstButtonProps = {
  disabled?: boolean;
  selected?: boolean;
  width?: string;
  height?: string;
  margin?: string;
  padding?: string;
  content?: string;
  id?: string;
  title?: string;
  onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export const EdstButton = ({ onMouseDown, id, ...props }: PropsWithChildren<EdstButtonProps>) => {
  return (
    <EdstTooltip title={props.title}>
      <EdstOuterButton
        disabled={props.disabled}
        width={props.width}
        height={props.height}
        margin={props.margin}
        id={id}
        onMouseDownCapture={onMouseDown}
      >
        <EdstInnerButton selected={props.selected} disabled={props.disabled} padding={props.padding}>
          {props.content ?? props.children}
        </EdstInnerButton>
      </EdstOuterButton>
    </EdstTooltip>
  );
};
export const EdstButton12x12 = (props: EdstButtonProps) => <EdstButton width="12px" height="12px" {...props} />;
export const EdstButton20x20 = (props: EdstButtonProps) => <EdstButton width="20px" height="20px" {...props} />;
export const EdstRouteButton12x12 = (props: EdstButtonProps) => <EdstButton12x12 padding="0 4px" margin="0 5px 0 0" {...props} />;
export const EdstTemplateButton85 = (props: EdstButtonProps) => <EdstButton width="85px" margin="0 4px" {...props} />;

export const EdstWindowHeaderButton = ({ onMouseDown, id, ...props }: PropsWithChildren<EdstButtonProps>) => {
  return (
    <EdstTooltip title={props.title}>
      <EdstOuterHeaderButton
        disabled={props.disabled}
        id={id}
        onMouseDownCapture={event => {
          if (onMouseDown) {
            onMouseDown(event);
            event.stopPropagation();
          }
        }}
      >
        <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width} height={props.height}>
          {props.content ?? props.children}
        </EdstInnerButton>
      </EdstOuterHeaderButton>
    </EdstTooltip>
  );
};

const HoldDirButton = ({ onMouseDown, id, ...props }: PropsWithChildren<EdstButtonProps>) => (
  <EdstTooltip title={props.title}>
    <EdstOuterButton disabled={props.disabled} margin="0 2px" id={id} onMouseDownCapture={onMouseDown}>
      <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width} flexGrow={0}>
        {props.content ?? props.children}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>
);
export const HoldDirButton2ch = (props: PropsWithChildren<EdstButtonProps>) => <HoldDirButton width="2ch" {...props} />;
export const HoldDirButton22ch = (props: PropsWithChildren<EdstButtonProps>) => <HoldDirButton width="2.2ch" {...props} />;
export const HoldDirButton6ch = (props: PropsWithChildren<EdstButtonProps>) => <HoldDirButton width="6ch" {...props} />;
