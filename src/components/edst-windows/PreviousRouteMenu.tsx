import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {computeFrd, copy, getClosestReferenceFix, removeDestFromRouteString} from "../../lib";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {closeMenu, menuPositionSelector} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {point} from "@turf/turf";
import {useFocused} from "../../hooks";

export const PreviousRouteMenu: React.FC = () => {
  const {startDrag, stopDrag} = useContext(EdstContext);
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const referenceFixes = useAppSelector((state) => state.sectorData.referenceFixes);
  const pos = useAppSelector(menuPositionSelector(menuEnum.prevRouteMenu));
  const dispatch = useAppDispatch();
  const ref = useRef(null);
  const focused = useFocused(ref);

  const closestReferenceFix = entry.aclDisplay ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
  const frd = closestReferenceFix ? computeFrd(closestReferenceFix) : null;

  const route = removeDestFromRouteString(entry.route.slice(0), entry.dest);

  return pos && entry && (<div
      ref={ref}
      className="options-menu prev-route no-select"
      id="prev-route-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, menuEnum.prevRouteMenu)}
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
            RTE {frd ? frd : ''}{entry.previous_route}
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
                    route_data: entry.previous_route_data,
                    cleared_direct: {frd: (frd ?? null), fix: entry.previous_route_data?.[0].name}
                  }
                }));
                dispatch(closeMenu(menuEnum.prevRouteMenu));
              }}
            />
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit"
                        onMouseDown={() => dispatch(closeMenu(menuEnum.prevRouteMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};