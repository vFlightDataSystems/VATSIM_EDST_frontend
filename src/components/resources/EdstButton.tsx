import {EdstTooltip} from './EdstTooltip';
import React from "react";
import {edstFontGrey} from "../../styles/colors";
import styled from "styled-components";

const EdstOuterButton = styled.div<{ width?: number, height?: number, margin?: string }>`
  display: inline-flex;
  //height: 20px;
  border: 1px solid #000000;
  font-size: 16px;

  width: ${props => props.width ? props.width + "px" : "auto"};
  height: ${props => props.height ? props.height + "px" : "auto"};

  ${props => props.margin && {
    margin: props.margin
  }}
  &:hover {
    border: 1px solid #FFFFFF;
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

const EdstInnerButton = styled.div<{ selected?: boolean, flexGrow?: number, width?: number, height?: number, padding?: string }>`
  display: flex;
  flex-grow: ${props => props.flexGrow ?? 1};
  justify-content: center;
  align-items: center;
  color: ${props => props.selected ? "#000000" : edstFontGrey};
  background-color: ${props => props.selected ? "#ADADAD" : "#000000"};
  border-bottom: 2px solid ${props => props.selected ? "#888888" : "#575757"};
  border-right: 2px solid ${props => props.selected ? "#888888" : "#575757"};
  border-top: 2px solid ${props => props.selected ? "#575757" : "#888888"};
  border-left: 2px solid ${props => props.selected ? "#575757" : "#888888"};
  padding: ${props => props.padding ?? "0 4px"};

  width: ${props => props.width ? props.width + "px" : "auto"};
  height: ${props => props.height ? props.height + "px" : "auto"};

  &[disabled] {
    pointer-events: none;
    color: #707070;
  }

  width: ${props => props.width ? props.width + "px" : "auto"};
  height: ${props => props.height ? props.height + "px" : "auto"};
`;

type EdstButtonProps = {
  disabled?: boolean,
  selected?: boolean,
  width?: number,
  height?: number,
  margin?: string,
  padding?: string
  content?: string,
  id?: string,
  title?: string,
  onMouseDown?: (event: React.MouseEvent) => void,
}

export const EdstButton: React.FC<EdstButtonProps> = ({onMouseDown, id, ...props}) => {
  return (<EdstTooltip title={props.title}>
    <EdstOuterButton // @ts-ignore
      disabled={props.disabled}
      width={props.width}
      height={props.height}
      margin={props.margin}
      id={id}
      onMouseDownCapture={onMouseDown}
    >
      <EdstInnerButton selected={props.selected} // @ts-ignore
                       disabled={props.disabled}
                       padding={props.padding}
      >
        {props.content ?? props.children}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>);
};

export const EdstWindowHeaderButton: React.FC<EdstButtonProps> = ({onMouseDown, id, ...props}) => {
  return (<EdstTooltip title={props.title}>
    <EdstOuterHeaderButton // @ts-ignore
      disabled={props.disabled}
      id={id}
      onMouseDownCapture={onMouseDown}>
      <EdstInnerButton selected={props.selected} // @ts-ignore
                       disabled={props.disabled}
      >
        {props.content ?? props.children}
      </EdstInnerButton>
    </EdstOuterHeaderButton>
  </EdstTooltip>);
};

export const HoldDirButton: React.FC<EdstButtonProps> = ({onMouseDown, id, ...props}) => {
  return (<EdstTooltip title={props.title}>
    <EdstOuterButton // @ts-ignore
      disabled={props.disabled}
      margin="0 2px"
      id={id}
      onMouseDownCapture={onMouseDown}>
      <EdstInnerButton selected={props.selected} // @ts-ignore
                       disabled={props.disabled}
                       width={props.width}
                       flexGrow={0}
      >
        {props.content ?? props.children}
      </EdstInnerButton>
    </EdstOuterButton>
  </EdstTooltip>);
};