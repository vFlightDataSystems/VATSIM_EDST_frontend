import React, { useRef } from "react";

import { point } from "@turf/turf";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { computeFrdString, getClosestReferenceFix, removeDestFromRouteString } from "../../lib";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entriesSlice";
import { closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { AircraftTrack, LocalEdstEntry } from "../../types";
import { useCenterCursor, useDragging, useFocused } from "../../hooks/utils";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { referenceFixSelector } from "../../redux/slices/sectorSlice";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { aselTrackSelector } from "../../redux/slices/aircraftTrackSlice";
import { EdstWindow } from "../../namespaces";

const PrevRouteMenuDiv = styled(OptionsMenu)`
  width: 380px;
`;

export const PreviousRouteMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
  const referenceFixes = useRootSelector(referenceFixSelector);
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PREV_ROUTE_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.EQUIPMENT_TEMPLATE_MENU);

  const closestReferenceFix = entry.aclDisplay
    ? getClosestReferenceFix(referenceFixes, point([aircraftTrack.location.lon, aircraftTrack.location.lat]))
    : null;
  const frd = closestReferenceFix ? computeFrdString(closestReferenceFix) : null;

  const route = removeDestFromRouteString(entry.route.slice(0), entry.destination);

  return (
    pos &&
    entry && (
      <PrevRouteMenuDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.PREV_ROUTE_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.PREV_ROUTE_MENU) > 0 && dispatch(pushZStack(EdstWindow.PREV_ROUTE_MENU))}
        anyDragging={anyDragging}
        id="prev-route-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Previous Route Menu
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.equipment.split("/")[0]}/${entry.nasSuffix}`}
          </FidRow>
          <OptionsBodyRow padding="0 8px">
            <OptionsBodyCol>
              RTE {frd || ""}
              {entry.previousRoute}
            </OptionsBodyCol>
          </OptionsBodyRow>
          <OptionsBodyRow margin="0">
            <OptionsBodyCol>
              <EdstButton
                content="Apply Previous Route"
                onMouseDown={() => {
                  // TODO: implement
                  dispatch(closeWindow(EdstWindow.PREV_ROUTE_MENU));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.PREV_ROUTE_MENU))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </OptionsBody>
      </PrevRouteMenuDiv>
    )
  );
};
