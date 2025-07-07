import type { RefObject } from "react";
import React, { useCallback, useRef, useState } from "react";
import { useEventListener } from "usehooks-ts";
import type { Nullable } from "types/utility-types";
import { aircraftIsAselSelector, anyDraggingSelector, setAnyDragging } from "~redux/slices/appSlice";
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
import type { AircraftId } from "types/aircraftId";
import { entrySelector } from "~redux/slices/entrySlice";
import { aircraftTrackSelector } from "~redux/slices/trackSlice";
import { appWindow } from "@tauri-apps/api/window";

type GpdDataBlockProps = {
  aircraftId: AircraftId;
  offset: DataBlockOffset;
  setOffset: (offset: DataBlockOffset) => void;
  toggleShowRoute: () => void;
};

export const GpdDataBlock = React.memo(({ aircraftId, offset, setOffset, toggleShowRoute }: GpdDataBlockProps) => {
  const dispatch = useRootDispatch();
  const entry = useRootSelector((state) => entrySelector(state, aircraftId));
  const track = useRootSelector((state) => aircraftTrackSelector(state, aircraftId));
  const asel = useRootSelector((state) => aircraftIsAselSelector(state, aircraftId));
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
    if (!anyDragging && event.button === 0) {
      dispatch(gpdAircraftSelect(entry.aircraftId, "FID_ACL_ROW_FIELD", null));
    }
  };

  const draggingHandler = useCallback((event: MouseEvent) => {
    setDragPreviewStyle((prevStyle) => ({
      ...prevStyle!,
      left: event.pageX + prevStyle!.relX,
      top: event.pageY + prevStyle!.relY,
    }));
  }, []);

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      const pos = ref.current?.getBoundingClientRect();
      const ppos = pos ? { x: pos.left, y: pos.top } : null;
      if (event.buttons === 1 && ref.current && ppos) {
        if (window.__TAURI__) {
          void appWindow.setCursorGrab(true);
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
        console.log(style);
        setDragPreviewStyle(style);
        dispatch(setAnyDragging(true));
        window.addEventListener("mousemove", draggingHandler);
      }
    },
    [dispatch, draggingHandler]
  );

  const stopDrag = useCallback(() => {
    if (ref.current && dragPreviewStyle) {
      const pos = ref.current.getBoundingClientRect();
      const ppos = { x: pos.left, y: pos.top };
      const newOffset = {
        x: offset.x - ppos.x + dragPreviewStyle.left,
        y: offset.y - ppos.y + dragPreviewStyle.top,
      };
      if (window.__TAURI__) {
        void appWindow.setCursorGrab(false);
      }
      setOffset(newOffset);
      dispatch(setAnyDragging(false));
      setDragPreviewStyle(null);
      window.removeEventListener("mousemove", draggingHandler);
    }
  }, [dispatch, dragPreviewStyle, draggingHandler, offset, setOffset]);

  useEventListener("mouseup", stopDrag);

  const dbElement = (
    elemRef: RefObject<HTMLDivElement> | null,
    content: string | number,
    fieldName: AclRowField,
    eventId: string,
    opensWindow?: EdstWindow
  ) => (
    <div
      className={clsx(gpdStyles.dbElement, { selected: selectedField === fieldName })}
      ref={elemRef}
      onMouseUp={(event) => {
        if (event.button === 0) {
          handleClick(event.currentTarget, fieldName, eventId, opensWindow);
        }
      }}
    >
      {content}
    </div>
  );

  return track ? (
    <>
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
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
          {dbElement(
            altRef,
            entry.interimAltitude ? `${entry.interimAltitude}T${entry.altitude}` : `${entry.altitude}`,
            "ALT_ACL_ROW_FIELD",
            "gpd-alt-asel",
            "ALTITUDE_MENU"
          )}
        </div>
        <div className={gpdStyles.dbRow}>
          {dbElement(destRef, entry.destination, "ROUTE_ACL_ROW_FIELD", "gpd-dest-asel", "ROUTE_MENU")}
          {dbElement(null, track.groundSpeed ?? "", "SPD_ACL_ROW_FIELD", "gpd-spd-asel")}
        </div>
      </div>
    </>
  ) : null;
});
