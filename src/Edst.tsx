import React, { useEffect, useRef } from "react";

import { useInterval } from "usehooks-ts";
import { HubConnectionState } from "@microsoft/signalr";
import { EdstHeader } from "components/EdstHeader";
import { Acl } from "components/Acl";
import { Dep } from "components/Dep";
import { Status } from "components/Status";
import { RouteMenu } from "components/RouteMenu";
import { Outage } from "components/Outage";
import { AltMenu } from "components/AltMenu";
import { PlanOptions } from "components/PlanOptions";
import { PlansDisplay } from "components/PlansDisplay";
import { SpeedMenu } from "components/spd-hdg/SpeedMenu";
import { HeadingMenu } from "components/spd-hdg/HeadingMenu";
import { HoldMenu } from "components/HoldMenu";
import { MessageComposeArea } from "components/MessageComposeArea";
import { MessageResponseArea } from "components/MessageResponseArea";
import { TemplateMenu } from "components/TemplateMenu";
import { aselIsNullSelector, headerTopSelector, windowsSelector } from "~redux/slices/appSlice";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { ToolsMenu } from "components/tools-components/ToolsMenu";
import { AltimeterWindow } from "components/AltimeterWindow";
import { MetarWindow } from "components/MetarWindow";
import { refreshWeatherThunk } from "~redux/thunks/weatherThunks";
import { EquipmentTemplateMenu } from "components/template-components/EquipmentTemplateMenu";
import { SigmetWindow } from "components/SigmetWindow";
import { Gpd } from "components/Gpd";
import { GpdMapOptions } from "components/gpd-components/GpdMapOptions";
import type { EdstWindow } from "types/edstWindow";
import { CancelHoldMenu } from "components/prompts/CancelHoldMenu";
import { GIWindow } from "components/GeneralInforationWindow";
import { AclSortMenu } from "components/acl-components/AclSortMenu";
import { DepSortMenu } from "components/dep-components/DepSortMenu";
import { useHubActions } from "hooks/useHubActions";
import { unsafeEntries } from "~/utility-functions";
import { SocketContextProvider } from "contexts/SocketContext";
import { HubContextProvider } from "contexts/HubContext";
import { WEATHER_REFRESH_RATE } from "~/utils/constants";
import edstStyles from "css/edst.module.scss";
import clsx from "clsx";
import { envSelector, hubConnectedSelector } from "~redux/slices/authSlice";
import { useHubConnector } from "hooks/useHubConnector";
import { useNavigate } from "react-router-dom";

const NOT_CONNECTED_MSG = "HOST PROCESS COMMUNICATION DOWN";

const edstComponentMap = {
  ACL: Acl,
  DEP: Dep,
  GPD: Gpd,
  PLANS_DISPLAY: PlansDisplay,
  PLAN_OPTIONS: PlanOptions,
  ACL_SORT_MENU: AclSortMenu,
  DEP_SORT_MENU: DepSortMenu,
  TOOLS_MENU: ToolsMenu,
  GPD_MAP_OPTIONS_MENU: GpdMapOptions,
  ROUTE_MENU: RouteMenu,
  TEMPLATE_MENU: TemplateMenu,
  EQUIPMENT_TEMPLATE_MENU: EquipmentTemplateMenu,
  HOLD_MENU: HoldMenu,
  CANCEL_HOLD_MENU: CancelHoldMenu,
  SPEED_MENU: SpeedMenu,
  HEADING_MENU: HeadingMenu,
  ALTITUDE_MENU: AltMenu,
  STATUS: Status,
  OUTAGE: Outage,
  ALTIMETER: AltimeterWindow,
  METAR: MetarWindow,
  SIGMETS: SigmetWindow,
  GI: GIWindow,
  MESSAGE_RESPONSE_AREA: MessageResponseArea,
} as const;

const windowRequiresAselNotNull: EdstWindow[] = [
  "PLAN_OPTIONS",
  "ROUTE_MENU",
  "HOLD_MENU",
  "CANCEL_HOLD_MENU",
  "SPEED_MENU",
  "HEADING_MENU",
  "ALTITUDE_MENU",
];

const Edst = () => {
  const dispatch = useRootDispatch();
  const windows = useRootSelector(windowsSelector);
  const aselIsNull = useRootSelector(aselIsNullSelector);
  const bodyRef = useRef<HTMLDivElement>(null);
  const hubActions = useHubActions();
  const headerTop = useRootSelector(headerTopSelector);
  const env = useRootSelector(envSelector)!;
  const { connectHub } = useHubConnector();
  const hubConnected = useRootSelector(hubConnectedSelector);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!hubConnected) {
      connectHub().catch((e) => {
        console.log("Failed to connect to hub:", e?.message || "Unknown error");
      });
    }
  }, [connectHub, hubConnected]);

  // This effect handles if the user initiates a page reload.
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem('pageReloaded', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if we're coming from a reload
    if (sessionStorage.getItem('pageReloaded') === 'true') {
      sessionStorage.removeItem('pageReloaded');
      if (!hubConnected) {
        navigate('/login', { replace: true });
      }
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [navigate, hubConnected]);

  useInterval(() => dispatch(refreshWeatherThunk), WEATHER_REFRESH_RATE);

  return (
    <div
      className={edstStyles.root}
      ref={bodyRef}
      onContextMenu={(event) => event.preventDefault()}
      tabIndex={document.activeElement?.localName !== "input" && document.activeElement?.localName !== "textarea" ? -1 : 0}
    >

      <EdstHeader />
      {!hubConnected && <div className={edstStyles.notConnected}>{NOT_CONNECTED_MSG}</div>}
      <div id="toPrint" />
      <div className={clsx(edstStyles.body, { bottom: !headerTop })}>
        {unsafeEntries(edstComponentMap).map(
          ([edstWindow, Component]) =>
            windows[edstWindow].open &&
            (windowRequiresAselNotNull.includes(edstWindow) ? !aselIsNull && <Component key={edstWindow} /> : <Component key={edstWindow} />)
        )}
        <MessageComposeArea />
      </div>
    </div>
  );
};

const EdstProvider = () => (
  <React.StrictMode>
    <SocketContextProvider>
      <Edst />
    </SocketContextProvider>
  </React.StrictMode>
);

export default EdstProvider;
