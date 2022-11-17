import type { CSSProperties } from "styled-components";
import styled, { css } from "styled-components";
import type { WindowPosition } from "types/windowPosition";
import type { WindowDimension } from "types/windowDimension";
import { DraggableDiv, NoSelectDiv } from "styles/NoSelectDiv";
import { borderHover } from "styles/styles";

const floatingWindowTitleBackgroundColor = "#575757";

type FloatingWindowDivCSSProps = Pick<CSSProperties, "minWidth" | "width" | "maxWidth">;
type FloatingWindowDivProps = {
  pos: WindowPosition;
  zIndex: number;
  fullscreen?: boolean;
} & FloatingWindowDivCSSProps;
export const FloatingWindowDiv = styled(DraggableDiv)<FloatingWindowDivProps>`
  ${(props) =>
    css`
      ${props.minWidth && { "min-width": props.minWidth }};
      ${props.width && { width: props.width }};
      ${props.maxWidth && { "max-width": props.maxWidth }};
      font-family: ${props.theme.fontProps.eramFontFamily};
      font-size: ${props.theme.fontProps.fontSize};
      z-index: ${10000 + props.zIndex};
      position: ${!props.fullscreen ? "fixed" : "absolute"};
      ${!props.fullscreen && {
        left: `${props.pos.left}px`,
        top: `${props.pos.top}px`,
      }}
    `};
  color: #adadad;
`;

type ResizableFloatingWindowDivProps = { dimension: WindowDimension };
export const ResizableFloatingWindowDiv = styled(FloatingWindowDiv)<ResizableFloatingWindowDivProps>`
  ${(props) => css`
    font-family: ${props.theme.fontProps.edstFontFamily};
    font-size: ${props.theme.fontProps.fontSize};
    border: 3px solid ${props.theme.colors.windowBorderColor};
    outline: 1px solid ${props.theme.colors.windowOutlineColor};
    color: ${props.theme.colors.grey};
    resize: ${!props.fullscreen ? "both" : "none"};
    width: ${props.fullscreen ? "calc(100% - 10px)" : props.dimension.width};
    height: ${props.fullscreen ? "calc(100% - 10px)" : props.dimension.height};
  `};
  display: flex;
  white-space: nowrap;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  background-color: #000000;
  min-width: 60ch;
  min-height: 10em;
`;

type FloatingWindowBodyContainerProps = Pick<CSSProperties, "width"> & {
  fontSize: number;
};
export const FloatingWindowBodyContainer = styled.div<FloatingWindowBodyContainerProps>`
  font-size: ${(props) => props.theme.fontProps.floatingFontSizes[props.fontSize - 1]};
  width: ${(props) => props.width};
`;
export const FloatingWindowBodyDiv = styled.div`
  background-color: #000000;
  padding: 4px 1em 4px 1ch;
  border-left: 1px solid #adadad;
  border-bottom: 1px solid #adadad;
  border-right: 1px solid #adadad;
  display: flex;
  flex-flow: column;
`;

export const FloatingWindowHeaderDiv = styled.div`
  //height: 1em;
  background-color: ${floatingWindowTitleBackgroundColor};
  justify-content: space-between;
  display: flex;
`;

const FloatingWindowHeaderColDiv = styled.div`
  height: 1em;
  padding-bottom: 1px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: ${floatingWindowTitleBackgroundColor};
  border: 1px solid #adadad;

  ${borderHover}
`;
export const FloatingWindowHeaderColDiv16ch = styled(FloatingWindowHeaderColDiv)`
  width: 1.6ch;
`;
export const FloatingWindowHeaderColDivRect = styled(FloatingWindowHeaderColDiv)`
  height: 1em;
  width: 1em;
`;
export const FloatingWindowHeaderColDivFlex = styled(FloatingWindowHeaderColDiv)`
  padding-left: 6px;
  padding-right: 6px;
  flex-grow: 1;
`;

const FloatingWindowHeaderBlock = styled.span`
  background-color: #adadad;
  border: none;
  outline: none;
  pointer-events: none;
`;
export const FloatingWindowHeaderBlock8x2 = styled(FloatingWindowHeaderBlock)`
  width: 50%;
  height: 2px;
`;

type FloatingWindowRowProps = {
  brightness: number;
  selected?: boolean;
  suppressed?: boolean;
};
export const FloatingWindowRow = styled(NoSelectDiv)<FloatingWindowRowProps>`
  padding: 0 1.4ch;
  justify-content: center;
  border: 1px solid transparent;
  min-height: 1em;
  flex-flow: column;
  ${(props) =>
    css`
      color: rgba(${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.theme.fontProps.baseRGB}, ${props.brightness});
    `};

  ${(props) =>
    props.selected &&
    css`
      background-color: rgba(
        ${props.theme.fontProps.baseRGB},
        ${props.theme.fontProps.baseRGB},
        ${props.theme.fontProps.baseRGB},
        ${props.brightness}
      );
      color: #000000;
    `};
  ${(props) =>
    props.suppressed && {
      color: "#575757",
    }};
  ${borderHover}
`;
