import styled from "styled-components";
import { DraggableDiv } from "./styles";
import { edstFontGrey } from "./colors";
import { WindowPosition } from "../types/windowPosition";

export const OptionSelectedIndicator = styled.div<{ selected?: boolean; circle?: boolean; diamond?: boolean }>`
  display: inline-flex;
  border-bottom: 2px solid #575757;
  border-right: 2px solid #575757;
  border-top: 2px solid #888888;
  border-left: 2px solid #888888;
  width: 8px;
  height: 8px;
  margin-right: 8px;

  ${props =>
    props.selected && {
      "background-color": "#ADADAD",
      "border-bottom": "2px solid #888888",
      "border-right": "2px solid #888888",
      "border-top": "2px solid #575757",
      "border-left": "2px solid #575757"
    }}

  ${props =>
    props.circle && {
      "border-radius": "50%",
      border: "2px solid #888888"
    }}

  ${props =>
    props.diamond && {
      width: "6px",
      height: "6px",
      transform: "rotate(45deg)"
    }}
`;
export const OptionsMenu = styled(DraggableDiv)<{ pos?: WindowPosition; zIndex: number }>`
  z-index: ${props => 10000 + props.zIndex};
  overflow: hidden;
  position: fixed;
  color: #adadad;
  background-color: #000000;
  border: none;
  ${props =>
    props.pos && {
      left: `${props.pos.x}px`,
      top: `${props.pos.y}px`
    }}
`;
export const OptionsMenuHeader = styled.div<{ focused?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => (props.focused ? "#008585" : "#888888")};
  color: #000000;
  height: 17px;
  border-top: 1px solid #adadad;
  border-left: 1px solid #adadad;
  border-bottom: 1px solid #575757;
  border-right: 1px solid #575757;
`;
export const OptionsBody = styled.div`
  background-color: #000000;
  padding: 2px 0;
  border-top: 1px solid #575757;
  border-left: 1px solid #575757;
  border-bottom: 1px solid #414141;
  border-right: 1px solid #414141;

  *[disabled] {
    pointer-events: none;
    color: #575757;
  }
`;
export const OptionsBodyRow = styled.div<{ padding?: string; margin?: string; justifyContent?: string; bottomBorder?: boolean; topBorder?: boolean }>`
  display: flex;
  flex-grow: 1;
  justify-content: ${props => props.justifyContent ?? "left"};
  padding: ${props => props.padding ?? "0 4px"};
  border: none;
  //min-height: 20px;
  overflow: hidden;

  ${props => props.margin && { margin: props.margin }};
  * a {
    height: auto;
  }

  img {
    max-width: 24px;
    max-height: 24px;
    //transform: scale(0.2);
  }

  ${props =>
    props.topBorder && {
      "border-top": "1px solid #ADADAD"
    }}

  ${props =>
    props.bottomBorder && {
      "border-bottom": "1px solid #ADADAD"
    }}
`;
export const OptionsBottomRow = styled(OptionsBodyRow)`
  overflow: unset;
  text-overflow: unset;
  white-space: unset;
  margin-top: 10px;
  margin-bottom: 4px;
  flex-grow: 1;
`;
export const UnderlineRow = styled(OptionsBodyRow)`
  pointer-events: none;
  justify-content: center;
  height: 30px;
  margin-bottom: 4px;

  &:before {
    content: "";
    position: absolute;
    width: 18%;
    height: 30px;
    left: 41%;
    border-bottom: 1px solid #adadad;
  }
`;
export const FidRow = styled(OptionsBodyRow)`
  pointer-events: none;
  justify-content: center;
  align-items: center;
  height: 40px;
`;
export const OptionsBodyCol = styled.div<{
  selected?: boolean;
  alignRight?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  margin?: string;
  padding?: string;
  hover?: boolean;
  justifyContent?: string;
}>`
  display: flex;
  flex-grow: 1;
  flex-flow: row;
  font-size: 16px;
  min-height: 20px;
  justify-content: ${props => props.justifyContent ?? "flex-start"};
  align-items: center;
  vertical-align: center;
  border: 1px solid transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: ${props => props.margin ?? "0 4px"};
  max-width: ${props => (props.maxWidth ? `${props.maxWidth}px` : "auto")};
  max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : "auto")};
  ${props => props.hover && { "&:hover": { border: "1px solid #F0F0F0" } }}
  ${props => props.padding && { padding: props.padding }};
  ${props => props.margin && { margin: props.margin }};

  ${props => props.selected && { color: "#000000" }};
  ${props => props.selected && { "background-color": "#ADADAD" }};
  &:disabled {
    all: inherit;
  }

  ${props =>
    props.alignRight && {
      "justify-content": "right",
      margin: "0 2px 0 0",
      display: "flex",
      "margin-left": "auto"
    }}
`;
// export const UplinkCol = styled(OptionsBodyCol)`font-size: 30px`;
export const OptionsFlexCol = styled(OptionsBodyCol)`
  display: flex;
  justify-content: left;
  height: 22px;
  padding: 0 5px;

  &:hover {
    border: 1px solid #adadad;
  }
`;
export const EdstInput = styled.input<{ width?: number }>`
  width: ${props => (props.width ? `${props.width}px` : "calc(100% - 7px)")};
  font-size: 16px;
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${edstFontGrey};
  border-top: 2px solid #575757;
  border-left: 2px solid #575757;
  border-bottom: 2px solid #888888;
  border-right: 2px solid #888888;
  background-color: #000000;
  resize: none;
  text-transform: uppercase;

  &:hover {
    outline: 1px solid #ffffff;
  }
`;
export const EdstTextArea = styled.textarea`
  width: calc(100% - 7px);
  font-size: 16px;
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${edstFontGrey};
  border-top: 2px solid #575757;
  border-left: 2px solid #575757;
  border-bottom: 2px solid #888888;
  border-right: 2px solid #888888;
  background-color: #000000;
  resize: none;

  &:hover {
    outline: 1px solid #ffffff;
  }
`;
export const ScrollContainer = styled.div<{ maxHeight?: number }>`
  height: auto;
  display: block;
  overflow: scroll;
  scrollbar-width: none;

  max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : "auto")};

  &::-webkit-scrollbar {
    display: none;
  }
`;
