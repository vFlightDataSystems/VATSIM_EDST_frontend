import styled from "styled-components";
import { DraggableDiv } from "./NoSelectDiv";
import { WindowPosition } from "../typeDefinitions/types/windowPosition";
import { borderHover, buttonBorder2px, buttonBorderInverted2px, createBorder, outlineHover } from "./styles";

export const OptionSelectedIndicator = styled.div<{ selected?: boolean; circle?: boolean; diamond?: boolean }>`
  display: inline-flex;
  ${props => (props.selected ? buttonBorderInverted2px : buttonBorder2px)};
  width: 8px;
  height: 8px;
  margin-right: 8px;

  ${props =>
    props.selected && {
      "background-color": "#ADADAD"
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
  font-family: ${props => props.theme.fontProperties.edstFontFamily};
  font-size: ${props => props.theme.fontProperties.fontSize};
  z-index: ${props => 10000 + props.zIndex};
  overflow: hidden;
  position: fixed;
  color: #adadad;
  background-color: #000000;
  border: none;
  ${props =>
    props.pos && {
      left: `${props.pos.left}px`,
      top: `${props.pos.top}px`
    }}
`;

const optionsMenuHeaderBorder = createBorder("1px", "#adadad", "#575757");
const optionsMenuBodyBorder = createBorder("1px", "#575757", "#414141");

export const OptionsMenuHeader = styled.div<{ focused?: boolean }>`
  font-size: ${props => props.theme.fontProperties.fontSize};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => (props.focused ? "#008585" : "#888888")};
  color: #000000;
  height: 17px;
  ${optionsMenuHeaderBorder};
`;
export const OptionsBody = styled.div`
  font-size: ${props => props.theme.fontProperties.fontSize};
  background-color: #000000;
  padding: 2px 0;
  ${optionsMenuBodyBorder};

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
  height: 1.2em;
  margin-bottom: 4px;

  &:before {
    content: "";
    position: absolute;
    width: 18%;
    height: 1.2em;
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
  maxWidth?: string;
  maxHeight?: string;
  margin?: string;
  padding?: string;
  hover?: boolean;
  justifyContent?: string;
}>`
  display: flex;
  flex-grow: 1;
  flex-flow: row;
  font-size: inherit;
  min-height: 1.2em;
  justify-content: ${props => props.justifyContent ?? "flex-start"};
  align-items: center;
  vertical-align: center;
  border: 1px solid transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: ${props => props.margin ?? "0 4px"};
  max-width: ${props => props.maxWidth ?? "auto"};
  max-height: ${props => props.maxHeight ?? "auto"};
  ${props => props.hover && borderHover};
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

  ${borderHover}
`;
export const EdstInput = styled.input<{ width?: string }>`
  width: ${props => props.width ?? "calc(100% - 7px)"};
  font-size: ${props => props.theme.fontProperties.inputFontSize};
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${props => props.theme.colors.grey};
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;
  text-transform: uppercase;

  ${outlineHover}
`;
export const EdstTextArea = styled.textarea`
  width: calc(100% - 7px);
  font-size: ${props => props.theme.fontProperties.inputFontSize};
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${props => props.theme.colors.grey};
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;

  ${outlineHover}
`;
export const ScrollContainer = styled.div<{ maxHeight?: string }>`
  height: auto;
  display: block;
  overflow: scroll;
  scrollbar-width: none;

  max-height: ${props => props.maxHeight ?? "auto"};

  &::-webkit-scrollbar {
    display: none;
  }
`;
