import React, { useRef, useState } from "react";

import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { zStackSelector, pushZStack, windowSelector, closeWindow } from "~redux/slices/appSlice";
import { useDragging } from "hooks/useDragging";
import { useFocused } from "hooks/useFocused";
import { EdstDraggingOutline } from "components/utils/EdstDraggingOutline";
import { GpdMapFeaturesMenu } from "components/GpdMapFeaturesMenu";
import { ExitButton } from "components/utils/EdstButton";
import optionStyles from "css/optionMenu.module.scss";
import clsx from "clsx";

export const GpdMapOptions = () => {
  const dispatch = useRootDispatch();
  const windowProps = useRootSelector((state) => windowSelector(state, "GPD_MAP_OPTIONS_MENU"));
  const zStack = useRootSelector(zStackSelector);
  const [mapFeaturesMenuOpen, setMapFeaturesMenuOpen] = useState(false);
  const [aircraftDisplayMenuIsOpen] = useState(false);
  const ref = useRef(null);
  const focused = useFocused(ref);
  const { startDrag, dragPreviewStyle, anyDragging } = useDragging(ref, "GPD_MAP_OPTIONS_MENU", "mouseup");

  return (
    <div
      className={clsx(optionStyles.root, { noPointerEvents: anyDragging })}
      style={{ ...windowProps.position, zIndex: 10000 + zStack.indexOf("GPD_MAP_OPTIONS_MENU") }}
      ref={ref}
      onMouseDown={() => zStack.indexOf("GPD_MAP_OPTIONS_MENU") < zStack.length - 1 && dispatch(pushZStack("GPD_MAP_OPTIONS_MENU"))}
    >
      {dragPreviewStyle && <EdstDraggingOutline style={dragPreviewStyle} />}
      <div className={clsx(optionStyles.header, { focused })} onMouseDown={startDrag}>
        {aircraftDisplayMenuIsOpen && "Aircraft Display"}
        {mapFeaturesMenuOpen && "Map Features"}
        {!(aircraftDisplayMenuIsOpen || mapFeaturesMenuOpen) && "Map Options"} Menu
      </div>
      <div className={optionStyles.body}>
        {mapFeaturesMenuOpen && <GpdMapFeaturesMenu />}
        {!(mapFeaturesMenuOpen || aircraftDisplayMenuIsOpen) && (
          <>
            <div className={optionStyles.row}>
              <div className={clsx(optionStyles.col, "flex")} onMouseDown={() => setMapFeaturesMenuOpen(true)}>
                Map Features...
              </div>
            </div>
            <div className={optionStyles.row}>
              <div className={clsx(optionStyles.col, "flex", { isDisabled: true })}>AC Display Menu...</div>
            </div>
            <div className={optionStyles.bottomRow}>
              <div className={clsx(optionStyles.col, "right")}>
                <ExitButton onMouseDown={() => dispatch(closeWindow("GPD_MAP_OPTIONS_MENU"))} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
