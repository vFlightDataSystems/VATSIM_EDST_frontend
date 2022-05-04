import React, {useState} from 'react';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstPreferredRouteType} from "../../types";
import _ from "lodash";
import styled from "styled-components";
import {OptionsBodyCol, OptionsBodyRow, ScrollContainer, UnderlineRow} from "../../styles/optionMenuStyles";

const PrefrouteContainer = styled(ScrollContainer)`
  border: 2px solid #414141;
  margin: 6px;
  min-height: 40px;
`;

const Row = styled(OptionsBodyRow)`padding: 4px 0;`;

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
  aar: any[],
  adr: any[],
  adar: any[]
  dep: string,
  dest: string,
  clearedPrefroute: (rerouteData: Record<string, any>) => void
}

function computeRouteList(aar: any[], adr: any[], adar: any[], dep: string, dest: string): EdstPreferredRouteType[] {
  let routes: EdstPreferredRouteType[] = adar.map(r => {
    return _.assign({}, r, {dep: dep, dest: dest, routeType: 'adar'});
  });
  routes = routes.concat(adr.map(r => {
    let ret = _.assign({}, r.amendment, {dep: dep, routeType: 'adr'});
    ret.amendment = r.amendment.adr_amendment;
    // delete ret.route;
    return ret;
  })).concat(aar.map(r => {
    let ret = _.assign({}, r, {dest: dest, amendment: r.aar_amendment_route_string, routeType: 'aar'});
    delete ret.route;
    return ret;
  }));
  return routes;
}

export const PreferredRouteDisplay: React.FC<PreferredRouteDisplayProps>
  = ({
       aar,
       adr,
       adar,
       dep,
       dest,
       clearedPrefroute
     }) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const routes = computeRouteList(aar.slice(0), adr.slice(0), adar.slice(0), dep, dest);
  const eligibleRoutes = routes.filter(r => r.eligible);

  return (<div>
      <Row bottomBorder={true}/>
      <UnderlineRow as={Row}>
        Apply ATC Preferred Route
      </UnderlineRow>
      <Row>
        <Col>
          <EdstButton content="ELIGIBLE" selected={eligibleOnly}
                      margin="0 6px"
                      width={85}
                      onMouseDown={() => setEligibleOnly(true)}
                      title={Tooltips.routeMenuPreferredEligible}
          />
          <EdstButton content="ALL" selected={!eligibleOnly} width={75}
                      onMouseDown={() => setEligibleOnly(false)}
                      title={Tooltips.routeMenuPreferredAll}
          />
        </Col>
      </Row>
      <PrefrouteContainer maxHeight={100}>
        {eligibleOnly && eligibleRoutes.length === 0 &&
            <PrefrouteRow key={`route-menu-prefroute-row-no-eligible-avail`}>
                No Eligible APRs: Select ALL to display Ineligible APRs
            </PrefrouteRow>}
        {Object.entries(routes).map(([i, r]: [string, EdstPreferredRouteType]) => {
          return r && (!eligibleOnly || r.eligible) && ((r.amendment?.length ?? 0) > 0) && (
            <PrefrouteRow key={`route-menu-prefroute-row-${i}`}>
              <Col hover={true} onMouseDown={() => clearedPrefroute(r)}>
                {r.dep ?? ''}{r.amendment}{r.dest ?? ''}
              </Col>
            </PrefrouteRow>);
        })}
      </PrefrouteContainer>
    </div>
  );
};
