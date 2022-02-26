import React, {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {PreferredRouteDisplay} from "./PreferredRouteDisplay";
import {computeFrd, copy, removeDestFromRouteString} from "../../lib";
import {EdstContext} from "../../contexts/contexts";
import VATSIM_LOGO from '../../css/images/VATSIM-social_icon.svg';
import SKYVECTOR_LOGO from '../../css/images/glob_bright.png';
import FLIGHTAWARE_LOGO from '../../css/images/FA_1.png';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {useAppDispatch, useAppSelector} from "../../redux/hooks";
import {windowEnum} from "../../enums";
import {aselEntrySelector} from "../../redux/slices/entriesSlice";
import {
  aselSelector,
  AselType,
  closeWindow,
  setInputFocused,
  windowPositionSelector
} from "../../redux/slices/appSlice";
import {addTrialPlanThunk, openWindowThunk} from "../../redux/thunks/thunks";
import {LocalEdstEntryType} from "../../types";
import {amendEntryThunk} from "../../redux/thunks/entriesThunks";

export const RouteMenu: React.FC = () => {
  const {
    startDrag,
    stopDrag
  } = useContext(EdstContext);
  const dispatch = useAppDispatch();
  const pos = useAppSelector(windowPositionSelector(windowEnum.routeMenu));
  const asel = useAppSelector(aselSelector) as AselType;
  const entry = useAppSelector(aselEntrySelector) as LocalEdstEntryType;

  const currentRouteFixes: string[] = entry?._route_data?.map(fix => fix.name) ?? [];
  const [focused, setFocused] = useState(false);
  const [displayRawRoute, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState<string>(removeDestFromRouteString((asel.window === windowEnum.dep ? entry.route : entry._route?.replace(/^\.*/, '') ?? ''), entry.dest));
  const [routeInput, setRouteInput] = useState<string>(asel.window === windowEnum.dep ? entry.dep + route + entry.dest : route + entry.dest);
  const [trialPlan, setTrialPlan] = useState(!(asel.window === windowEnum.dep));
  const routes = (asel.window === windowEnum.dep ? entry.routes ?? [] : []).concat(entry._aar_list?.filter(aar_data => currentRouteFixes.includes(aar_data.tfix)));
  const [append, setAppend] = useState({appendOplus: false, appendStar: false});
  const [frd, setFrd] = useState(entry.referenceFix ? computeFrd(entry.referenceFix) : 'XXX000000');
  const {appendOplus, appendStar} = append;

  const ref = useRef(null);

  useEffect(() => {
    const dep = asel.window === windowEnum.dep;
    let route = dep ? entry.route : entry._route?.replace(/^\.*/, '');
    route = removeDestFromRouteString(route ?? '', entry.dest);
    if (dep) {
      setTrialPlan(false);
    }
    setRoute(route);
    setRouteInput(dep ? entry.dep + route + entry.dest : route + entry.dest);
    setFrd(entry.referenceFix ? computeFrd(entry.referenceFix) : 'XXX000000');
  }, [asel.window, entry._route, entry.dep, entry.dest, entry.referenceFix, entry.route]);

  const clearedReroute = (rerouteData: any) => {
    let planData;
    const dest = entry.dest;
    if (!rerouteData.aar) {
      planData = {route: rerouteData.route, route_data: rerouteData.route_data};
    } else {
      planData = {route: rerouteData.amended_route, route_fixes: rerouteData.amended_route_fixes};
    }
    planData.route = removeDestFromRouteString(planData.route.slice(0), dest);
    // navigator.clipboard.writeText(`${!dep ? frd + '..' : ''}${plan_data.route}`); // this only works with https or
    // localhost
    copy(`${!(asel.window === windowEnum.dep) ? frd : ''}${planData.route}`);
    if (planData) {
      const msg = `AM ${entry.cid} RTE ${planData.route}${entry.dest}`;
      if (!trialPlan) {
        dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
      } else {
        dispatch(addTrialPlanThunk({
          cid: entry.cid,
          callsign: entry.callsign,
          planData: planData,
          msg: msg
        }));
      }
    }
    dispatch(closeWindow(windowEnum.routeMenu));
  };

  const clearedToFix = (clearedFixName: string) => {
    let {_route: newRoute, _route_data: routeData, dest} = entry;
    if (newRoute && routeData) {
      let fixNames = routeData.map((e: { name: string }) => e.name);
      const index = fixNames?.indexOf(clearedFixName);
      for (let name of fixNames.slice(0, index + 1).reverse()) {
        if (newRoute.includes(name)) {
          newRoute = newRoute.slice(newRoute.indexOf(name) + name.length);
          if (!Number(newRoute[0])) {
            newRoute = `..${clearedFixName}` + newRoute;
          } else {
            newRoute = `..${clearedFixName}.${name}${newRoute}`;
          }
          break;
        }
      }
      // new_route = `..${fix}` + new_route;
      newRoute = removeDestFromRouteString(newRoute.slice(0), dest);
      // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
      copy(`${!(asel.window === windowEnum.dep) ? frd : ''}${newRoute}`.replace(/\.+$/, ''));
      const planData = {
        route: newRoute,
        route_data: routeData.slice(index),
        cleared_direct: {frd: (!(asel.window === windowEnum.dep) ? frd : null), fix: clearedFixName}
      };
      if (planData) {
        if (!trialPlan) {
          dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
        } else {
          dispatch(addTrialPlanThunk({
            cid: entry.cid,
            callsign: entry.callsign,
            planData: planData,
            msg: `AM ${entry.cid} RTE ${!(asel.window === windowEnum.dep) && planData.cleared_direct.frd}${newRoute}${dest}`
          }));
        }
      }
      dispatch(closeWindow(windowEnum.routeMenu));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setRouteInput(event.target.value.toUpperCase());
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      copy(`${!(asel.window === windowEnum.dep) ? frd : ''}${route}`.replace(/\.+$/, ''));
      const planData = {route: route};
      if (trialPlan) {
        dispatch(addTrialPlanThunk({
          cid: entry.cid,
          callsign: entry.callsign,
          planData: planData,
          msg: `AM ${entry.cid} RTE ${route}`
        }));
      } else {
        dispatch(amendEntryThunk({cid: entry.cid, planData: planData}));
      }
      dispatch(closeWindow(windowEnum.routeMenu));
    }
  };

  const routeData = (asel.window === windowEnum.dep) ? entry.route_data : entry._route_data;

  return pos && (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu route no-select"
      ref={ref}
      id="route-menu"
      style={{left: pos.x, top: pos.y}}
    >
      <div className={`options-menu-header ${focused ? 'focused' : ''}`}
           onMouseDown={(event) => startDrag(event, ref, windowEnum.routeMenu)}
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
            <EdstButton content="Trial Plan" selected={trialPlan} onMouseDown={() => setTrialPlan(true)}
                        title={Tooltips.routeMenuPlanData}
                        disabled={asel.window === windowEnum.dep}
            />
          </div>
          <EdstTooltip className="options-col img"
            // title={Tooltips.route_menu_skyvector}
          >
            <a href={`https://skyvector.com/?fpl=${entry.dep} ${entry.flightplan.route} ${entry.dest}`}
               target="_blank" rel="noreferrer">
              <img src={SKYVECTOR_LOGO} alt="skyvector-logo"/>
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
              <img src={FLIGHTAWARE_LOGO} alt="flightaware-logo"/>
            </a>
          </EdstTooltip>
          <div className={`options-col right ${!trialPlan ? 'selected' : ''}`}>
            <EdstButton content="Amend" selected={!trialPlan} onMouseDown={() => setTrialPlan(false)}
                        title={Tooltips.routeMenuAmend}
            />
          </div>
        </div>
        <div className="options-row route-row">
          <div className="options-col">
            <div className="input">
              {!(asel.window === windowEnum.dep) && <EdstTooltip className="ppos" title={Tooltips.routeMenuFrd}
                                                                 onContextMenu={(event) => {
                                                                   event.preventDefault();
                                                                   copy(frd);
                                                                 }}>
                {frd}..
              </EdstTooltip>}
              <EdstTooltip className="route-input" title={Tooltips.routeMenuRouteInput}>
                <input
                  onFocus={() => dispatch(setInputFocused(true))}
                  onBlur={() => dispatch(setInputFocused(false))}
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
            <EdstButton disabled={true} className="tiny"/>
            Include PAR
          </EdstTooltip>
        </div>
        <div className="options-row route-row bottom-border">
          <EdstTooltip className="options-col hover button"
                       title={Tooltips.routeMenuAppendStar}
                       onMouseDown={() => setAppend({appendStar: !appendStar, appendOplus: false})}
          >
            <EdstButton disabled={true} className="tiny" selected={appendStar}/>
            Append *
          </EdstTooltip>
          <EdstTooltip className="options-col hover button"
                       title={Tooltips.routeMenuAppendOplus}
                       onMouseDown={() => setAppend({appendOplus: !appendOplus, appendStar: false})}
          >
            <EdstButton disabled={true} className="tiny" selected={appendOplus}/>
            Append<span>&nbsp;⊕</span>
          </EdstTooltip>
        </div>
        <EdstTooltip className="options-row route-row underline"
                     content="Direct-To-Fix"
                     title={Tooltips.routeMenuDirectFix}
        />
        <div className="options-row">
          <div className="options-col display-route">
            {(asel.window === windowEnum.dep) ? entry.dep + route + entry.dest : `./.${route}${entry.dest}`}
          </div>
        </div>
        {[...Array(Math.min(routeData?.length ?? 0, 10)).keys()].map((i) => <div className="options-row"
                                                                                 key={`route-menu-row-${i}`}>
          {[...Array(((routeData?.length ?? 0)/10 | 0) + 1).keys()].map((j) => {
            const fixName = routeData?.[Number(i) + Number(j)*10]?.name;
            return (fixName && <EdstTooltip className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
                                            content={fixName}
                                            onMouseDown={() => clearedToFix(fixName)}
                                            title={Tooltips.routeMenuDirectFix}
            />);
          })}
        </div>)}
        {routes?.length > 0 &&
        <PreferredRouteDisplay routes={routes} clearedReroute={clearedReroute}/>}
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton disabled={true} content="Flight Data" title={Tooltips.routeMenuFlightData}/>
            <EdstButton disabled={entry?.previous_route === undefined} content="Previous Route"
                        onMouseDown={() => {
                          dispatch(openWindowThunk(windowEnum.prevRouteMenu, ref.current, windowEnum.routeMenu, true));
                          dispatch(closeWindow(windowEnum.routeMenu));
                        }}
                        title={Tooltips.routeMenuPrevRoute}
            />
            <EdstButton disabled={true} content="TFM Reroute Menu" title={Tooltips.routeMenuTfmReroute}/>
          </div>
          <div className="options-col right">
            <EdstButton className="exit-button" content="Exit" onMouseDown={() => dispatch(closeWindow(windowEnum.routeMenu))}/>
          </div>
        </div>
      </div>
    </div>
  );
};
