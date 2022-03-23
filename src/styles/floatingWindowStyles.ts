import styled from "styled-components";
import {NoSelectDiv} from "./styles";


export const FloatingWindowDiv = styled(NoSelectDiv)`
  z-index: 1000;
  position: absolute;
  color: #ADADAD;
`;

export const FloatingWindowBodyDiv = styled(FloatingWindowDiv)`
  background-color: #000000;
  padding: 0 0 4px 6px;
  border-left: 1px solid #ADADAD;
  border-bottom: 1px solid #ADADAD;
  border-right: 1px solid #ADADAD;
  display: flex;
  flex-flow: column;
`;

export const FloatingWindowHeaderDiv = styled(FloatingWindowDiv)`
  background-color: #575757;
  justify-content: space-between;
  display: flex;
  height: 20px;

  div {
    background-color: #575757;
    border: 1px solid #ADADAD;

    &:hover {
      border: 1px solid #FFFFFF;
    }
  }
`;

export const FloatingWindowHeaderColDiv = styled.div<{ width?: number, flexGrow?: number }>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  ${props => props.width && ({width: props.width})}
  flex-grow: ${props => props.flexGrow ?? 0};
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