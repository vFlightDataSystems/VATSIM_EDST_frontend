import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {aselEntrySelector, updateEntry} from "../../redux/slices/entriesSlice";
import {menuEnum} from "../../enums";
import {closeMenu, menuPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {useCenterCursor, useFocused} from "../../hooks";
import {
  FidRow, OptionsBodyCol,
  OptionsBody,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';

export const CancelHoldMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useRootSelector(menuPositionSelector(menuEnum.cancelHoldMenu))
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);

  return pos && entry && (<OptionsMenu
      ref={ref}
      width={250}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.cancelHoldMenu)}
      onMouseDown={() => zStack.indexOf(menuEnum.cancelHoldMenu) > 0 && dispatch(pushZStack(menuEnum.cancelHoldMenu))}
      id="cancel-hold-menu"
    >
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={(event) => startDrag(event, ref, menuEnum.cancelHoldMenu)}
        onMouseUp={(event) => stopDrag(event)}
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
    </OptionsMenu>
  );
}
