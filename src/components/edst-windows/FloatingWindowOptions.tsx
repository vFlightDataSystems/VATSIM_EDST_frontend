import React, {useEffect, useRef} from "react";
import {
  FloatingWindowHeaderColDiv,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import styled from "styled-components";
import {NoSelectDiv} from "../../styles/styles";
import {invoke} from "@tauri-apps/api/tauri";

const FloatingWindowOptionsBodyDiv = styled(NoSelectDiv)<{ pos: { x: number, y: number } }>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: 140px;
  ${props => ({left: props.pos.x + 'px', top: props.pos.y + 'px'})}
`

const FloatingWindowOptionDiv = styled(FloatingWindowHeaderDiv)<{ unselected?: boolean }>`
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
  const ref = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const xRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (window.__TAURI__) {
      let rect = null;
      if (xRef.current) {
        rect = xRef.current?.getBoundingClientRect();
      }
      else if (headerRef.current) {
        rect = headerRef.current?.getBoundingClientRect();
      }
      else if (ref.current) {
        rect = ref.current?.getBoundingClientRect();
      }
      if (rect) {
        const newCursorPos = {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
        invoke('set_cursor_position', newCursorPos);
      }
    }
  }, []);

  return <FloatingWindowOptionsBodyDiv pos={pos} ref={ref}>
    {props.header &&
        <FloatingWindowHeaderDiv ref={headerRef}>
            <FloatingWindowHeaderColDiv
                flexGrow={1}
            >
              {props.header}
            </FloatingWindowHeaderColDiv>
            <FloatingWindowHeaderColDiv width={14} onMouseDown={props.closeOptions} ref={xRef}>
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