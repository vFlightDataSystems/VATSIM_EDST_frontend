import React, {useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstPreferredRouteType} from "../../types";
import _ from "lodash";

type PreferredRouteDisplayProps = {
  aar: any[],
  adr: any[],
  adar: any[]
  dep: string,
  dest: string,
  clearedReroute: (rerouteData: any) => void
}

export function computeRouteList(aar: any[], adr: any[], adar: any[], dep: string, dest: string): EdstPreferredRouteType[] {
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
       clearedReroute
     }) => {
  const [eligibleOnly, setEligibleOnly] = useState(false);

  const routes = computeRouteList(aar.slice(0), adr.slice(0), adar.slice(0), dep, dest);

  return (<div>
      <div className="options-row route-row bottom-border"/>
      <div className="options-row route-row underline">
        Apply ATC Preferred Route
      </div>
      <div className="options-row route-row"
      >
        <div className="options-col prefroute-col"
        >
          <EdstButton content="ELIGIBLE" selected={eligibleOnly}
                      onMouseDown={() => setEligibleOnly(true)}
                      title={Tooltips.routeMenuPreferredEligible}
          />
          <EdstButton content="ALL" selected={!eligibleOnly}
                      onMouseDown={() => setEligibleOnly(false)}
                      title={Tooltips.routeMenuPreferredAll}
          />
        </div>
      </div>
      <div className="prefroute-container scroll-container prefroute-scroll-container">
        {Object.entries(routes).map(([i, r]: [string, EdstPreferredRouteType]) => {
          return r && (!eligibleOnly || r.eligible) && ((r.amendment?.length ?? 0) > 0) && (
            <div className="options-row prefroute-row" key={`route-menu-prefroute-row-${i}`}>
              <div className="options-col prefroute-col hover"
                   onMouseDown={() => clearedReroute(r)}
              >
                {r.dep ?? ''}{r.amendment}{r.dest ?? ''}
              </div>
            </div>);
        })}
      </div>
    </div>
  );
};
