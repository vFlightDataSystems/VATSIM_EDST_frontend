import React, { useEffect, useState } from "react";

import { useEventListener } from "usehooks-ts";
import { EdstHeader } from "./components/EdstHeader";
import { Acl } from "./components/edst-windows/Acl";
import { Dep } from "./components/edst-windows/Dep";
import { Status } from "./components/edst-windows/Status";
import { RouteMenu } from "./components/edst-windows/RouteMenu";
import { Outage } from "./components/edst-windows/Outage";
import { AltMenu } from "./components/edst-windows/AltMenu";
import { PlanOptions } from "./components/edst-windows/PlanOptions";
import { SortMenu } from "./components/edst-windows/SortMenu";
import { PlansDisplay } from "./components/edst-windows/PlansDisplay";
import { SpeedMenu } from "./components/edst-windows/spd-hdg/SpeedMenu";
import { HeadingMenu } from "./components/edst-windows/spd-hdg/HeadingMenu";
import { PreviousRouteMenu } from "./components/edst-windows/PreviousRouteMenu";
import { HoldMenu } from "./components/edst-windows/HoldMenu";
import { CancelHoldMenu } from "./components/edst-windows/CancelHoldMenu";
import { MessageComposeArea } from "./components/edst-windows/MessageComposeArea";
import { MessageResponseArea } from "./components/edst-windows/MessageResponseArea";
import { TemplateMenu } from "./components/edst-windows/TemplateMenu";
import { SectorSelector } from "./components/SectorSelector";
import { initThunk } from "./redux/thunks/initThunk";
import { refreshEntriesThunk } from "./redux/slices/entriesSlice";
import { EdstMenu, EdstWindow } from "./enums";
import {
  inputFocusedSelector,
  mcaCommandStringSelector,
  menusSelector,
  openWindow,
  setMcaCommandString,
  showSectorSelectorSelector,
  windowsSelector
} from "./redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "./redux/hooks";
import { ToolsMenu } from "./components/edst-windows/tools-components/ToolsMenu";
import { AltimeterWindow } from "./components/edst-windows/AltimeterWindow";
import { MetarWindow } from "./components/edst-windows/MetarWindow";
import { refreshWeatherThunk } from "./redux/thunks/weatherThunks";
import { EquipmentTemplateMenu } from "./components/edst-windows/template-components/EquipmentTemplateMenu";
import { SigmetWindow } from "./components/edst-windows/SigmetWindow";
import { Gpd } from "./components/edst-windows/Gpd";
import { EdstDiv, EdstBodyDiv } from "./styles/edstStyles";
import { GpdMapOptions } from "./components/edst-windows/gpd-components/GpdMapOptions";

// const CACHE_TIMEOUT = 300000; // ms

const ENTRIES_REFRESH_RATE = 20000; // 20 seconds
const WEATHER_REFRESH_RATE = 120000; // 2 minutes

