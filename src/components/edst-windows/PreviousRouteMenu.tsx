import React, { useEffect, useRef, useState } from "react";

import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { getFrd, removeDestFromRouteString } from "../../lib";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector } from "../../redux/slices/entrySlice";
import { closeWindow, windowPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { aselTrackSelector } from "../../redux/slices/trackSlice";
import { EdstWindow } from "../../namespaces";
import { useHub } from "../../hooks/hub";
import { useDragging } from "../../hooks/useDragging";
import { useCenterCursor } from "../../hooks/useCenterCursor";
import { useFocused } from "../../hooks/useFocused";

const PrevRouteMenuDiv = styled(OptionsMenu)`
  width: 380px;
`;

export const PreviousRouteMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const aircraftTrack = useRootSelector(aselTrackSelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.PREV_ROUTE_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  const [frd, setFrd] = useState(null);
  const hubConnection = useHub();
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.EQUIPMENT_TEMPLATE_MENU);

  useEffect(() => {
    async function updateFrd() {
      setFrd(await getFrd(aircraftTrack.location, hubConnection));
    }
    updateFrd().then();
  }, []);

  const route = removeDestFromRouteString(entry.route.slice(0), entry.destination);

  return (
    pos &&
    entry && (
      <PrevRouteMenuDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.PREV_ROUTE_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.PREV_ROUTE_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.PREV_ROUTE_MENU))}
        anyDragging={anyDragging}
        id="prev-route-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Previous Route Menu
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
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
