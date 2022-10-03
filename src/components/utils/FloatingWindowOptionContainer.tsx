import React, { MouseEventHandler, useEffect, useRef } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventListener } from "usehooks-ts";
import {
  FloatingWindowDiv,
  FloatingWindowHeaderColDiv16ch,
  FloatingWindowHeaderColDivFlex,
  FloatingWindowHeaderDiv
} from "../../styles/floatingWindowStyles";
import { WindowPosition } from "../../typeDefinitions/types/windowPosition";
import { borderHover } from "../../styles/styles";

const FloatingWindowOptionsBodyDiv = styled(FloatingWindowDiv)<{ offsetPos: boolean }>`
  // position: ${props => (props.offsetPos ? "relative" : "fixed")};
  font-size: ${props => props.theme.fontProperties.fontSize};
  display: inline-flex;
  flex-flow: column;
  height: auto;
`;

type FloatingWindowOptionDivProps = { backgroundColor: string };
const FloatingWindowOptionDiv = styled(FloatingWindowHeaderDiv)<FloatingWindowOptionDivProps>`
  height: 1em;
  background-color: ${props => props.backgroundColor};
  padding-right: 16px;
  border: 1px solid #adadad;
  text-indent: 6px;
  align-items: center;
  ${borderHover}
`;

type FloatingWindowOption = {
  value: string;
  backgroundColor?: string;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
};

export type FloatingWindowOptions = Record<string, FloatingWindowOption>;

type FloatingWindowOptionsProps<T extends FloatingWindowOptions> = {
  pos: WindowPosition;
  zIndex: number;
  onClose?: () => void;
  title?: string;
  options?: T;
};

export function FloatingWindowOptionContainer<T extends FloatingWindowOptions>({ pos, ...props }: FloatingWindowOptionsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (window.__TAURI__) {
      let rect = null;
      if (xRef.current) {
        rect = xRef.current.getBoundingClientRect();
      } else if (headerRef.current) {
        rect = headerRef.current.getBoundingClientRect();
      } else if (ref.current) {
        rect = ref.current.getBoundingClientRect();
      }
      if (rect) {
        const newCursorPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        invoke("set_cursor_position", newCursorPos).then();
      }
    }
  }, [pos]);

  useEventListener("mousedown", () => props.onClose?.());

  return (
    <FloatingWindowOptionsBodyDiv
      onMouseDown={event => event.stopPropagation()}
      pos={pos}
      ref={ref}
      zIndex={props.zIndex + 1}
      offsetPos={!props.title}
    >
      {props.title && (
        <FloatingWindowHeaderDiv ref={headerRef}>
          <FloatingWindowHeaderColDivFlex>{props.title}</FloatingWindowHeaderColDivFlex>
          <FloatingWindowHeaderColDiv16ch onMouseDownCapture={props.onClose} ref={xRef}>
            X
          </FloatingWindowHeaderColDiv16ch>
        </FloatingWindowHeaderDiv>
      )}
      {props.options &&
        Object.entries(props.options).map(([key, option]) => (
          <FloatingWindowOptionDiv
            backgroundColor={option.backgroundColor ?? "#000000"}
            key={key}
            onMouseDownCapture={event => {
              if (option.onMouseDown) {
                option.onMouseDown(event);
              }
            }}
          >
            {option.value}
          </FloatingWindowOptionDiv>
        ))}
    </FloatingWindowOptionsBodyDiv>
  );
}
