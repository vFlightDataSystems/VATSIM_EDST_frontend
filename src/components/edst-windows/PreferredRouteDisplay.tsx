import React, { useState } from "react";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { Tooltips } from "../../tooltips";
import { OptionsBodyCol, OptionsBodyRow, ScrollContainer, UnderlineRow } from "../../styles/optionMenuStyles";
import { ApiPreferentialArrivalRoute } from "../../types/apiPreferentialArrivalRoute";
import { ApiPreferentialDepartureRoute } from "../../types/apiPreferentialDepartureRoute";
import { ApiPreferentialDepartureArrivalRoute } from "../../types/apiPreferentialDepartureArrivalRoute";
import { EdstPreferentialRoute } from "../../types/edstPreferentialRoute";

const PrefrouteContainer = styled(ScrollContainer)`
  border: 2px solid #414141;
  margin: 6px;
  min-height: 40px;
`;

const Row = styled(OptionsBodyRow)`
  padding: 4px 0;
`;

const PrefrouteRow = styled(OptionsBodyRow)`
  padding: 0 0 0 10px;
  margin: 0;
`;

const Col = styled(OptionsBodyCol)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: auto;
  margin-right: 0;
  padding-left: 4px;
`;

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
    .map(r => {
      return { ...r, routeType: "pdar" } as EdstPreferentialRoute;
    })
    .concat(
      pdr.map(r => {
        return { ...r, routeType: "pdr" } as EdstPreferentialRoute;
      })
    )
    .concat(
      par.map(r => {
        return { ...r, routeType: "par" } as EdstPreferentialRoute;
      })
    );
}

export const PreferredRouteDisplay: React.FC<PreferredRouteDisplayProps> = ({ par, pdr, pdar, clearedPrefroute }) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const routes = computeRouteList(par, pdr, pdar);
  const eligibleRoutes = routes.filter(r => r.eligible);

  return (
    <div>
      <Row bottomBorder />
      <UnderlineRow as={Row}>Apply ATC Preferred Route</UnderlineRow>
      <Row>
        <Col>
          <EdstButton
            content="ELIGIBLE"
            selected={eligibleOnly}
            margin="0 6px"
            width={85}
            onMouseDown={() => setEligibleOnly(true)}
            title={Tooltips.routeMenuPreferredEligible}
          />
          <EdstButton
            content="ALL"
            selected={!eligibleOnly}
            width={75}
            onMouseDown={() => setEligibleOnly(false)}
            title={Tooltips.routeMenuPreferredAll}
          />
        </Col>
      </Row>
      <PrefrouteContainer maxHeight={100}>
        {eligibleOnly && eligibleRoutes.length === 0 && (
          <PrefrouteRow key="route-menu-prefroute-row-no-eligible-avail">No Eligible APRs: Select ALL to display Ineligible APRs</PrefrouteRow>
        )}
        {Object.entries(routes).map(([i, r]: [string, EdstPreferentialRoute]) => {
          return (
            r &&
            (!eligibleOnly || r.eligible) && (
              <PrefrouteRow key={`route-menu-prefroute-row-${i}`}>
                <Col hover onMouseDown={() => clearedPrefroute(r)}>
                  {r.routeType === "pdr" || r.routeType === "pdar" ? r.departure : ""}
                  {r.routeType === "pdar" ? r.route : r.amendment}
                  {r.routeType === "par" || r.routeType === "pdar" ? r.destination : ""}
                </Col>
              </PrefrouteRow>
            )
          );
        })}
      </PrefrouteContainer>
    </div>
  );
};