export const App: React.FC = () => {
  const dispatch = useRootDispatch();
  const windows = useRootSelector(windowsSelector);
  const menus = useRootSelector(menusSelector);
  const showSectorSelector = useRootSelector(showSectorSelectorSelector);
  const mcaCommandString = useRootSelector(mcaCommandStringSelector);
  const inputFocused = useRootSelector(inputFocusedSelector);
  const [mcaInputRef, setMcaInputRef] = useState<React.RefObject<HTMLInputElement> | null>(null);
  const altMenuRef = React.useRef<{ showInput: boolean; inputRef: React.RefObject<HTMLInputElement> | null }>({
    showInput: false,
    inputRef: null
  });
  const bodyRef = React.useRef<HTMLDivElement & any>(null);

  useEffect(() => {
    dispatch(initThunk());
    const entriesUpdateIntervalId = setInterval(() => dispatch(refreshEntriesThunk()), ENTRIES_REFRESH_RATE);
    const weatherUpdateIntervalId = setInterval(() => dispatch(refreshWeatherThunk), WEATHER_REFRESH_RATE);
    return () => {
      if (entriesUpdateIntervalId) {
        clearInterval(entriesUpdateIntervalId);
      }
      if (weatherUpdateIntervalId) {
        clearInterval(weatherUpdateIntervalId);
      }
    }; // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (altMenuRef.current.inputRef === null) {
      altMenuRef.current.showInput = false;
    } else if (altMenuRef.current.inputRef?.current) {
      altMenuRef.current?.inputRef.current.focus();
    }
  }, [altMenuRef.current.inputRef]);

  const handleKeyDown = (event: KeyboardEvent) => {
    // event.preventDefault();
    if (!inputFocused) {
      if (menus[EdstMenu.altitudeMenu].open) {
        altMenuRef.current.showInput = true;
        if (altMenuRef.current.inputRef?.current) {
          altMenuRef.current?.inputRef.current.focus();
        }
      } else if (!mcaInputRef?.current) {
        dispatch(openWindow({ window: EdstWindow.messageComposeArea }));
        if (event.key.match(/(\w|\s|\d|\/)/gi) && event.key.length === 1) {
          dispatch(setMcaCommandString(mcaCommandString + event.key.toUpperCase()));
        }
      } else {
        mcaInputRef.current.focus();
      }
    }
  };

  useEventListener("keydown", handleKeyDown);

  return (
    <EdstDiv
      ref={bodyRef}
      onContextMenu={event => process.env.NODE_ENV !== "development" && event.preventDefault()}
      tabIndex={!inputFocused ? -1 : 0}
    >
      <EdstHeader />
      <div id="toPrint" />
      <EdstBodyDiv>
        {showSectorSelector && <SectorSelector />}
        {windows[EdstWindow.acl].open && <Acl />}
        {windows[EdstWindow.dep].open && <Dep />}
        {windows[EdstWindow.graphicPlanDisplay].open && <Gpd />}
        {windows[EdstWindow.plansDisplay].open && <PlansDisplay />}
        {menus[EdstMenu.planOptions].open && <PlanOptions />}
        {menus[EdstMenu.sortMenu].open && <SortMenu />}
        {menus[EdstMenu.toolsMenu].open && <ToolsMenu />}
        {menus[EdstMenu.gpdMapOptionsMenu].open && <GpdMapOptions />}
        {menus[EdstMenu.routeMenu].open && <RouteMenu />}
        {menus[EdstMenu.templateMenu].open && <TemplateMenu />}
        {menus[EdstMenu.equipmentTemplateMenu].open && <EquipmentTemplateMenu />}
        {menus[EdstMenu.holdMenu].open && <HoldMenu />}
        {menus[EdstMenu.cancelHoldMenu].open && <CancelHoldMenu />}
        {menus[EdstMenu.prevRouteMenu].open && <PreviousRouteMenu />}
        {menus[EdstMenu.speedMenu].open && <SpeedMenu />}
        {menus[EdstMenu.headingMenu].open && <HeadingMenu />}
        {menus[EdstMenu.altitudeMenu].open && (
          <AltMenu
            setAltMenuInputRef={ref => {
              altMenuRef.current.inputRef = ref;
            }}
            showInput={altMenuRef.current.showInput}
          />
        )}
        {windows[EdstWindow.status].open && <Status />}
        {windows[EdstWindow.outage].open && <Outage />}
        {windows[EdstWindow.altimeter].open && <AltimeterWindow />}
        {windows[EdstWindow.metar].open && <MetarWindow />}
        {windows[EdstWindow.sigmets].open && <SigmetWindow />}
        {windows[EdstWindow.messageComposeArea].open && <MessageComposeArea setMcaInputRef={setMcaInputRef} />}
        {windows[EdstWindow.messageResponseArea].open && <MessageResponseArea />}
      </EdstBodyDiv>
    </EdstDiv>
  );
};
