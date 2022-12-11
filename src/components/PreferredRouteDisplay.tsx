import React, { useState } from "react";
import type { ApiAdaptedArrivalRoute } from "types/apiTypes/apiAdaptedArrivalRoute";
import type { ApiAdaptedDepartureRoute } from "types/apiTypes/apiAdaptedDepartureRoute";
import type { ApiAdaptedDepartureArrivalRoute } from "types/apiTypes/apiAdaptedDepartureArrivalRoute";
import type { EdstAdaptedRoute } from "types/edstAdaptedRoute";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import socket from "~socket";
import routeStyles from "css/routeMenu.module.scss";
import movableMenuStyles from "css/movableMenu.module.scss";
import clsx from "clsx";

type PreferredRouteDisplayProps = {
  aar: ApiAdaptedArrivalRoute[];
  adr: ApiAdaptedDepartureRoute[];
  adar: ApiAdaptedDepartureArrivalRoute[];
  clearedPrefroute: (prefRoute: EdstAdaptedRoute) => void;
};

function computeRouteList(
  aar: ApiAdaptedArrivalRoute[],
  adr: ApiAdaptedDepartureRoute[],
  adar: ApiAdaptedDepartureArrivalRoute[]
): EdstAdaptedRoute[] {
  return adar
    .map((r) => {
      return { ...r, routeType: "adar" } as EdstAdaptedRoute;
    })
    .concat(
      adr.map((r) => {
        return { ...r, routeType: "adr" } as EdstAdaptedRoute;
      })
    )
    .concat(
      aar.map((r) => {
        return { ...r, routeType: "aar" } as EdstAdaptedRoute;
      })
    );
}

export const PreferredRouteDisplay = ({ aar, adr, adar, clearedPrefroute }: PreferredRouteDisplayProps) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const routes = computeRouteList(aar, adr, adar);
  const eligibleRoutes = routes.filter((r) => r.eligible);

  useSharedUiListener("routeMenuSetEligibleOnly", setEligibleOnly);

  return (
    <div className={routeStyles.pContainer}>
      <div className={movableMenuStyles.row}>
        <div className={movableMenuStyles.col}>
          <div
            style={{ width: "8ch" }}
            className={clsx(movableMenuStyles.blackButton2, { [movableMenuStyles.selected]: eligibleOnly })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetEligibleOnly", true);
              setEligibleOnly(true);
            }}
          >
            ELIGIBLE
          </div>
          <div
            style={{ width: "8ch" }}
            className={clsx(movableMenuStyles.blackButton2, { [movableMenuStyles.selected]: !eligibleOnly })}
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetEligibleOnly", false);
              setEligibleOnly(false);
            }}
          >
            ALL
          </div>
        </div>
      </div>
      <div className={clsx(routeStyles.prefrouteContainer, "scrollContainer")}>
        {eligibleOnly && eligibleRoutes.length === 0 && (
          <div className={routeStyles.prefrouteRow}>No Eligible APRs: Select ALL to display Ineligible APRs</div>
        )}
        {routes.map((route, i) => {
          return (
            route &&
            (!eligibleOnly || route.eligible) && (
              // eslint-disable-next-line react/no-array-index-key
              <div className={routeStyles.prefrouteRow} key={i}>
                <div className={routeStyles.prefrouteCol} onMouseDown={() => clearedPrefroute(route)}>
                  {route.routeType === "adr" || route.routeType === "adar" ? route.departure : ""}
                  {route.routeType === "adar" ? route.route : route.amendment}
                  {route.routeType === "aar" || route.routeType === "adar" ? route.destination : ""}
                </div>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};
