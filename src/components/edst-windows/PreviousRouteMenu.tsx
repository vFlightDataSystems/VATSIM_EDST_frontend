import React, {useContext, useRef, useState} from 'react';
import {EdstContext} from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {copy, removeDestFromRouteString} from "../../lib";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {closeWindow, windowPositionSelector} from "../../redux/slices/appSlice";
import {EdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/asyncThunks";

export const PreviousRouteMenu: React.FC = () => {
  const {startDrag, stopDrag} = useContext(EdstContext);
  const entry = useAppSelector(aselEntrySelector) as EdstEntryType;
  const pos = useAppSelector(windowPositionSelector(windowEnum.prevRouteMenu));
  const dispatch = useAppDispatch();
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  const route = removeDestFromRouteString(entry.route.slice(0), entry.dest);

  return pos && entry && (<div
      ref={ref}
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu prev-route no-select"
      id="prev-route-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, windowEnum.prevRouteMenu)}
           onMouseUp={(event) => stopDrag(event)}
      >
        Previous Route Menu
      </div>
      <div className="options-body">
        <div className="options-row fid">
          {entry.callsign} {entry.type}/{entry.equipment}
        </div>
        <div className="options-row prev-route-row">
          <div className="options-col">
            RTE {(entry.previous_route as string).startsWith(entry.cleared_direct?.fix ?? '') && entry.cleared_direct?.frd + '..'}{entry.previous_route}
          </div>
        </div>
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton
              content="Apply Previous Route"
              onMouseDown={() => {
                copy(route.replace(/\.+$/, ''));
                dispatch(amendEntryThunk({
                  cid: entry.cid,
                  planData: {
                    route: entry.previous_route,
                    route_data: entry.previous_route_data
                  }
                }));
                dispatch(closeWindow(windowEnum.prevRouteMenu));
              }}
            />
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.prevRouteMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};
