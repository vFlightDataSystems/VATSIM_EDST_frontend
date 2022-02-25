import React, {useContext, useRef, useState,} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstContext} from "../../contexts/contexts";
import {EdstButton} from "../resources/EdstButton";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {aselEntrySelector, updateEntry} from "../../redux/slices/entriesSlice";
import {windowEnum} from "../../enums";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {EdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";

export const CancelHoldMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const entry = useAppSelector(aselEntrySelector) as EdstEntryType;
  const pos = useAppSelector(windowPositionSelector(windowEnum.cancelHoldMenu))
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
           onMouseDown={(event) => startDrag(event, ref, windowEnum.cancelHoldMenu)}
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
              dispatch(closeWindow(windowEnum.cancelHoldMenu))
            }}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.cancelHoldMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
}
