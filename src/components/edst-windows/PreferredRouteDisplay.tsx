import React, { useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import { EdstButton } from "../resources/EdstButton";
import { Tooltips } from "../../tooltips";
import { EdstPreferentialRoute, PreferentialArrivalRoute, PreferentialDepartureArrivalRoute, PreferentialDepartureRoute } from "../../types";
import { OptionsBodyCol, OptionsBodyRow, ScrollContainer, UnderlineRow } from "../../styles/optionMenuStyles";

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
  align-items: center;
  vertical-align: center;
  height: auto;
  margin-right: 0;
  padding-left: 4px;
`;

type PreferredRouteDisplayProps = {
  aar: PreferentialArrivalRoute[];
  adr: PreferentialDepartureRoute[];
  adar: PreferentialDepartureArrivalRoute[];
  clearedPrefroute: (prefRoute: EdstPreferentialRoute) => void;
};

function computeRouteList(aar: any[], adr: any[], adar: any[]): EdstPreferentialRoute[] {
  let routes: EdstPreferentialRoute[] = adar.map(r => {
    return _.assign({}, r, { routeType: "adar" });
  });
  routes = routes
    .concat(
      adr.map(r => {
        // delete ret.route;
        return _.assign({}, r.amendment, { routeType: "adr" });
      })
    )
    .concat(
      aar.map(r => {
        return _.assign({}, r, { routeType: "aar" });
      })
    );
  return routes;
}

export const PreferredRouteDisplay: React.FC<PreferredRouteDisplayProps> = ({ aar, adr, adar, clearedPrefroute }) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const routes = computeRouteList(aar.slice(0), adr.slice(0), adar.slice(0));
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
                  {r.departure ?? ""}
                  {r.amendment ?? r.route}
                  {r.destination ?? ""}
                </Col>
              </PrefrouteRow>
            )
          );
        })}
      </PrefrouteContainer>
    </div>
  );
};
