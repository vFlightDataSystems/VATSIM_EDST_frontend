import React, { useRef, useState } from "react";

import { EdstButton } from "../../resources/EdstButton";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { EdstMenu } from "../../../enums";
import { closeMenu, menuSelector, zStackSelector, pushZStack } from "../../../redux/slices/appSlice";
import { useDragging, useFocused } from "../../../hooks";
import { GpdMapFeaturesMenu } from "./GpdMapFeaturesMenu";
import {
  OptionsBodyCol,
  OptionsFlexCol,
  OptionsBody,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsMenu,
  OptionsMenuHeader
} from "../../../styles/optionMenuStyles";
import { EdstDraggingOutline } from "../../../styles/draggingStyles";

export const GpdMapOptions: React.FC = () => {
  const dispatch = useRootDispatch();
  const menuProps = useRootSelector(menuSelector(EdstMenu.gpdMapOptionsMenu));
  const zStack = useRootSelector(zStackSelector);
  const [mapFeaturesMenuOpen, setMapFeaturesMenuOpen] = useState(false);
  const [aircraftDisplayMenuIsOpen, setAircraftDisplayMenuIsOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstMenu.gpdMapOptionsMenu);

  return (
    menuProps?.position && (
      <OptionsMenu
        ref={ref}
        pos={menuProps.position}
        zIndex={zStack.indexOf(EdstMenu.gpdMapOptionsMenu)}
        onMouseDown={() => zStack.indexOf(EdstMenu.gpdMapOptionsMenu) > 0 && dispatch(pushZStack(EdstMenu.gpdMapOptionsMenu))}
        anyDragging={anyDragging}
        id="gpd-map-options-menu"
      >
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} onMouseUp={stopDrag} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag} onMouseUp={stopDrag}>
          {aircraftDisplayMenuIsOpen && "Aircraft Display"}
          {mapFeaturesMenuOpen && "Map Features"}
          {!(aircraftDisplayMenuIsOpen || mapFeaturesMenuOpen) && "Map Options"} Menu
        </OptionsMenuHeader>
        <OptionsBody>
          {mapFeaturesMenuOpen && <GpdMapFeaturesMenu />}
          {!mapFeaturesMenuOpen && (
            <span>
              <OptionsBodyRow>
                <EdstTooltip
                  style={{ flexGrow: 1 }}
                  // onMouseDown={() => {}}
                >
                  <OptionsFlexCol onMouseDown={() => setMapFeaturesMenuOpen(true)}>Map Features...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <EdstTooltip
                  style={{ flexGrow: 1 }}
                  // onMouseDown={() => {}}
                >
                  <OptionsFlexCol>AC Display Menu...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBottomRow>
                <OptionsBodyCol alignRight>
                  <EdstButton content="Exit" onMouseDown={() => dispatch(closeMenu(EdstMenu.gpdMapOptionsMenu))} />
                </OptionsBodyCol>
              </OptionsBottomRow>
            </span>
          )}
        </OptionsBody>
      </OptionsMenu>
    )
  );
};
