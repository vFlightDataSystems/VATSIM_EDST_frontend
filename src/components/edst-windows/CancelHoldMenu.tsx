import React, {useContext, useRef, useState,} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {aselEntrySelector, updateEntry} from "../../redux/slices/entriesSlice";
import {menuEnum} from "../../enums";
import {closeMenu, menuPositionSelector} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";

export const CancelHoldMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const pos = useAppSelector(menuPositionSelector(menuEnum.cancelHoldMenu))
  const dispatch = useAppDispatch();

  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  return pos && entry && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu cancel-hold no-select"
      ref={ref}
      id="cancel-hold-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, menuEnum.cancelHoldMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Cancel Hold Confirmation
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row">
          <div className="options-col left">
            <EdstButton content="Cancel Hold" onMouseDown={() => {
              dispatch(updateEntry({cid: entry.cid, data: {aclRouteDisplay: null}}));
              dispatch(amendEntryThunk({cid: entry.cid, planData: {hold_data: null}}));
              dispatch(closeMenu(menuEnum.cancelHoldMenu))
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.cancelHoldMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
}
