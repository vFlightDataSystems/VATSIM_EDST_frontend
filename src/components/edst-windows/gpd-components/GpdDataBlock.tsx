import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventListener } from "usehooks-ts";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { anyDraggingSelector, aselSelector, setAnyDragging } from "../../../redux/slices/appSlice";
import { edstFontFamily } from "../../../styles/styles";
import { WindowPosition } from "../../../typeDefinitions/types/windowPosition";
import { EdstEntry } from "../../../typeDefinitions/types/edstEntry";
import { gpdAircraftSelect } from "../../../redux/thunks/aircraftSelect";
import { EdstWindow } from "../../../typeDefinitions/enums/edstWindow";
import { AclRowField } from "../../../typeDefinitions/enums/acl/aclRowField";
import { LeaderLine } from "./LeaderLine";
import { DragPreviewStyle } from "../../../typeDefinitions/types/dragPreviewStyle";
import { EdstDraggingOutline } from "../../EdstDraggingOutline";
import { openMenuThunk } from "../../../redux/thunks/openMenuThunk";
import { useAselEventListener } from "../../../hooks/useAselEventListener";

type GpdDataBlockProps = {
  entry: EdstEntry;
  pos: WindowPosition | null;
  toggleShowRoute(): void;
};

const DataBlockDiv = styled.div<{ pos: WindowPosition; offset: { x: number; y: number } }>`
  z-index: 999;
  ${props => ({
    left: props.pos.x + props.offset.x,
    top: props.pos.y + props.offset.y
  })}
  font-size: 16px;
  line-height: 1;
  width: auto;
  position: absolute;
  font-family: ${edstFontFamily};
  color: #adadad;
`;

const DataBlockRow = styled.div`
  display: flex;
  width: 9ch;
`;

const DataBlockElement = styled.span<{ selected?: boolean }>`
  height: 1em;
  color: ${props => (props.selected ? "#000000" : "#ADADAD")};
  background-color: ${props => (props.selected ? "#ADADAD" : "transparent")};
  border: 1px solid transparent;
  margin: 0 1px;
  padding: 0 1px;
  flex-grow: 1;
  display: inline-flex;

  :hover {
    border: 1px solid #adadad;
  }
`;

export const GpdDataBlock = ({ entry, pos, toggleShowRoute }: GpdDataBlockProps) => {
  const dispatch = useRootDispatch();
  const asel = useRootSelector(aselSelector);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<DragPreviewStyle | null>(null);
  const [offset, setOffset] = useState({ x: 24, y: -30 });
  const leaderLineOffset = { x: offset.x, y: offset.y + 6 };

  const selectedField = useMemo(() => (asel?.aircraftId === entry.aircraftId && asel?.window === EdstWindow.GPD ? asel.field : null), [
    asel?.aircraftId,
    asel?.field,
    asel?.window,
    entry.aircraftId
  ]);

  const handleClick = useCallback(
    (element: HTMLElement, field: AclRowField, eventId: string | null, opensWindow?: EdstWindow) => {
      dispatch(gpdAircraftSelect(entry.aircraftId, field, eventId));
      if (opensWindow && !(selectedField === field)) {
        dispatch(openMenuThunk(opensWindow, element));
      }
    },
    [dispatch, entry.aircraftId, selectedField]
  );

  const altRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  useAselEventListener<AclRowField>(altRef, entry.aircraftId, "gpd-alt-asel", AclRowField.ALT, EdstWindow.ALTITUDE_MENU, handleClick);
  useAselEventListener<AclRowField>(altRef, entry.aircraftId, "gpd-dest-asel", AclRowField.ROUTE, EdstWindow.ROUTE_MENU, handleClick);

  const onCallsignClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!anyDragging) {
      switch (event.button) {
        case 0:
          dispatch(gpdAircraftSelect(entry.aircraftId, AclRowField.FID, null));
          break;
        case 1:
          toggleShowRoute();
          break;
        default:
          break;
      }
    }
  };

  const draggingHandler = useCallback((event: MouseEvent) => {
    if (event) {
      setDragPreviewStyle(prevStyle => ({
        ...prevStyle!,
        left: event.pageX + prevStyle!.relX,
        top: event.pageY + prevStyle!.relY
      }));
    }
  }, []);

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
        <LeaderLine pos={pos} offset={leaderLineOffset} toggleShowRoute={toggleShowRoute} />
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} absolute />}
        <DataBlockDiv ref={ref} pos={pos} offset={offset} onMouseMove={event => !dragPreviewStyle && startDrag(event)}>
          <DataBlockRow>
            <DataBlockElement selected={selectedField === AclRowField.FID} onMouseUp={onCallsignClick}>
              {entry.aircraftId}
            </DataBlockElement>
          </DataBlockRow>
          <DataBlockRow>
            <DataBlockElement
              ref={altRef}
              selected={selectedField === AclRowField.ALT}
              onMouseUp={event => handleClick(event.currentTarget, AclRowField.ALT, "gpd-alt-asel", EdstWindow.ALTITUDE_MENU)}
            >
              {entry.interimAltitude ? `${entry.interimAltitude}T${entry.altitude}` : `${entry.altitude}`}
            </DataBlockElement>
          </DataBlockRow>
          <DataBlockRow>
            <DataBlockElement
              ref={destRef}
              selected={selectedField === AclRowField.ROUTE}
              onMouseUp={event => handleClick(event.currentTarget, AclRowField.ROUTE, "gpd-dest-asel", EdstWindow.ROUTE_MENU)}
            >
              {entry.destination}
            </DataBlockElement>
            <DataBlockElement
              selected={selectedField === AclRowField.SPD}
              onMouseUp={event => handleClick(event.currentTarget, AclRowField.SPD, "gpd-spd-asel")}
            >
              {entry.speed}
            </DataBlockElement>
          </DataBlockRow>
        </DataBlockDiv>
      </>
    )
  );
};
