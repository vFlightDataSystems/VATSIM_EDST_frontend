import React, { useState } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { closeWindow } from "~redux/slices/appSlice";
import { WindowTitleBar } from "components/WindowTitleBar";
import { EdstWindowHeaderButton, EdstWindowHeaderButtonWithSharedEvent, ExitButton } from "components/utils/EdstButton";
import type { HeaderComponentProps } from "components/utils/FullscreenWindow";
import tableStyles from "css/table.module.scss";
import {
  setWindGridShowTemps,
  windGridShowTempsSelector,
  windGridFlightLevelSelector,
  setWindGridZoomLevel,
  windGridZoomLevelSelector,
  windGridDateTimeSelector,
} from "~redux/slices/windGridSlice";
import { ZOOM_SNAP } from "components/Gpd";

// Helper to format YYYYMMDD as MM/DD/YYYY
function formatDate(yyyymmdd?: string) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "--/--/----";
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${m}/${d}/${y}`;
}

// Helper to format HH as HH:00
function formatTime(hh?: string) {
  if (!hh || hh.length < 1) return "--:--";
  return `${hh.padStart(2, "0")}:00`;
}

export const WindGridHeader = ({ focused, toggleFullscreen, startDrag }: HeaderComponentProps) => {
  const zoomLevel = useRootSelector(windGridZoomLevelSelector);
  const dispatch = useRootDispatch();
  const tempsShown = useRootSelector(windGridShowTempsSelector);
  const currentLevel = useRootSelector(windGridFlightLevelSelector);
  const { date, time } = useRootSelector(windGridDateTimeSelector);

  const handleRangeClick = (event: React.MouseEvent) => {
    switch (event.button) {
      case 0:
        dispatch(setWindGridZoomLevel(zoomLevel + ZOOM_SNAP));
        break;
      case 1:
        dispatch(setWindGridZoomLevel(zoomLevel - ZOOM_SNAP));
        break;
      default:
        break;
    }
  };

  return (
    <div className={tableStyles.header} style={{ position: "relative" }}>
      <WindowTitleBar
        focused={focused}
        toggleFullscreen={toggleFullscreen}
        startDrag={startDrag}
        closeWindow={() => dispatch(closeWindow("WIND"))}
        text={["Wind Grid Display"]}
      />
      <div className={tableStyles.header}>
        <EdstWindowHeaderButton disabled content="Recenter" />
        <EdstWindowHeaderButton width="11ch" onMouseDown={handleRangeClick} content={`Range ${zoomLevel}`} />
        <EdstWindowHeaderButtonWithSharedEvent
          sharedUiEventId="openWindGridAltitudeMenu"
          edstWindow="WIND_GRID_ALTITUDE_MENU"
          content="Altitude..."
        />
        <EdstWindowHeaderButton content={tempsShown ? "Remove Temp" : "Show Temp"} onMouseDown={() => dispatch(setWindGridShowTemps(!tempsShown))} />
        <ExitButton onMouseDown={() => dispatch(closeWindow("WIND"))} />
      </div>
      <div className={tableStyles.bottomHeaderRow}>
        Alt: {(currentLevel * 100).toLocaleString()} Ft.&nbsp;&nbsp; Date: {formatDate(date)}&nbsp;&nbsp; Time: {formatTime(time)}
      </div>
    </div>
  );
};
