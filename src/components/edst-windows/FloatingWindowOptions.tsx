import React from "react";
import {
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import styled from "styled-components";
import {NoSelectDiv} from "../../styles/styles";

const FloatingWindowOptionsBodyDiv = styled(NoSelectDiv)<{ pos: { x: number, y: number } }>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: 140px;
  ${props => ({left: props.pos.x + 'px', top: props.pos.y + 'px'})}
`

const FloatingWindowOptionDiv = styled.div<{ unselected?: boolean }>`
  //position: absolute;
  display: flex;
  height: 18px;
  background-color: #575757;
  border: 1px solid #ADADAD;
  text-indent: 4px;

  ${props => props.unselected && ({"background-color": "#000000"})};

  &:hover {
    border: 1px solid #FFFFFF;
  }
`;

type FloatingWindowOptionsProps = {
  pos: { x: number, y: number },
  closeOptions?: () => void,
  header?: string,
  options?: string[],
  selectedOptions?: string[],
  handleOptionClick?: (option?: string) => void
}

export const FloatingWindowOptions: React.FC<FloatingWindowOptionsProps> = ({pos, ...props}) => {
  return <FloatingWindowOptionsBodyDiv pos={pos}>

    {props.header &&
        <FloatingWindowHeaderDiv>
            <FloatingWindowHeaderColDiv
                flexGrow={1}
            >
              {props.header}
            </FloatingWindowHeaderColDiv>
            <FloatingWindowHeaderColDiv width={20} onMouseDown={props.closeOptions}>
                X
            </FloatingWindowHeaderColDiv>
        </FloatingWindowHeaderDiv>}
    {props.options?.map((option) =>
      <FloatingWindowOptionDiv unselected={!(props.selectedOptions?.includes(option) ?? true)}
                               key={`sigmet-option-${option}`}
                               onMouseDown={() => props.handleOptionClick?.(option)}
      >
        {option}
      </FloatingWindowOptionDiv>)}
  </FloatingWindowOptionsBodyDiv>;
};