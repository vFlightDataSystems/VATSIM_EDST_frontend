import React, {useRef} from 'react';

import {EdstButton} from "../resources/EdstButton";
import {computeFrdString, copy, getClosestReferenceFix, removeDestFromRouteString} from "../../lib";
import {useRootDispatch, useRootSelector} from "../../redux/hooks";
import {menuEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {closeMenu, menuPositionSelector, zStackSelector, pushZStack} from "../../redux/slices/appSlice";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";
import {point} from "@turf/turf";
import {useCenterCursor, useDragging, useFocused} from "../../hooks";
import {
  FidRow,
  OptionsBody,
  OptionsBodyCol,
  OptionsBodyRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../styles/optionMenuStyles';
import {referenceFixSelector} from "../../redux/slices/sectorSlice";
import {EdstDraggingOutline} from "../../styles/draggingStyles";
import styled from "styled-components";

const PrevRouteMenuDiv = styled(OptionsMenu)`width: 380px`;

export const PreviousRouteMenu: React.FC = () => {
  const entry = useRootSelector(aselEntrySelector) as LocalEdstEntryType;
  const referenceFixes = useRootSelector(referenceFixSelector);
  const pos = useRootSelector(menuPositionSelector(menuEnum.prevRouteMenu));
  const zStack = useRootSelector(zStackSelector);
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement | null>(null);
  const focused = useFocused(ref);
  useCenterCursor(ref);
  const {startDrag, stopDrag, dragPreviewStyle, anyDragging} = useDragging(ref, menuEnum.equipmentTemplateMenu);

  const closestReferenceFix = entry.aclDisplay ? getClosestReferenceFix(referenceFixes, point([entry.flightplan.lon, entry.flightplan.lat])) : null;
  const frd = closestReferenceFix ? computeFrdString(closestReferenceFix) : null;

  const route = removeDestFromRouteString(entry.route.slice(0), entry.dest);

  return pos && entry && (<PrevRouteMenuDiv
      ref={ref}
      pos={pos}
      zIndex={zStack.indexOf(menuEnum.prevRouteMenu)}
      onMouseDown={() => zStack.indexOf(menuEnum.prevRouteMenu) > 0 && dispatch(pushZStack(menuEnum.prevRouteMenu))}
      anyDragging={anyDragging}
      id="prev-route-menu"
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
                copy(route.replace(/\.+$/, '')).then();
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
          </OptionsBodyCol>
          <OptionsBodyCol alignRight={true}>
            <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.prevRouteMenu))}/>
          </OptionsBodyCol>
        </OptionsBodyRow>
      </OptionsBody>
    </PrevRouteMenuDiv>
  );
};
