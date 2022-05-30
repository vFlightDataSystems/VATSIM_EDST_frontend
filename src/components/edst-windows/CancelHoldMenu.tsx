import React, { useRef } from "react";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { useRootDispatch, useRootSelector } from "../../redux/hooks";
import { aselEntrySelector, updateEntry } from "../../redux/slices/entriesSlice";
import { EdstMenu } from "../../enums";
import { closeMenu, menuPositionSelector, zStackSelector, pushZStack } from "../../redux/slices/appSlice";
import { LocalEdstEntry } from "../../types";
import { amendEntryThunk } from "../../redux/thunks/entriesThunks";
import { useCenterCursor, useDragging, useFocused } from "../../hooks";
import { FidRow, OptionsBodyCol, OptionsBody, OptionsBodyRow, OptionsMenu, OptionsMenuHeader } from "../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../styles/draggingStyles";

const CancelHoldDiv = styled(OptionsMenu)`
  width: 250px;
`;

export const CancelHoldMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntry;
  const pos = useRootSelector(menuPositionSelector(EdstMenu.cancelHoldMenu));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstMenu.cancelHoldMenu);

  return (
    pos &&
    entry && (
      <CancelHoldDiv
        ref={ref}
        pos={pos}
        zIndex={zStack.indexOf(EdstMenu.cancelHoldMenu)}
        onMouseDown={() => zStack.indexOf(EdstMenu.cancelHoldMenu) > 0 && dispatch(pushZStack(EdstMenu.cancelHoldMenu))}
        anyDragging={anyDragging}
        id="cancel-hold-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          Cancel Hold Confirmation
        </OptionsMenuHeader>
        <OptionsBody>
          <FidRow>
            {entry.callsign} {entry.type}/{entry.equipment}
          </FidRow>
          <OptionsBodyRow>
            <OptionsBodyCol>
              <EdstButton
                content="Cancel Hold"
                onMouseDown={() => {
                  dispatch(updateEntry({ cid: entry.cid, data: { aclRouteDisplay: null } }));
                  dispatch(amendEntryThunk({ cid: entry.cid, planData: { hold_data: null } }));
                  dispatch(closeMenu(EdstMenu.cancelHoldMenu));
                }}
              />
            </OptionsBodyCol>
            <OptionsBodyCol alignRight>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(EdstMenu.cancelHoldMenu))} />
            </OptionsBodyCol>
          </OptionsBodyRow>
        </OptionsBody>
      </CancelHoldDiv>
    )
  );
};
