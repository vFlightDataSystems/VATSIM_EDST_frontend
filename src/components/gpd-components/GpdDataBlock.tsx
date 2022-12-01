import React, { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useEventListener } from "usehooks-ts";
import { Tooltip, useMap } from "react-leaflet";
import type { Nullable } from "types/utility-types";
import { aircraftIsAselSelector, anyDraggingSelector, setAnyDragging } from "~redux/slices/appSlice";
import type { EdstEntry } from "types/edstEntry";
import { gpdAircraftSelect } from "~redux/thunks/aircraftSelect";
import type { EdstWindow } from "types/edstWindow";
import type { AclRowField } from "types/acl/aclRowField";
import type { DragPreviewStyle } from "types/dragPreviewStyle";
import { openMenuThunk } from "~redux/thunks/openMenuThunk";
import { useAselEventListener } from "hooks/useAselEventListener";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import type { DataBlockOffset } from "components/GpdMapElements";
import { LeaderLine } from "components/LeaderLine";
import gpdStyles from "css/gpd.module.scss";
import clsx from "clsx";

type PersistentInvisibleTooltipProps = {
  children: React.ReactNode;
};
const PersistentInvisibleTooltip = ({ children }: PersistentInvisibleTooltipProps) => {
  return (
    <Tooltip permanent interactive opacity={1} direction="center">
      {children}
    </Tooltip>
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

  const selectedField = asel?.aircraftId === entry.aircraftId && asel?.window === "GPD" ? asel.field : null;

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
  useAselEventListener(altRef, entry.aircraftId, "gpd-alt-asel", "ALT_ACL_ROW_FIELD", "ALTITUDE_MENU", handleClick);
  useAselEventListener(altRef, entry.aircraftId, "gpd-dest-asel", "ROUTE_ACL_ROW_FIELD", "ROUTE_MENU", handleClick);

  const onCallsignClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!anyDragging) {
      switch (event.button) {
        case 0:
          dispatch(gpdAircraftSelect(entry.aircraftId, "FID_ACL_ROW_FIELD", null));
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
        <div
          className={gpdStyles.datablock}
          style={{ left: `${offset.x}px`, top: `${offset.y}px` }}
          ref={ref}
          onMouseMoveCapture={(event) => !dragPreviewStyle && startDrag(event)}
        >
          <div className={gpdStyles.dbRow}>
            <div className={clsx(gpdStyles.dbElement, { selected: selectedField === "FID_ACL_ROW_FIELD" })} onMouseUp={onCallsignClick}>
              {entry.aircraftId}
            </div>
          </div>
          <div className={gpdStyles.dbRow}>
            <div
              className={clsx(gpdStyles.dbElement, { selected: selectedField === "ALT_ACL_ROW_FIELD" })}
              ref={altRef}
              onMouseUp={(event) => handleClick(event.currentTarget, "ALT_ACL_ROW_FIELD", "gpd-alt-asel", "ALTITUDE_MENU")}
            >
              {entry.interimAltitude ? `${entry.interimAltitude}T${entry.altitude}` : `${entry.altitude}`}
            </div>
          </div>
          <div className={gpdStyles.dbRow}>
            <div
              className={clsx(gpdStyles.dbElement, { selected: selectedField === "ROUTE_ACL_ROW_FIELD" })}
              ref={destRef}
              onMouseUp={(event) => handleClick(event.currentTarget, "ROUTE_ACL_ROW_FIELD", "gpd-dest-asel", "ROUTE_MENU")}
            >
              {entry.destination}
            </div>
            <div
              className={clsx(gpdStyles.dbElement, { selected: selectedField === "SPD_ACL_ROW_FIELD" })}
              onMouseUp={(event) => handleClick(event.currentTarget, "SPD_ACL_ROW_FIELD", "gpd-spd-asel")}
            >
              {entry.speed}
            </div>
          </div>
        </div>
      </PersistentInvisibleTooltip>
    </>
  );
});
