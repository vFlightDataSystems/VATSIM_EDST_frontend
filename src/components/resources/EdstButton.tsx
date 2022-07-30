import React from "react";
import styled from "styled-components";
import { EdstTooltip } from "./EdstTooltip";
import { edstFontGrey } from "../../styles/colors";

const EdstOuterButton = styled.div<{ width?: number; height?: number; margin?: string; disabled?: boolean }>`
  display: inline-flex;
  //height: 20px;
  border: 1px solid #000000;
  font-size: 16px;

  width: ${props => (props.width ? `${props.width}px` : "auto")};
  height: ${props => (props.height ? `${props.height}px` : "auto")};

  ${props =>
    props.margin && {
      margin: props.margin
    }};

  &:hover {
    border: 1px solid #ffffff;
  }

  &[disabled] {
    pointer-events: none;
  }
`;

const EdstOuterHeaderButton = styled(EdstOuterButton)`
  font-size: 17px;
  margin-left: 6px;
  margin-right: 6px;
  margin-bottom: 1px;
`;

type EdstInnerButtonProps = { selected?: boolean; flexGrow?: number; width?: number; height?: number; padding?: string; disabled?: boolean };

const EdstInnerButton = styled.div.attrs((props: EdstInnerButtonProps) => ({
  width: props.width ? `${props.width}px` : "auto",
  height: props.height ? `${props.height}px` : "auto",
  padding: props.padding ?? "0 4px",
  flexGrow: props.flexGrow ?? 1
}))<EdstInnerButtonProps>`
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
  width?: number;
  height?: number;
  margin?: string;
  padding?: string;
  content?: string;
  id?: string;
  title?: string;
  onMouseDown?: (event: React.MouseEvent) => void;
};

export const EdstButton: React.FC<EdstButtonProps> = ({ onMouseDown, id, ...props }) => {
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
export const EdstButton12x12: React.FC<EdstButtonProps> = props => <EdstButton width={12} height={12} {...props} />;
export const EdstButton20x20: React.FC<EdstButtonProps> = props => <EdstButton width={20} height={20} {...props} />;
export const EdstRouteButton12x12: React.FC<EdstButtonProps> = props => <EdstButton12x12 padding="0 4px" margin="0 5px 0 0" {...props} />;
export const EdstTemplateButton85: React.FC<EdstButtonProps> = props => <EdstButton width={85} margin="0 4px" {...props} />;

export const EdstWindowHeaderButton: React.FC<EdstButtonProps> = ({ onMouseDown, id, ...props }) => {
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
        <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width}>
          {props.content ?? props.children}
        </EdstInnerButton>
      </EdstOuterHeaderButton>
    </EdstTooltip>
  );
};

const HoldDirButton: React.FC<EdstButtonProps> = ({ onMouseDown, id, ...props }) => (
  <EdstTooltip title={props.title}>
    <EdstOuterButton disabled={props.disabled} margin="0 2px" id={id} onMouseDownCapture={onMouseDown}>
      <EdstInnerButton selected={props.selected} disabled={props.disabled} width={props.width} flexGrow={0}>
        {props.content ?? props.children}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>
);
export const HoldDirButton16: React.FC<EdstButtonProps> = props => <HoldDirButton width={16} {...props} />;
export const HoldDirButton20: React.FC<EdstButtonProps> = props => <HoldDirButton width={20} {...props} />;
export const HoldDirButton50: React.FC<EdstButtonProps> = props => <HoldDirButton width={50} {...props} />;
