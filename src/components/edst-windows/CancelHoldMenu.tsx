import React, { useRef } from "react";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector, updateEntry } from "../../redux/slices/entrySlice";
import { zStackSelector, pushZStack, windowPositionSelector, closeWindow } from "../../redux/slices/appSlice";
import { useCenterCursor, useDragging, useFocused } from "../../hooks/utils";
import { FidRow, OptionsBodyCol, OptionsBody, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";
import { EdstWindow } from "../../namespaces";

const CancelHoldDiv = styled(OptionsMenu)`
  width: 250px;
`;

export const CancelHoldMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector)!;
  const pos = useRootSelector(windowPositionSelector(EdstWindow.CANCEL_HOLD_MENU));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.CANCEL_HOLD_MENU);

  return (
    pos &&
    entry && (
      <CancelHoldDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstWindow.CANCEL_HOLD_MENU)}
        onMouseDown={() => zStack.indexOf(EdstWindow.CANCEL_HOLD_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.CANCEL_HOLD_MENU))}
        anyDragging={anyDragging}
        id="cancel-hold-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Cancel Hold Confirmation
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.aircraftId} {`${entry.aircraftType}/${entry.faaEquipmentSuffix}`}
          </FidRow>
          <OptionsBodyRow>
            <OptionsBodyCol>
              <EdstButton
                content="Cancel Hold"
                onMouseDown={() => {
                  dispatch(updateEntry({ aircraftId: entry.aircraftId, data: { aclRouteDisplay: null } }));
                  dispatch(closeWindow(EdstWindow.CANCEL_HOLD_MENU));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.CANCEL_HOLD_MENU))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </OptionsBody>
      </CancelHoldDiv>
    )
  );
};
