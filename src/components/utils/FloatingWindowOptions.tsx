import React, { MouseEventHandler, useEffect, useRef } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { FloatingWindowHeaderColDiv16ch, FloatingWindowHeaderColDivFlex, FloatingWindowHeaderDiv } from "../../styles/floatingWindowStyles";
import { NoSelectDiv } from "../../styles/styles";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";

type FloatingWindowOptionsBodyProps = { pos: WindowPosition };
const FloatingWindowOptionsBodyDiv = styled(NoSelectDiv).attrs((props: FloatingWindowOptionsBodyProps) => ({
  left: `${props.pos.x}px`,
  top: `${props.pos.y}px`
}))<FloatingWindowOptionsBodyProps>`
  position: absolute;
  display: flex;
  flex-flow: column;
  height: auto;
  width: 150px;
  left: ${props => props.left};
  top: ${props => props.top};
`;

type FloatingWindowOptionDivProps = { backgroundColor?: string };
const FloatingWindowOptionDiv = styled(FloatingWindowHeaderDiv).attrs((props: FloatingWindowOptionDivProps) => ({
  backgroundColor: props.backgroundColor ?? "#000000"
}))<FloatingWindowOptionDivProps>`
  height: 1em;
  background-color: ${props => props.backgroundColor};
  border: 1px solid #adadad;
  text-indent: 4px;
  align-items: center;
  &:hover {
    border: 1px solid #ffffff;
  }
`;

type FloatingWindowOption = {
  value: string;
  onMouseDown?: MouseEventHandler<HTMLElement>;
};

export type FloatingWindowOptions = Record<string, FloatingWindowOption>;

type FloatingWindowOptionsProps<T extends FloatingWindowOptions> = {
  pos: WindowPosition;
  onClose?: () => void;
  header?: string;
  options?: T;
  defaultBackgroundColor?: string;
  backgroundColors?: Partial<Record<keyof T, string>>;
};

export function FloatingWindowOptions<T extends FloatingWindowOptions>({ pos, ...props }: FloatingWindowOptionsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
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
          <FloatingWindowHeaderColDiv16ch onMouseDown={props.onClose} ref={xRef}>
            X
          </FloatingWindowHeaderColDiv16ch>
        </FloatingWindowHeaderDiv>
      )}
      {Object.entries(props.options ?? {}).map(([key, option]) => (
        <FloatingWindowOptionDiv
          backgroundColor={props?.backgroundColors?.[key] ?? props.defaultBackgroundColor}
          key={key}
          onMouseDown={option.onMouseDown}
        >
          {option.value}
        </FloatingWindowOptionDiv>
      ))}
    </FloatingWindowOptionsBodyDiv>
  );
}
