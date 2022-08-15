import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventListener } from "usehooks-ts";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { aselSelector, setAnyDragging } from "../../../redux/slices/appSlice";
import { edstFontFamily } from "../../../styles/styles";
import { WindowPosition } from "../../../types/windowPosition";
import { EdstEntry } from "../../../types/edstEntry";
import { gpdAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import { EdstWindow } from "../../../enums/edstWindow";
import { AclRowField } from "../../../enums/acl/aclRowField";
import { TrackLine } from "./TrackLine";
import { DragPreviewStyle } from "../../../types/dragPreviewStyle";
import { EdstDraggingOutline } from "../../EdstDraggingOutline";

type GpdDataBlockProps = {
  entry: EdstEntry;
  pos: { x: number; y: number } | null;
  toggleShowRoute(): void;
};

const DataBlockDiv = styled.div<{ pos: WindowPosition; offset: { x: number; y: number } }>`
  z-index: 999;
  ${props => ({
    left: props.pos.x + props.offset.x,
    top: props.pos.y + props.offset.y
  })}
  width: auto;
  position: absolute;
  font-family: ${edstFontFamily};
  font-size: 16px;
  line-height: 16px;
  color: #adadad;
`;

const DataBlockElement = styled.span<{ selected?: boolean }>`
  color: ${props => (props.selected ? "#000000" : "#ADADAD")};
  background-color: ${props => (props.selected ? "#ADADAD" : "#000000")};
  width: auto;
  display: inline-flex;
  border: 1px solid transparent;
  margin: 0 1px;
  padding: 0 1px;

  :hover {
    border: 1px solid #adadad;
  }
`;

export const GpdDataBlock = ({ entry, pos, toggleShowRoute }: GpdDataBlockProps) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<DragPreviewStyle | null>(null);
  // datablock offset after it has been dragged by the user
  // to be implemented
  const [offset, setOffset] = useState({ x: 24, y: -30 });

  const selectedField = asel?.aircraftId === entry.aircraftId && asel?.window === EdstWindow.GPD ? (asel.field as AclRowField) : null;

  const onCallsignMouseDown = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.FID));
        break;
      case 1:
        toggleShowRoute();
        break;
      default:
        break;
    }
  };

  const draggingHandler = useCallback(
    (event: MouseEvent) => {
      if (event) {
        setDragPreviewStyle(prevStyle => ({
          ...prevStyle!,
          left: event.pageX + prevStyle!.relX,
          top: event.pageY + prevStyle!.relY
        }));
      }
    },
    [ref]
  );

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      const ppos = pos ? { x: pos.x + offset.x, y: pos.y + offset.y } : null;
      if (event.buttons && ref.current && ppos) {
        // eslint-disable-next-line no-underscore-dangle
        if (window.__TAURI__) {
          invoke("set_cursor_grab", { value: true }).then();
        }
        const relX = ppos.x - event.pageX;
        const relY = ppos.y - event.pageY;
        const style = {
          left: ppos.x - 1,
          top: ppos.y,
          relX,
          relY,
          height: ref.current.clientHeight,
          width: ref.current.clientWidth
        };
        setDragPreviewStyle(style);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
      }
    },
    [dispatch, draggingHandler, ref, pos, offset]
  );

  const stopDrag = useCallback(() => {
    if (ref?.current && dragPreviewStyle && pos) {
      const { left: x, top: y } = dragPreviewStyle;
      const newOffset = { x: x + 1 - pos.x, y: y - pos.y };
      // eslint-disable-next-line no-underscore-dangle
      if (window.__TAURI__) {
        invoke("set_cursor_grab", { value: false }).then();
      }
      setOffset(newOffset);
      dispatch(setAnyDragging(false));
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, draggingHandler, ref, pos]);

  useEventListener("mouseup", stopDrag);

  return (
    pos && (
      <>
        <TrackLine start={pos} end={{ x: pos.x + offset.x, y: pos.y + offset.y + 6 }} toggleShowRoute={toggleShowRoute} />
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} absolute />}
        <DataBlockDiv ref={ref} pos={pos} offset={offset} onMouseMove={event => !dragPreviewStyle && startDrag(event)}>
          <DataBlockElement selected={selectedField === AclRowField.FID} onMouseDown={onCallsignMouseDown}>
            {entry.aircraftId}
          </DataBlockElement>
          <br />
          <DataBlockElement
            selected={selectedField === AclRowField.ALT}
            onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.ALT, null, EdstWindow.ALTITUDE_MENU))}
          >
            {entry.interimAltitude ? `${entry.interimAltitude}T${entry.altitude}` : `${entry.altitude}C`}
          </DataBlockElement>
          <br />
          <DataBlockElement
            selected={selectedField === AclRowField.ROUTE}
            onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.ROUTE, null, EdstWindow.ROUTE_MENU))}
          >
            {entry.destination}
          </DataBlockElement>
          <DataBlockElement
            selected={selectedField === AclRowField.SPD}
            onMouseDown={event => dispatch(gpdAircraftSelect(event, entry.aircraftId, AclRowField.SPD))}
          >
            {entry.speed}
          </DataBlockElement>
        </DataBlockDiv>
      </>
    )
  );
};
