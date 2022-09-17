import styled, { css } from "styled-components";
import { DraggableDiv, edstFontFamily, eramFontFamily, floatingFontSizes, NoSelectDiv } from "./styles";
import { WindowPosition } from "../typeDefinitions/types/windowPosition";
import { edstFontGrey, edstWindowBorderColor, edstWindowOutlineColor } from "./colors";

const floatingWindowTitleBackgroundColor = "#575757";

type FloatingWindowDivProps = {
  pos?: WindowPosition | null;
  zIndex: number;
  fullscreen?: boolean;
  minWidth?: string;
  width?: string;
  maxWidth?: string;
};
export const FloatingWindowDiv = styled(DraggableDiv)<FloatingWindowDivProps>`
  ${props =>
    css`
      ${props.minWidth && { "min-width": props.minWidth }};
      ${props.width && { width: props.width }};
      ${props.maxWidth && { width: props.maxWidth }};
    `};
  font-family: ${eramFontFamily};
  z-index: ${props => 10000 + props.zIndex};
  position: ${props => (!props.fullscreen ? "fixed" : "absolute")};
  color: #adadad;

  ${props =>
    !props.fullscreen &&
    props.pos && {
      left: `${props.pos.x}px`,
      top: `${props.pos.y}px`
    }}
`;

export const ResizableFloatingWindowDiv = styled(FloatingWindowDiv)`
  font-family: ${edstFontFamily};
  display: flex;
  white-space: nowrap;
  flex-flow: column;
  overflow: hidden;
  margin: 2px;
  flex-grow: 1;
  border: 3px solid ${edstWindowBorderColor};
  outline: 1px solid ${edstWindowOutlineColor};
  color: ${edstFontGrey};
  background-color: #000000;
  min-width: 600px;
  min-height: 200px;
  resize: ${props => (!props.fullscreen ? "both" : "none")};
  width: ${props => (props.fullscreen ? "calc(100% - 10px)" : "auto")};
  height: ${props => (props.fullscreen ? "calc(100% - 10px)" : "auto")};
`;

export const FloatingWindowBodyDiv = styled.div`
  background-color: #000000;
  padding: 0 0 4px 6px;
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

  &:hover {
    border: 1px solid #ffffff;
  }
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

export const FloatingWindowRow = styled(NoSelectDiv)<{ selected?: boolean; suppressed?: boolean }>`
  font-size: ${props => floatingFontSizes[props.theme.fontSize - 1]};
  justify-content: center;
  padding: 0 30px 0 10px;
  border: 1px solid transparent;
  margin: 4px 21px 0 0;
  min-height: 1em;
  color: rgba(173, 173, 173, ${props => (props.theme.brightness ?? 80) / 100});

  ${props =>
    props.selected &&
    css`
      background-color: rgba(173, 173, 173, ${(props.theme.brightness ?? 80) / 100});
      color: #000000;
    `};
  ${props =>
    props.suppressed && {
      color: "#575757"
    }};
  &:hover {
    border: 1px solid #ffffff;
  }
`;
