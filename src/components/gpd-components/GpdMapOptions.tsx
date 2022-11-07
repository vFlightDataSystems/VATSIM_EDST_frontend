import React, { useRef, useState } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { zStackSelector, pushZStack, windowSelector, closeWindow } from "~redux/slices/appSlice";
import {
  OptionsBodyCol,
  OptionsFlexCol,
  OptionsBody,
  OptionsBodyRow,
  OptionsBottomRow,
  OptionsMenu,
  OptionsMenuHeader,
} from "styles/optionMenuStyles";
import { useDragging } from "hooks/useDragging";
import { useFocused } from "hooks/useFocused";
import { EdstWindow } from "enums/edstWindow";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { GpdMapFeaturesMenu } from "components/GpdMapFeaturesMenu";
import { ExitButton } from "components/utils/EdstButton";

export const GpdMapOptions = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, EdstWindow.GPD_MAP_OPTIONS_MENU));
  const zStack = useRootSelector(zStackSelector);
  const [mapFeaturesMenuOpen, setMapFeaturesMenuOpen] = useState(false);
  const [aircraftDisplayMenuIsOpen, setAircraftDisplayMenuIsOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, EdstWindow.GPD_MAP_OPTIONS_MENU, "mouseup");

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
        {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
        <OptionsMenuHeader focused={focused} onMouseDown={startDrag}>
          {aircraftDisplayMenuIsOpen && "Aircraft Display"}
          {mapFeaturesMenuOpen && "Map Features"}
          {!(aircraftDisplayMenuIsOpen || mapFeaturesMenuOpen) && "Map Options"} Menu
        </OptionsMenuHeader>
        <OptionsBody>
          {mapFeaturesMenuOpen && <GpdMapFeaturesMenu />}
          {!(mapFeaturesMenuOpen || aircraftDisplayMenuIsOpen) && (
            <>
              <OptionsBodyRow>
                <OptionsFlexCol onMouseDown={() => setMapFeaturesMenuOpen(true)}>Map Features...</OptionsFlexCol>
              </OptionsBodyRow>
              <OptionsBodyRow>
                <OptionsFlexCol>AC Display Menu...</OptionsFlexCol>
              </OptionsBodyRow>
              <OptionsBottomRow>
                <OptionsBodyCol alignRight>
                  <ExitButton onMouseDown={() => dispatch(closeWindow(EdstWindow.GPD_MAP_OPTIONS_MENU))} />
                </OptionsBodyCol>
              </OptionsBottomRow>
            </>
          )}
        </OptionsBody>
      </OptionsMenu>
    )
  );
};
