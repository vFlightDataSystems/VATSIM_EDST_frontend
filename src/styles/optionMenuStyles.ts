import type { CSSProperties } from "styled-components";
import styled, { css } from "styled-components";
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
  ${(props) => css`
    ${props.selected ? buttonBorderInverted2px : buttonBorder2px};
    width: ${props.size ?? 8}px;
    height: ${props.size ?? 8}px;
    margin-right: ${props.size ?? 8}px;
    ${props.selected && {
      "background-color": "#ADADAD",
    }};
  `}
  display: inline-flex;
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
type OptionsMenuProps = { pos: WindowPosition; zIndex: number };
export const OptionsMenu = styled(DraggableDiv)<OptionsMenuProps>`
  ${(props) => css`
    left: ${props.pos.left}px;
    top: ${props.pos.top}px;
    font-family: ${props.theme.fontProps.edstFontFamily};
    font-size: ${props.theme.fontProps.fontSize};
    z-index: ${10000 + props.zIndex};
  `}
  overflow: hidden;
  position: fixed;
  color: #adadad;
  background-color: #000000;
  border: none;
`;

const optionsMenuHeaderBorder = createBorder("1px", "#adadad", "#575757");
const optionsMenuBodyBorder = createBorder("1px", "#575757", "#414141");

type OptionsMenuHeaderProps = { focused?: boolean };
export const OptionsMenuHeader = styled.div<OptionsMenuHeaderProps>`
  ${(props) => css`
    font-size: ${props.theme.fontProps.fontSize};
    background-color: ${props.focused ? "#008585" : "#888888"};
  `}
  display: flex;
  justify-content: center;
  align-items: center;
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
  ${(props) =>
    css`
      justify-content: ${props.justifyContent ?? "left"};
      padding: ${props.padding ?? "0 4px"};
      ${props.margin && { margin: props.margin }};
      ${props.topBorder && {
        "border-top": "1px solid #ADADAD",
      }}

      ${props.bottomBorder && {
        "border-bottom": "1px solid #ADADAD",
      }}
    `};
  border: none;
  //min-height: 20px;
  overflow: hidden;

  * a {
    height: auto;
  }

  img {
    max-width: 24px;
    max-height: 24px;
    //transform: scale(0.2);
  }
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
  ${(props) => css`
    margin: ${props.margin ?? "0 4px"};
    max-width: ${props.maxWidth ?? "auto"};
    max-height: ${props.maxHeight ?? "auto"};
    justify-content: ${props.justifyContent ?? "flex-start"};
    ${props.hover && borderHover};
    ${props.padding && { padding: props.padding }};
    ${props.margin && { margin: props.margin }};
    ${props.selected &&
    css`
      color: #000000;
      background-color: #adadad;
    `};

    ${props.alignRight &&
    css`
      justify-content: right;
      display: flex;
      margin: 0 2px 0 auto;
    `}
  `}
  display: flex;
  flex-grow: 1;
  flex-flow: row;
  font-size: inherit;
  min-height: 1.2em;
  align-items: center;
  vertical-align: center;
  border: 1px solid transparent;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  &:disabled {
    all: inherit;
  }
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
  ${(props) => css`
    color: ${props.theme.colors.grey};
    width: ${props.width ?? "calc(100% - 7px)"};
    font-size: ${props.theme.fontProps.inputFontSize};
  `}
  outline: none;
  display: flex;
  overflow: hidden;
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;
  text-transform: uppercase;

  ${outlineHover}
`;
export const EdstTextArea = styled.textarea.attrs(() => ({ spellCheck: false }))`
  ${(props) => css`
    color: ${props.theme.colors.grey};
    font-size: ${props.theme.fontProps.inputFontSize};
  `}
  width: calc(100% - 7px);
  outline: none;
  display: flex;
  overflow: hidden;
  ${buttonBorder2px};
  background-color: #000000;
  resize: none;

  ${outlineHover}
`;
type ScrollContainerProps = Pick<CSSProperties, "maxHeight">;
export const ScrollContainer = styled.div<ScrollContainerProps>`
  max-height: ${(props) => props.maxHeight ?? "auto"};
  height: auto;
  display: block;
  overflow: scroll;
  scrollbar-width: none;

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
