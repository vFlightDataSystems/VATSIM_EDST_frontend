import type { CSSProperties } from "styled-components";
import styled from "styled-components";
import type { WindowPosition } from "types/windowPosition";
import { DraggableDiv } from "styles/NoSelectDiv";
import { borderHover, buttonBorder2px, buttonBorderInverted2px, createBorder, outlineHover } from "styles/styles";
import { EdstTooltip } from "components/utils/EdstTooltip";

type OptionIndicatorProps = {
  selected?: boolean;
  size?: number;
  disabled?: boolean;
};
export const OptionIndicator = styled.div<OptionIndicatorProps>`
  display: inline-flex;
  ${(props) => (props.selected ? buttonBorderInverted2px : buttonBorder2px)};
  width: ${(props) => props.size ?? 8}px;
  height: ${(props) => props.size ?? 8}px;
  margin-right: ${(props) => props.size ?? 8}px;

  ${(props) =>
    props.selected && {
      "background-color": "#ADADAD",
    }};
`;
export const OptionIndicatorDiamond = styled(OptionIndicator)`
  width: 6px;
  height: 6px;
  transform: rotate(45deg);
`;
export const OptionIndicatorCircle = styled(OptionIndicator)`
  border-radius: 50%;
  border: 2px solid #888888;
`;
type OptionsMenuProps = { pos?: WindowPosition; zIndex: number };
export const OptionsMenu = styled(DraggableDiv)<OptionsMenuProps>`
  font-family: ${(props) => props.theme.fontProps.edstFontFamily};
  font-size: ${(props) => props.theme.fontProps.fontSize};
  z-index: ${(props) => 10000 + props.zIndex};
  overflow: hidden;
  position: fixed;
  color: #adadad;
  background-color: #000000;
  border: none;
  ${(props) =>
    props.pos && {
      left: `${props.pos.left}px`,
      top: `${props.pos.top}px`,
    }}
`;

const optionsMenuHeaderBorder = createBorder("1px", "#adadad", "#575757");
const optionsMenuBodyBorder = createBorder("1px", "#575757", "#414141");

type OptionsMenuHeaderProps = { focused?: boolean };
export const OptionsMenuHeader = styled.div<OptionsMenuHeaderProps>`
  font-size: ${(props) => props.theme.fontProps.fontSize};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.focused ? "#008585" : "#888888")};
  color: #000000;
  height: 17px;
  ${optionsMenuHeaderBorder};
`;
export const OptionsBody = styled.div`
  font-size: ${(props) => props.theme.fontProps.fontSize};
  background-color: #000000;
  padding: 2px 0;
  ${optionsMenuBodyBorder};

  *[disabled] {
    pointer-events: none;
    color: #575757;
  }
`;
type OptionsBodyRowCSSProps = Pick<CSSProperties, "padding" | "margin" | "justifyContent">;
type OptionsBodyRowProps = { bottomBorder?: boolean; topBorder?: boolean } & OptionsBodyRowCSSProps;
export const OptionsBodyRow = styled.div<OptionsBodyRowProps>`
  display: flex;
  flex-grow: 1;
  justify-content: ${(props) => props.justifyContent ?? "left"};
  padding: ${(props) => props.padding ?? "0 4px"};
  border: none;
  //min-height: 20px;
  overflow: hidden;

  ${(props) => props.margin && { margin: props.margin }};
  * a {
    height: auto;
  }

  img {
    max-width: 24px;
    max-height: 24px;
    //transform: scale(0.2);
  }

  ${(props) =>
    props.topBorder && {
      "border-top": "1px solid #ADADAD",
    }}

  ${(props) =>
    props.bottomBorder && {
      "border-bottom": "1px solid #ADADAD",
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
type OptionsBodyColCSSProps = Pick<CSSProperties, "maxWidth" | "maxHeight" | "margin" | "padding" | "justifyContent">;
type OptionsBodyColProps = {
  selected?: boolean;
  alignRight?: boolean;
  hover?: boolean;
} & OptionsBodyColCSSProps;
export const OptionsBodyCol = styled(EdstTooltip)<OptionsBodyColProps>`
  display: flex;
  flex-grow: 1;
  flex-flow: row;
  font-size: inherit;
  min-height: 1.2em;
  justify-content: ${(props) => props.justifyContent ?? "flex-start"};
  align-items: center;
  vertical-align: center;
  border: 1px solid transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: ${(props) => props.margin ?? "0 4px"};
  max-width: ${(props) => props.maxWidth ?? "auto"};
  max-height: ${(props) => props.maxHeight ?? "auto"};
  ${(props) => props.hover && borderHover};
  ${(props) => props.padding && { padding: props.padding }};
  ${(props) => props.margin && { margin: props.margin }};

  ${(props) => props.selected && { color: "#000000" }};
  ${(props) => props.selected && { "background-color": "#ADADAD" }};
  &:disabled {
    all: inherit;
  }

  ${(props) =>
    props.alignRight && {
      "justify-content": "right",
      margin: "0 2px 0 0",
      display: "flex",
      "margin-left": "auto",
    }}
`;
// export const UplinkCol = styled(OptionsBodyCol)`font-size: 30px`;
export const OptionsFlexCol = styled(OptionsBodyCol)`
  display: flex;
  justify-content: left;
  height: 1em;
  padding: 0 5px;

  ${borderHover}
`;
type EdstInputProps = Pick<CSSProperties, "width">;
export const EdstInput = styled.input.attrs(() => ({ spellCheck: false }))<EdstInputProps>`
  width: ${(props) => props.width ?? "calc(100% - 7px)"};
  font-size: ${(props) => props.theme.fontProps.inputFontSize};
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${(props) => props.theme.colors.grey};
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;
  text-transform: uppercase;

  ${outlineHover}
`;
export const EdstTextArea = styled.textarea.attrs(() => ({ spellCheck: false }))`
  width: calc(100% - 7px);
  font-size: ${(props) => props.theme.fontProps.inputFontSize};
  outline: none;
  display: flex;
  overflow: hidden;
  color: ${(props) => props.theme.colors.grey};
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;

  ${outlineHover}
`;
type ScrollContainerProps = Pick<CSSProperties, "maxHeight">;
export const ScrollContainer = styled.div<ScrollContainerProps>`
  height: auto;
  display: block;
  overflow: scroll;
  scrollbar-width: none;

  max-height: ${(props) => props.maxHeight ?? "auto"};

  &::-webkit-scrollbar {
    //display: none;
    padding-right: 4px;
  }

  &::-webkit-scrollbar-track,
  &::-webkit-scrollbar-corner {
    display: none;
  }

  &::-webkit-scrollbar-thumb {
    //border-radius: 2px;
    display: unset;
    width: 4px;
    background-color: #adadad;
  }
`;
