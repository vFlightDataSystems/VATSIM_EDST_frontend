import React, { useState } from "react";
import { Tooltips } from "~/tooltips";
import type { ApiPreferentialArrivalRoute } from "types/apiTypes/apiPreferentialArrivalRoute";
import type { ApiPreferentialDepartureRoute } from "types/apiTypes/apiPreferentialDepartureRoute";
import type { ApiPreferentialDepartureArrivalRoute } from "types/apiTypes/apiPreferentialDepartureArrivalRoute";
import type { EdstPreferentialRoute } from "types/edstPreferentialRoute";
import { useSharedUiListener } from "hooks/useSharedUiListener";
import { EdstButton } from "components/utils/EdstButton";
import socket from "~socket";
import routeStyles from "css/routeMenu.module.scss";

type PreferredRouteDisplayProps = {
  par: ApiPreferentialArrivalRoute[];
  pdr: ApiPreferentialDepartureRoute[];
  pdar: ApiPreferentialDepartureArrivalRoute[];
  clearedPrefroute: (prefRoute: EdstPreferentialRoute) => void;
};

function computeRouteList(
  par: ApiPreferentialArrivalRoute[],
  pdr: ApiPreferentialDepartureRoute[],
  pdar: ApiPreferentialDepartureArrivalRoute[]
): EdstPreferentialRoute[] {
  return pdar
    .map((r) => {
      return { ...r, routeType: "pdar" } as EdstPreferentialRoute;
    })
    .concat(
      pdr.map((r) => {
        return { ...r, routeType: "pdr" } as EdstPreferentialRoute;
      })
    )
    .concat(
      par.map((r) => {
        return { ...r, routeType: "par" } as EdstPreferentialRoute;
      })
    );
}

export const PreferredRouteDisplay = ({ par, pdr, pdar, clearedPrefroute }: PreferredRouteDisplayProps) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const routes = computeRouteList(par, pdr, pdar);
  const eligibleRoutes = routes.filter((r) => r.eligible);

  useSharedUiListener("routeMenuSetEligibleOnly", setEligibleOnly);

  return (
    <div>
      <div className={routeStyles.row} />
      <div className={routeStyles.underlineRow}>Apply ATC Preferred Route</div>
      <div className={routeStyles.row}>
        <div className={routeStyles.col}>
          <EdstButton
            content="ELIGIBLE"
            selected={eligibleOnly}
            margin="0 6px"
            width="85px"
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetEligibleOnly", true);
              setEligibleOnly(true);
            }}
            title={Tooltips.routeMenuPreferredEligible}
          />
          <EdstButton
            content="ALL"
            selected={!eligibleOnly}
            width="75px"
            onMouseDown={() => {
              socket.dispatchUiEvent("routeMenuSetEligibleOnly", false);
              setEligibleOnly(false);
            }}
            title={Tooltips.routeMenuPreferredAll}
          />
        </div>
      </div>
      <div className={routeStyles.prefrouteContainer}>
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
                  {route.routeType === "pdr" || route.routeType === "pdar" ? route.departure : ""}
                  {route.routeType === "pdar" ? route.route : route.amendment}
                  {route.routeType === "par" || route.routeType === "pdar" ? route.destination : ""}
                </div>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
};
