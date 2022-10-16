import styled, { css, CSSProperties } from "styled-components";
import { DraggableDiv, NoSelectDiv } from "./NoSelectDiv";
import { WindowPosition } from "../typeDefinitions/types/windowPosition";
import { WindowDimension } from "../typeDefinitions/types/windowDimension";
import { borderHover } from "./styles";
import { Nullable } from "../typeDefinitions/utility-types";

const floatingWindowTitleBackgroundColor = "#575757";

type FloatingWindowDivCSSProps = Partial<Pick<CSSProperties, "minWidth" | "width" | "maxWidth">>;
type FloatingWindowDivProps = {
  pos: Nullable<WindowPosition>;
  zIndex: number;
  fullscreen?: boolean;
} & FloatingWindowDivCSSProps;
export const FloatingWindowDiv = styled(DraggableDiv)<FloatingWindowDivProps>`
  ${props =>
    css`
      ${props.minWidth && { "min-width": props.minWidth }};
      ${props.width && { width: props.width }};
      ${props.maxWidth && { "max-width": props.maxWidth }};
    `};
  font-family: ${props => props.theme.fontProperties.eramFontFamily};
  font-size: ${props => props.theme.fontProperties.fontSize};
  z-index: ${props => 10000 + props.zIndex};
  position: ${props => (!props.fullscreen ? "fixed" : "absolute")};
  color: #adadad;

  ${props =>
    !props.fullscreen &&
    props.pos && {
      left: `${props.pos.left}px`,
      top: `${props.pos.top}px`
    }}
`;

type ResizableFloatingWindowDivProps = { dimension: WindowDimension };
export const ResizableFloatingWindowDiv = styled(FloatingWindowDiv)<ResizableFloatingWindowDivProps>`
  font-family: ${props => props.theme.fontProperties.edstFontFamily};
  font-size: ${props => props.theme.fontProperties.fontSize};
  display: flex;
  white-space: nowrap;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${props => props.theme.colors.windowBorderColor};
  outline: 1px solid ${props => props.theme.colors.windowOutlineColor};
  color: ${props => props.theme.colors.grey};
  background-color: #000000;
  min-width: 600px;
  min-height: 200px;
  resize: ${props => (!props.fullscreen ? "both" : "none")};
  width: ${props => (props.fullscreen ? "calc(100% - 10px)" : props.dimension.width)};
  height: ${props => (props.fullscreen ? "calc(100% - 10px)" : props.dimension.height)};
`;

type FloatingWindowBodyContainerProps = Pick<CSSProperties, "width"> & { fontSize: number };
export const FloatingWindowBodyContainer = styled.div<FloatingWindowBodyContainerProps>`
  font-size: ${props => props.theme.fontProperties.floatingFontSizes[props.fontSize - 1]};
  width: ${props => props.width};
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

type FloatingWindowRowProps = { brightness: number; selected?: boolean; suppressed?: boolean };
export const FloatingWindowRow = styled(NoSelectDiv)<FloatingWindowRowProps>`
  padding: 0 1.4ch;
  justify-content: center;
  border: 1px solid transparent;
  min-height: 1em;
  flex-flow: column;
  color: rgba(173, 173, 173, ${props => props.brightness / 100});

  ${props =>
    props.selected &&
    css`
      background-color: rgba(173, 173, 173, ${props.brightness / 100});
      color: #000000;
    `};
  ${props =>
    props.suppressed && {
      color: "#575757"
    }};
  ${borderHover}
`;
