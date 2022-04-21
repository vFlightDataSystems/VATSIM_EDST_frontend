import React, {useContext, useRef} from 'react';
import {EdstContext} from "../../contexts/contexts";


import {EdstButton} from "../resources/EdstButton";
import {computeFrd, copy, getClosestReferenceFix, removeDestFromRouteString} from "../../lib";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {menuEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {closeMenu, menuPositionSelector, zStackSelector, setZStack} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {point} from "@turf/turf";
import {useFocused} from "../../hooks";
import {FidRow, OptionsBody, OptionsBodyCol, OptionsBodyRow, OptionsMenu, OptionsMenuHeader} from '../../styles/optionMenuStyles';

export const PreviousRouteMenu: React.FC = () => {
  const {startDrag, stopDrag} = useContext(EdstContext);
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;
  const referenceFixes = useAppSelector((state) => state.sectorData.referenceFixes);
  const pos = useAppSelector(menuPositionSelector(menuEnum.prevRouteMenu));
  const zStack = useAppSelector(zStackSelector);
  const dispatch = useAppDispatch();
  const ref = useRef(null);
  const focused = useFocused(ref);

  const closestReferenceFix = entry.aclDisplay ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
  const frd = closestReferenceFix ? computeFrd(closestReferenceFix) : null;

  const route = removeDestFromRouteString(entry.route.slice(0), entry.dest);

  return pos && entry && (<OptionsMenu
    width={380}
    pos={pos}
    zIndex={zStack.indexOf(menuEnum.prevRouteMenu)}
    ref={ref}
    onMouseDown={() => zStack.indexOf(menuEnum.prevRouteMenu) > 0 && dispatch(setZStack(menuEnum.prevRouteMenu))}
    id="prev-route-menu"
  >
    <OptionsMenuHeader
      focused={focused}
      onMouseDown={(event) => startDrag(event, ref, menuEnum.prevRouteMenu)}
      onMouseUp={(event) => stopDrag(event)}
    >
      Previous Route Menu
    </OptionsMenuHeader>
    <OptionsBody>
      <FidRow>
        {entry.callsign} {entry.type}/{entry.equipment}
      </FidRow>
      <OptionsBodyRow padding="0 8px">
        <OptionsBodyCol>
          RTE {frd ? frd : ''}{entry.previous_route}
        </OptionsBodyCol>
      </OptionsBodyRow>
      <OptionsBodyRow margin="0">
        <OptionsBodyCol>
          <EdstButton
            content="Apply Previous Route"
            onMouseDown={() => {
              copy(route.replace(/\.+$/, ''));
              dispatch(amendEntryThunk({
                cid: entry.cid,
                planData: {
                  route: entry.previous_route,
                  route_data: entry.previous_route_data,
                  cleared_direct: { frd: (frd ?? null), fix: entry.previous_route_data?.[0].name }
                }
              }));
              dispatch(closeMenu(menuEnum.prevRouteMenu));
            }}
          />
        </OptionsBodyCol>
        <OptionsBodyCol alignRight={true}>
          <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.prevRouteMenu))} />
        </OptionsBodyCol>
      </OptionsBodyRow>
    </OptionsBody>
  </OptionsMenu>
  );
};
