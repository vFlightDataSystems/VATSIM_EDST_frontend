import React, {useRef} from 'react';
import {EdstButton} from "../resources/EdstButton";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {aselEntrySelector, updateEntry} from "../../redux/slices/entriesSlice";
import {menuEnum} from "../../enums";
import {closeMenu, menuPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {useCenterCursor, useDragging, useFocused} from "../../hooks";
import {
  FidRow, OptionsBodyCol,
  OptionsBody,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import {EdstDraggingOutline} from "../../styles/draggingStyles";
import styled from "styled-components";

const CancelHoldDiv = styled(OptionsMenu)`width: 250px`;

export const CancelHoldMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useRootSelector(menuPositionSelector(menuEnum.cancelHoldMenu))
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const {startDrag, stopDrag, dragPreviewStyle} = useDragging(ref, menuEnum.cancelHoldMenu);

  return pos && entry && (<CancelHoldDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.cancelHoldMenu)}
      onMouseDown={() => zStack.indexOf(menuEnum.cancelHoldMenu) > 0 && dispatch(pushZStack(menuEnum.cancelHoldMenu))}
      id="cancel-hold-menu"
    >
      {dragPreviewStyle && <EdstDraggingOutline
          style={dragPreviewStyle}
          onMouseUp={stopDrag}
      />}
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={startDrag}
        onMouseUp={stopDrag}
      >
        Cancel Hold Confirmation
      </OptionsMenuHeader>
      <OptionsBody>
        <FidRow>
          {entry.callsign} {entry.type}/{entry.equipment}
        </FidRow>
        <OptionsBodyRow>
          <OptionsBodyCol>
            <EdstButton content="Cancel Hold" onMouseDown={() => {
              dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: null}}));
              dispatch(amendEntryThunk({cid: entry.cid, planData: {hold_data: null}}));
              dispatch(closeMenu(menuEnum.cancelHoldMenu))
            }}/>
          </OptionsBodyCol>
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit"
                        onMouseDown={() => dispatch(closeMenu(menuEnum.cancelHoldMenu))}/>
          </OptionsBodyCol>
        </OptionsBodyRow>
      </OptionsBody>
    </CancelHoldDiv>
  );
}
