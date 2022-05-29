import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { FloatingWindowHeaderColDiv14, FloatingWindowHeaderColDivFlex, FloatingWindowHeaderDiv } from "../../styles/floatingWindowStyles";
import { NoSelectDiv } from "../../styles/styles";

const FloatingWindowOptionsBodyDiv = styled(NoSelectDiv)<{ pos: { x: number; y: number } }>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: 140px;
  ${props => ({ left: `${props.pos.x}px`, top: `${props.pos.y}px` })}
`;

const FloatingWindowOptionDiv = styled(FloatingWindowHeaderDiv)<{ unselected?: boolean }>`
  height: 18px;
  background-color: #575757;
  border: 1px solid #adadad;
  text-indent: 4px;
  ${props => props.unselected && { "background-color": "#000000" }};

  &:hover {
    border: 1px solid #ffffff;
  }
`;

type FloatingWindowOptionsProps = {
  pos: { x: number; y: number };
  closeOptions?: () => void;
  header?: string;
  options?: string[];
  selectedOptions?: string[];
  handleOptionClick?: (option?: string) => void;
};

export const FloatingWindowOptions: React.FC<FloatingWindowOptionsProps> = ({ pos, ...props }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const xRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__TAURI__) {
      let rect = null;
      if (xRef.current) {
        rect = xRef.current?.getBoundingClientRect();
      } else if (headerRef.current) {
        rect = headerRef.current?.getBoundingClientRect();
      } else if (ref.current) {
        rect = ref.current?.getBoundingClientRect();
      }
      if (rect) {
        const newCursorPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        invoke("set_cursor_position", newCursorPos).then();
      }
    }
  }, []);

  return (
    <FloatingWindowOptionsBodyDiv pos={pos} ref={ref}>
      {props.header && (
        <FloatingWindowHeaderDiv ref={headerRef}>
          <FloatingWindowHeaderColDivFlex>{props.header}</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv14 onMouseDown={props.closeOptions} ref={xRef}>
            X
          </FloatingWindowHeaderColDiv14>
        </FloatingWindowHeaderDiv>
      )}
      {props.options?.map(option => (
        <FloatingWindowOptionDiv
          unselected={!(props.selectedOptions?.includes(option) ?? true)}
          key={`sigmet-option-${option}`}
          onMouseDown={() => props.handleOptionClick?.(option)}
        >
          {option}
        </FloatingWindowOptionDiv>
      ))}
    </FloatingWindowOptionsBodyDiv>
  );
};
