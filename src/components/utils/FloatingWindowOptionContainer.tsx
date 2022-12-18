import type { CSSProperties, MouseEventHandler } from "react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useOnClickOutside, useWindowSize } from "usehooks-ts";
import type { WindowPosition } from "types/windowPosition";
import floatingStyles from "css/floatingWindow.module.scss";
import clsx from "clsx";
import { Portal } from "react-portal";

type FloatingWindowOptionRowProps = { option: FloatingWindowOption };
const FloatingWindowOptionRow = ({ option }: FloatingWindowOptionRowProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prevOptionValueRef = useRef<string>(option.value);
  const prevPosRef = useRef<WindowPosition>();

  useEffect(() => {
    if (window.__TAURI__ && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (!prevPosRef.current) {
        prevPosRef.current = { left: rect.left, top: rect.top };
      } else if (prevPosRef.current.left !== rect.left || prevPosRef.current.top !== rect.top) {
        if (option.value !== prevOptionValueRef.current) {
          const newCursorPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          void invoke("set_cursor_position", newCursorPos);
          prevOptionValueRef.current = option.value;
        }
      }
      prevPosRef.current = { left: rect.left, top: rect.top };
    }
  });

  return (
    <div
      className={floatingStyles.floatingOption}
      ref={ref}
      style={{ "--background-color": option.backgroundColor }}
      onMouseDownCapture={option.onMouseDown}
    >
      {option.value}
    </div>
  );
};

type FloatingWindowOption = {
  value: string;
  backgroundColor?: CSSProperties["backgroundColor"];
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
};

export type FloatingWindowOptions = Record<string, FloatingWindowOption>;

type FloatingWindowOptionsProps<T extends FloatingWindowOptions> = {
  parentPos: WindowPosition;
  parentWidth: number;
  zIndex: number;
  onClose?: () => void;
  title?: string;
  options?: T;
};

export function FloatingWindowOptionContainer<T extends FloatingWindowOptions>({ parentPos, ...props }: FloatingWindowOptionsProps<T>) {
  const [pos, setPos] = useState<WindowPosition>({
    left: parentPos.left + props.parentWidth,
    top: parentPos.top,
  });
  const ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const windowSize = useWindowSize();

  useLayoutEffect(() => {
    if (ref.current && windowSize.width > 0 && windowSize.height > 0) {
      const rect = ref.current.getBoundingClientRect();
      if (parentPos.left + props.parentWidth + rect.width > windowSize.width) {
        setPos({ left: parentPos.left - rect.width, top: parentPos.top });
      } else {
        setPos({
          left: parentPos.left + props.parentWidth,
          top: parentPos.top,
        });
      }
    }
  }, [windowSize, parentPos, props.parentWidth]);

  useEffect(() => {
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
        const newCursorPos = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        void invoke("set_cursor_position", newCursorPos);
      }
    }
  }, []);

  useOnClickOutside(ref, (event) => {
    if (!event.defaultPrevented) {
      props.onClose?.();
    }
  });

  return (
    <Portal>
      <div className={floatingStyles.optionsBody} style={{ ...pos, zIndex: 10000 + props.zIndex + 1 }} ref={ref}>
        {props.title && (
          <div className={floatingStyles.header} ref={headerRef}>
            <div className={clsx(floatingStyles.col, floatingStyles.flex)}>{props.title}</div>
            <div className={clsx(floatingStyles.col, floatingStyles.rect)} onMouseDownCapture={props.onClose} ref={xRef}>
              X
            </div>
          </div>
        )}
        {props.options && Object.entries(props.options).map(([key, option]) => <FloatingWindowOptionRow key={key} option={option} />)}
      </div>
    </Portal>
  );
}
