import styled from "styled-components";
import {NoSelectDiv} from "./styles";


export const FloatingWindowDiv = styled(NoSelectDiv)<{ width?: number, pos?: { x: number, y: number } }>`
  z-index: 1000;
  position: absolute;
  color: #ADADAD;
  width: ${props => props.width ? props.width + "px" : "auto"};

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
  background-color: #575757;
  justify-content: space-between;
  display: flex;
  height: 20px;
`;

export const FloatingWindowHeaderColDiv = styled.div<{ width?: number, flexGrow?: number }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  ${props => props.width && ({width: props.width})}
  flex-grow: ${props => props.flexGrow ?? 0};
  background-color: #575757;
  border: 1px solid #ADADAD;

  &:hover {
    border: 1px solid #FFFFFF;
  }
`;

export const FloatingWindowHeaderBlock = styled.span`
  ${(props: { width: number, height: number }) => ({
    width: props.width + 'px',
    height: props.height + 'px'
  })}
  background-color: #ADADAD;
  border: none;
  outline: none;
  pointer-events: none;
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
  }}
  
  ${props => props.suppressed && {
    color: "#575757"
  }}

  &:hover {
    border: 1px solid #FFFFFF;
  }
`;