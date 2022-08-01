import React, { useRef, useState } from "react";

import { EdstButton } from "../../resources/EdstButton";
import { EdstTooltip } from "../../resources/EdstTooltip";
import { useRootDispatch, useRootSelector } from "../../../redux/hooks";
import { zStackSelector, pushZStack, windowSelector, closeWindow } from "../../../redux/slices/appSlice";
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
import { EdstDraggingOutline } from "../../EdstDraggingOutline";
import { EdstWindow } from "../../../namespaces";
import { useDragging } from "../../../hooks/useDragging";
import { useFocused } from "../../../hooks/useFocused";

export const GpdMapOptions = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector(windowSelector(EdstWindow.GPD_MAP_OPTIONS_MENU));
  const zStack = useRootSelector(zStackSelector);
  const [mapFeaturesMenuOpen, setMapFeaturesMenuOpen] = useState(false);
  const [aircraftDisplayMenuIsOpen, setAircraftDisplayMenuIsOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, stopDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GPD_MAP_OPTIONS_MENU);

  return (
    windowProps?.position && (
      <OptionsMenu
        ref={ref}
        pos={windowProps.position}
        zIndex={zStack.indexOf(EdstWindow.GPD_MAP_OPTIONS_MENU)}
        onMouseDown={() =>
          zStack.indexOf(EdstWindow.GPD_MAP_OPTIONS_MENU) < zStack.length - 1 && dispatch(pushZStack(EdstWindow.GPD_MAP_OPTIONS_MENU))
        }
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
          {!(mapFeaturesMenuOpen || aircraftDisplayMenuIsOpen) && (
            <span>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }}>
                  <OptionsFlexCol onMouseDown={() => setMapFeaturesMenuOpen(true)}>Map Features...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <EdstTooltip style={{ flexGrow: 1 }}>
                  <OptionsFlexCol>AC Display Menu...</OptionsFlexCol>
                </EdstTooltip>
              </OptionsBodyRow>
              <OptionsBottomRow>
                <OptionsBodyCol alignRight>
                  <EdstButton content="Exit" onMouseDown={() => dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU))} />
                </OptionsBodyCol>
              </OptionsBottomRow>
            </span>
          )}
        </OptionsBody>
      </OptionsMenu>
    )
  );
};
