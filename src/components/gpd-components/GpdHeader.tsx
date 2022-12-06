import React from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeAllMenus, closeWindow, gpdAselSelector } from "~redux/slices/appSlice";
import { gpdSuppressedSelector, gpdZoomLevelSelector, setGpdZoomLevel, toggleGpdSuppressed } from "~redux/slices/gpdSlice";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent } from "components/utils/EdstButton";
import { WindowTitleBar } from "components/WindowTitleBar";
import tableStyles from "css/table.module.scss";
import clsx from "clsx";
import { ZOOM_SNAP } from "components/Gpd";

type GpdHeaderProps = {
  focused: boolean;
  toggleFullscreen: () => void;
  startDrag: React.MouseEventHandler<HTMLDivElement>;
};

export const GpdHeader = ({ focused, toggleFullscreen, startDrag }: GpdHeaderProps) => {
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const asel = useRootSelector(gpdAselSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const dispatch = useRootDispatch();

  const handleRangeClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        dispatch(setGpdZoomLevel(zoomLevel + ZOOM_SNAP));
        break;
      case 1:
        dispatch(setGpdZoomLevel(zoomLevel - ZOOM_SNAP));
        break;
      default:
        break;
    }
  };

  const handleSuppressClick = () => {
    dispatch(toggleGpdSuppressed());
  };

  return (
    <div className={tableStyles.header}>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => {
          if (asel?.window === "GPD") {
            dispatch(closeAllMenus());
          }
          dispatch(closeWindow("GPD"));
        }}
        text={["Graphic Plan Display - Current Time"]}
      />
      <div>
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openGpdPlanOptions"
          edstWindow="PLAN_OPTIONS"
          disabled={asel === null}
          content="Plan Options..."
        />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openGpdHoldMenu" edstWindow="HOLD_MENU" disabled={asel === null} content="Hold..." />
        <EdstWindowHeaderButton disabled content="Show" />
        <EdstWindowHeaderButton disabled content="Show ALL" />
        <EdstWindowHeaderButton disabled content="Graphic..." />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openGpdTemplateMenu" edstWindow="TEMPLATE_MENU" content="Template..." />
        <EdstWindowHeaderButton
          disabled
          content="Clean Up"
          //
        />
      </div>
      <div className={clsx(tableStyles.headerRow)}>
        <EdstWindowHeaderButton disabled content="Recenter" />
        <EdstWindowHeaderButton width="11ch" onMouseDown={handleRangeClick} content={`Range ${zoomLevel}`} />
        <EdstWindowHeaderButton content={!suppressed ? "Suppress" : "Restore"} onMouseDown={handleSuppressClick} width="84px" />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openGpdMapOptions" edstWindow="GPD_MAP_OPTIONS_MENU" content="Map Options..." />
        <EdstWindowHeaderButtonWithSharedEvent sharedUiEventId="openGpdToolsMenu" edstWindow="TOOLS_MENU" content="Tools..." />
        <EdstWindowHeaderButton disabled content="Saved Map" />
      </div>
    </div>
  );
};
