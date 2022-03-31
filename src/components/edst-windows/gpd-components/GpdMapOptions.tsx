import React, {useContext, useRef, useState} from 'react';

import {EdstButton} from "../../resources/EdstButton";
import {EdstTooltip} from "../../resources/EdstTooltip";
import {EdstContext} from "../../../contexts/contexts";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {menuEnum} from "../../../enums";
import {closeMenu, menuSelector} from "../../../redux/slices/appSlice";
import {useFocused} from "../../../hooks";
import {GpdMapFeaturesMenu} from "./GpdMapFeaturesMenu";
import {
  OptionsBodyCol,
  OptionsFlexCol,
  OptionsBody,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsMenu,
  OptionsMenuHeader
} from '../../../styles/optionMenuStyles';

export const GpdMapOptions: React.FC = () => {
  const dispatch = useAppDispatch();
  const menuProps = useAppSelector(menuSelector(menuEnum.gpdMapOptionsMenu));
  const {startDrag, stopDrag} = useContext(EdstContext);
  const [mapFeaturesMenuOpen, setMapFeaturesMenuOpen] = useState(false);
  const [aircraftDisplayMenuIsOpen, setAircraftDisplayMenuIsOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);

  return menuProps?.position && (<OptionsMenu
      pos={menuProps.position}
      ref={ref}
      id="gpd-map-options-menu"
    >
      <OptionsMenuHeader
        focused={focused}
        onMouseDown={(event) => startDrag(event, ref, menuEnum.gpdMapOptionsMenu)}
        onMouseUp={(event) => stopDrag(event)}
      >
        {aircraftDisplayMenuIsOpen && "Aircraft Display"}
        {mapFeaturesMenuOpen && "Map Features"}
        {!(aircraftDisplayMenuIsOpen || mapFeaturesMenuOpen) && "Map Options"} Menu
      </OptionsMenuHeader>
      <OptionsBody>
        {mapFeaturesMenuOpen && <GpdMapFeaturesMenu/>}
        {!mapFeaturesMenuOpen && <span>
            <OptionsBodyRow>
          <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => {
          }}>
              <OptionsFlexCol onMouseDown={() => setMapFeaturesMenuOpen(true)}>
                  Map Features...
              </OptionsFlexCol>
          </EdstTooltip>
          </OptionsBodyRow>
            <OptionsBodyRow>
          <EdstTooltip style={{flexGrow: 1}} onMouseDown={() => {
          }}>
              <OptionsFlexCol>
                  AC Display Menu...
              </OptionsFlexCol>
          </EdstTooltip>
          </OptionsBodyRow>
          <OptionsBottomRow>
            <OptionsBodyCol alignRight={true}>
              <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(menuEnum.gpdMapOptionsMenu))}/>
            </OptionsBodyCol>
          </OptionsBottomRow>
        </span>}
      </OptionsBody>
    </OptionsMenu>
  );
};
