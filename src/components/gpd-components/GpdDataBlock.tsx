import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventListener } from "usehooks-ts";
import { Tooltip, useMap } from "react-leaflet";
import type { Nullable } from "types/utility-types";
import { aircraftIsAselSelector, anyDraggingSelector, setAnyDragging } from "~redux/slices/appSlice";
import type { EdstEntry } from "types/edstEntry";
import { gpdAircraftSelect } from "~redux/thunks/aircraftSelect";
import { EdstWindow } from "enums/edstWindow";
import { AclRowField } from "enums/acl/aclRowField";
import type { DragPreviewStyle } from "types/dragPreviewStyle";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useAselEventListener } from "hooks/useAselEventListener";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import type { DataBlockOffset } from "components/GpdMapElements";
import { LeaderLine } from "components/LeaderLine";

type DataBlockDivProps = { offset: DataBlockOffset };
const DataBlockDiv = styled.div<DataBlockDivProps>`
  position: relative;
  left: ${(props) => props.offset.x}px;
  top: ${(props) => props.offset.y}px;
  font-size: 16px;
  line-height: 1;
  width: 9ch;
  font-family: ${(props) => props.theme.fontProps.edstFontFamily};
  color: #adadad;
`;

const DataBlockRow = styled.div`
  display: flex;
  width: 9ch;
`;
type DataBlockElementProps = { selected: boolean };
const DataBlockElement = styled.span<DataBlockElementProps>`
  height: 1em;
  color: ${(props) => (props.selected ? "#000000" : props.theme.colors.grey)};
  background-color: ${(props) => (props.selected ? props.theme.colors.grey : "transparent")};
  border: 1px solid transparent;
  margin: 0 1px;
  padding: 0 1px;
  flex-grow: 1;
  display: inline-flex;

  :hover {
    border: 1px solid #adadad;
  }
`;

const InvisibleTooltip = styled(Tooltip)`
  &::before {
    all: unset;
  }
  background: transparent;
  border: none;
  width: 0;
  height: 0;
`;

type PersistentInvisibleTooltipProps = {
  children: React.ReactNode;
};
const PersistentInvisibleTooltip = ({ children }: PersistentInvisibleTooltipProps) => {
  return (
    <InvisibleTooltip permanent interactive opacity={1} direction="center">
      {children}
    </InvisibleTooltip>
  );
};

type GpdDataBlockProps = {
  entry: EdstEntry;
  offset: DataBlockOffset;
  setOffset: (offset: DataBlockOffset) => void;
  toggleShowRoute: () => void;
};

export const GpdDataBlock = React.memo(({ entry, offset, setOffset, toggleShowRoute }: GpdDataBlockProps) => {
  const map = useMap();
  const dispatch = useRootDispatch();
  const asel = useRootSelector((state) => aircraftIsAselSelector(state, entry.aircraftId));
  const anyDragging = useRootSelector(anyDraggingSelector);
  const ref = useRef<HTMLDivElement>(null);
  const [dragPreviewStyle, setDragPreviewStyle] = useState<Nullable<DragPreviewStyle>>(null);

  const selectedField = useMemo(
    () => (asel?.aircraftId === entry.aircraftId && asel?.window === EdstWindow.GPD ? asel.field : null),
    [asel?.aircraftId, asel?.field, asel?.window, entry.aircraftId]
  );

  const handleClick = useCallback(
    (element: HTMLElement, field: AclRowField, eventId: Nullable<string>, opensWindow?: EdstWindow) => {
      dispatch(gpdAircraftSelect(entry.aircraftId, field, eventId));
      if (opensWindow && !(selectedField === field)) {
        dispatch(openMenuThunk(opensWindow, element));
      }
    },
    [dispatch, entry.aircraftId, selectedField]
  );

  const altRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  useAselEventListener(altRef, entry.aircraftId, "gpd-alt-asel", AclRowField.ALT, EdstWindow.ALTITUDE_MENU, handleClick);
  useAselEventListener(altRef, entry.aircraftId, "gpd-dest-asel", AclRowField.ROUTE, EdstWindow.ROUTE_MENU, handleClick);

  const onCallsignClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
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
      setDragPreviewStyle((prevStyle) => ({
        ...prevStyle!,
        left: event.pageX + prevStyle!.relX,
        top: event.pageY + prevStyle!.relY,
      }));
    }
  }, []);

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      const pos = ref.current?.getBoundingClientRect();
      const ppos = pos ? { x: pos.left, y: pos.top } : null;
      if (event.buttons && ref.current && ppos) {
        if (window.__TAURI__) {
          void invoke("set_cursor_grab", { value: true });
        }
        const relX = ppos.x - event.pageX;
        const relY = ppos.y - event.pageY;
        const style = {
          left: ppos.x - 1,
          top: ppos.y,
          relX,
          relY,
          height: ref.current.clientHeight,
          width: ref.current.clientWidth,
        };
        setDragPreviewStyle(style);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
        map.dragging.disable();
      }
    },
    [dispatch, draggingHandler, map]
  );

  const stopDrag = useCallback(() => {
    map.dragging.enable();
    if (ref.current && dragPreviewStyle) {
      const pos = ref.current.getBoundingClientRect();
      const ppos = { x: pos.left, y: pos.top };
      const newOffset = {
        x: offset.x - ppos.x + dragPreviewStyle.left,
        y: offset.y - ppos.y + dragPreviewStyle.top,
      };
      if (window.__TAURI__) {
        void invoke("set_cursor_grab", { value: false });
      }
      setOffset(newOffset);
      dispatch(setAnyDragging(false));
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, draggingHandler, map, offset, setOffset]);

  useEventListener("mouseup", stopDrag);

  return (
    <>
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <PersistentInvisibleTooltip>
        <LeaderLine offset={offset} toggleShowRoute={toggleShowRoute} />
        <DataBlockDiv ref={ref} offset={offset} onMouseMoveCapture={(event) => !dragPreviewStyle && startDrag(event)}>
          <DataBlockRow>
            <DataBlockElement selected={selectedField === AclRowField.FID} onMouseUp={onCallsignClick}>
              {entry.aircraftId}
            </DataBlockElement>
          </DataBlockRow>
          <DataBlockRow>
            <DataBlockElement
              ref={altRef}
              selected={selectedField === AclRowField.ALT}
              onMouseUp={(event) => handleClick(event.currentTarget, AclRowField.ALT, "gpd-alt-asel", EdstWindow.ALTITUDE_MENU)}
            >
              {entry.interimAltitude ? `${entry.interimAltitude}T${entry.altitude}` : `${entry.altitude}`}
            </DataBlockElement>
          </DataBlockRow>
          <DataBlockRow>
            <DataBlockElement
              ref={destRef}
              selected={selectedField === AclRowField.ROUTE}
              onMouseUp={(event) => handleClick(event.currentTarget, AclRowField.ROUTE, "gpd-dest-asel", EdstWindow.ROUTE_MENU)}
            >
              {entry.destination}
            </DataBlockElement>
            <DataBlockElement
              selected={selectedField === AclRowField.SPD}
              onMouseUp={(event) => handleClick(event.currentTarget, AclRowField.SPD, "gpd-spd-asel")}
            >
              {entry.speed}
            </DataBlockElement>
          </DataBlockRow>
        </DataBlockDiv>
      </PersistentInvisibleTooltip>
    </>
  );
});
