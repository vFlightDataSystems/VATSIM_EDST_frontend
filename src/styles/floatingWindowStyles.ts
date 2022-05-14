import styled from "styled-components";
import {NoSelectDiv} from "./styles";

const floatingWindowTitleBackgroundColor = '#575757';

export const FloatingWindowDiv = styled(NoSelectDiv)<{ pos?: { x: number, y: number }, zIndex: number }>`
  z-index: ${props => 10000 - props.zIndex};
  position: fixed;
  color: #ADADAD;

  ${props => props.pos && {
    left: props.pos.x + "px", top: props.pos.y + "px"
  }}
`;

export const FloatingWindowBodyDiv = styled.div`
  background-color: #000000;
  padding: 0 0 4px 6px;
  border-left: 1px solid #ADADAD;
  border-bottom: 1px solid #ADADAD;
  border-right: 1px solid #ADADAD;
  display: flex;
  flex-flow: column;
`;

export const FloatingWindowHeaderDiv = styled.div`
  background-color: ${floatingWindowTitleBackgroundColor};
  justify-content: space-between;
  display: flex;
  height: 20px;
`;

const FloatingWindowHeaderColDiv = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: ${floatingWindowTitleBackgroundColor};
  border: 1px solid #ADADAD;

  &:hover {
    border: 1px solid #FFFFFF;
  }
`;
export const FloatingWindowHeaderColDiv14 = styled(FloatingWindowHeaderColDiv)`width: 14px`;
export const FloatingWindowHeaderColDiv20 = styled(FloatingWindowHeaderColDiv)`width: 20px`;
export const FloatingWindowHeaderColDivFlex = styled(FloatingWindowHeaderColDiv)`flex-grow: 1`;

const FloatingWindowHeaderBlock = styled.span`
  background-color: #ADADAD;
  border: none;
  outline: none;
  pointer-events: none;
`;
export const FloatingWindowHeaderBlock8x2 = styled(FloatingWindowHeaderBlock)`
  width: 8px;
  height: 2px;
`;


export const FloatingWindowRow = styled(NoSelectDiv)<{ selected?: boolean, suppressed?: boolean }>`
  justify-content: center;
  font-size: 16px;
  padding: 0 30px 0 10px;
  border: 1px solid transparent;
  color: #919191;
  margin: 4px 21px 0 0;

  ${props => props.selected && {
    "background-color": "#919191",
    color: "#000000"
  }};
  ${props => props.suppressed && {
    color: "#575757"
  }};
  &:hover {
    border: 1px solid #FFFFFF;
  }
`;
