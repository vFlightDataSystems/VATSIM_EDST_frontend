import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {PreferredRouteDisplay} from "./PreferredRouteDisplay";
import {computeFrd, copy} from "../../lib";
import {EdstContext} from "../../contexts/contexts";
import VATSIM_LOGO from '../../css/images/VATSIM-social_icon.svg';
import SKYVECTOR_LOGO from '../../css/images/glob_bright.png';
import FLIGHTAWARE_LOGO from '../../css/images/FA_1.png';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {EdstWindowType} from "../../types";
import {useAppSelector} from "../../redux/hooks";

export const RouteMenu: React.FC<EdstWindowType> = ({pos, asel, closeWindow}) => {
  const {
    openMenu,
    trialPlan,
    amendEntry,
    startDrag,
    stopDrag,
    setInputFocused
  } = useContext(EdstContext);
  const entry = useAppSelector(state => state.entries[asel.cid]);
  const [dep, setDep] = useState(asel?.window === 'dep');
  const currentRouteFixes: Array<any> = entry?._route_data?.map(fix => fix.name) ?? [];
  const [focused, setFocused] = useState(false);
  const [displayRawRoute, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState(dep ? entry.route : entry._route?.replace(/^\.*/, ''));
  const [routeInput, setRouteInput] = useState(dep ? entry.dep + route : route);
  const [planData, setTrialPlan] = useState(!dep);
  const routes = (dep ? entry.routes ?? [] : []).concat(entry._aar_list?.filter(aar_data => currentRouteFixes.includes(aar_data.tfix)));
  const [append, setAppend] = useState({appendOplus: false, appendStar: false});
  const [frd, setFrd] = useState(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  const {appendOplus, appendStar} = append;

  const ref = useRef(null);


  useEffect(() => {
    const dep = asel.window === 'dep';
    const route = dep ? entry.route : entry._route?.replace(/^\.*/, '');
    setDep(dep);
    setTrialPlan(!dep);
    setRoute(route);
    setRouteInput(dep ? entry.dep + route : route);
    setFrd(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  }, [asel.window, entry._route, entry.dep, entry.reference_fix, entry.route]);

  const clearedReroute = (reroute_data: any) => {
    let planData;
    const dest = entry.dest;
    if (!reroute_data.aar) {
      planData = {route: reroute_data.route, route_data: reroute_data.route_data};
    } else {
      planData = {route: reroute_data.amended_route, route_fixes: reroute_data.amended_route_fixes};
    }
    if (planData.route.slice(-dest.length) === dest) {
      planData.route = planData.route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd + '..' : ''}${plan_data.route}`); // this only works with https or localhost
    copy(`${!dep ? frd : ''}${planData.route}`);
    if (planData) {
      const msg = `AM ${entry.cid} RTE ${planData.route}${entry.dest}`;
      trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: planData,
        msg: msg
      });
    } else {
      amendEntry(entry.cid, planData);
    }
    closeWindow();
  };

  const clearedToFix = (cleared_fix_name: string) => {
    let {_route: newRoute, _route_data: routeData, dest} = entry;
    if (newRoute && routeData) {
      let fixNames = routeData.map((e: { name: string }) => e.name);
      const index = fixNames?.indexOf(cleared_fix_name);
      for (let name of fixNames.slice(0, index + 1).reverse()) {
        if (newRoute.includes(name)) {
          newRoute = newRoute.slice(newRoute.indexOf(name) + name.length);
          if (!Number(newRoute[0])) {
            newRoute = `..${cleared_fix_name}` + newRoute;
          } else {
            newRoute = `..${cleared_fix_name}.${name}${newRoute}`;
          }
          break;
        }
      }
      // new_route = `..${fix}` + new_route;
      if (newRoute.slice(-dest.length) === dest) {
        newRoute = newRoute.slice(0, -dest.length);
      }
      // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
      copy(`${!dep ? frd : ''}${newRoute}`.replace(/\.+$/, ''));
      const planData = {
        route: newRoute,
        route_data: routeData.slice(index),
        cleared_direct: {frd: (!dep ? frd : null), fix: cleared_fix_name}
      };
      if (planData) {
        trialPlan({
          cid: entry.cid,
          callsign: entry.callsign,
          plan_data: planData,
          msg: `AM ${entry.cid} RTE ${!dep && planData.cleared_direct.frd}${newRoute}${dest}`
        });
      } else {
        amendEntry(entry.cid, planData);
      }
    }
    closeWindow();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setRouteInput(event.target.value.toUpperCase());
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      copy(`${!dep ? frd : ''}${route}`.replace(/\.+$/, ''));
      const planData = {route: route};
      if (planData) {
        trialPlan({
          cid: entry.cid,
          callsign: entry.callsign,
          plan_data: planData,
          msg: `AM ${entry.cid} RTE ${route}`
        });
      } else {
        amendEntry(entry.cid, planData);
      }
      closeWindow();
    }
  };

  const routeData = dep ? entry.route_data : entry._route_data;

  return (<div
    onMouseEnter={() => setFocused(true)}
    onMouseLeave={() => setFocused(false)}
    className="options-menu route no-select"
    ref={ref}
    id="route-menu"
    style={{ left: pos.x, top: pos.y }}
  >
    <div className={`options-menu-header ${focused ? 'focused' : ''}`}
      onMouseDown={(event) => startDrag(event, ref)}
      onMouseUp={(event) => stopDrag(event)}
    >
      Route Menu
    </div>
    <div className="options-body">
      <div className="options-row fid">
        {entry.callsign} {entry.type}/{entry.equipment}
      </div>
      <div className="options-row route-row">
        <div className="options-col">
          <EdstButton content="Trial Plan" selected={planData} onMouseDown={() => setTrialPlan(true)}
            title={Tooltips.routeMenuPlanData}
          />
        </div>
        <EdstTooltip className="options-col img"
        // title={Tooltips.route_menu_skyvector}
        >
          <a href={`https://skyvector.com/?fpl=${entry.dep} ${entry.flightplan.route} ${entry.dest}`}
            target="_blank" rel="noreferrer">
            <img src={SKYVECTOR_LOGO} alt="skyvector-logo" />
          </a>
        </EdstTooltip>
        <EdstTooltip className="options-col img" title={Tooltips.routeMenuVatsimLogo}>
          <img src={VATSIM_LOGO} alt="vatsim-logo"
            onMouseDown={() => setDisplayRawRoute(!displayRawRoute)}
            onContextMenu={(event) => event.preventDefault()}
          />
        </EdstTooltip>
        <EdstTooltip className="options-col img"
        // title={Tooltips.route_menu_flightaware}
        >
          <a href={`https://flightaware.com/analysis/route.rvt?origin=${entry.dep}&destination=${entry.dest}`}
            target="_blank" rel="noreferrer">
            <img src={FLIGHTAWARE_LOGO} alt="flightaware-logo" />
          </a>
        </EdstTooltip>
        <div className={`options-col right ${!planData ? 'selected' : ''}`}>
          <EdstButton content="Amend" selected={!planData} onMouseDown={() => setTrialPlan(false)}
            title={Tooltips.routeMenuAmend}
          />
        </div>
      </div>
      <div className="options-row route-row">
        <div className="options-col">
          <div className="input">
            {!dep && <EdstTooltip className="ppos" title={Tooltips.routeMenuFrd}
              onContextMenu={(event) => {
                event.preventDefault();
                copy(frd);
              }}>
              {frd}..
            </EdstTooltip>}
            <EdstTooltip className="route-input" title={Tooltips.routeMenuRouteInput}>
              <input
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                value={displayRawRoute ? entry.flightplan.route : routeInput}
                onChange={(event) => !displayRawRoute && handleInputChange(event)}
                onKeyDownCapture={(event) => !displayRawRoute && handleInputKeyDown(event)}
              />
            </EdstTooltip>
          </div>
        </div>
      </div>
      <div className="options-row route-row top-border">
        <EdstTooltip className="options-col hover button" disabled={true} title={Tooltips.routeMenuPar}>
          <EdstButton disabled={true} className="tiny" />
          Include PAR
        </EdstTooltip>
      </div>
      <div className="options-row route-row bottom-border">
        <EdstTooltip className="options-col hover button"
          title={Tooltips.routeMenuAppendStar}
          onMouseDown={() => setAppend({ appendStar: !appendStar, appendOplus: false })}
        >
          <EdstButton disabled={true} className="tiny" selected={appendStar} />
          Append *
        </EdstTooltip>
        <EdstTooltip className="options-col hover button"
          title={Tooltips.routeMenuAppendOplus}
          onMouseDown={() => setAppend({ appendOplus: !appendOplus, appendStar: false })}
        >
          <EdstButton disabled={true} className="tiny" selected={appendOplus} />
          Append<span>&nbsp;⊕</span>
        </EdstTooltip>
      </div>
      <EdstTooltip className="options-row route-row underline"
        content="Direct-To-Fix"
        title={Tooltips.routeMenuDirectFix}
      />
      <div className="options-row">
        <div className="options-col display-route">
          {dep ? entry.dep + route : `./.${route}`}
        </div>
      </div>
      {[...Array(Math.min(routeData?.length ?? 0, 10)).keys()].map((i) => <div className="options-row"
        key={`route-menu-row-${i}`}>
        {[...Array(((routeData?.length ?? 0) / 10 | 0) + 1).keys()].map((j) => {
          const fixName = routeData?.[Number(i) + Number(j) * 10]?.name;
          return (fixName && <EdstTooltip className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
            content={fixName}
            onMouseDown={() => clearedToFix(fixName)}
            title={Tooltips.routeMenuDirectFix}
          />);
        })}
      </div>)}
      {routes?.length > 0 &&
        <PreferredRouteDisplay routes={routes} clearedReroute={clearedReroute} />}
      <div className="options-row bottom">
        <div className="options-col left">
          <EdstButton disabled={true} content="Flight Data" title={Tooltips.routeMenuFlightData} />
          <EdstButton disabled={entry?.previous_route === undefined} content="Previous Route"
            onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
            title={Tooltips.routeMenuPrevRoute}
          />
          <EdstButton disabled={true} content="TFM Reroute Menu" title={Tooltips.routeMenuTfmReroute} />
        </div>
        <div className="options-col right">
          <EdstButton content="Exit" onMouseDown={closeWindow} />
        </div>
      </div>
    </div>
  </div>
  );
};
