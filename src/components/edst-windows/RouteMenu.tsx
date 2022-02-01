import React, {FunctionComponent, useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import {PreferredRouteDisplay} from "./PreferredRouteDisplay";
import {computeFrd, copy} from "../../lib";
import {EdstContext} from "../../contexts/contexts";
import VATSIM_LOGO from '../../css/images/VATSIM-social_icon.svg';
import {EdstButton} from "../resources/EdstButton";
import {Tooltips} from "../../tooltips";
import {EdstTooltip} from "../resources/EdstTooltip";
import {EdstWindowProps} from "../../interfaces";


export const RouteMenu: FunctionComponent<EdstWindowProps> = ({pos, asel, closeWindow}) => {
  const {
    edst_data,
    openMenu,
    trialPlan,
    amendEntry,
    startDrag,
    stopDrag,
    setInputFocused
  } = useContext(EdstContext);
  const [dep, setDep] = useState(asel?.window === 'dep');
  const [entry, setEntry] = useState(edst_data[asel.cid]);
  const current_route_fixes: Array<any> = entry?._route_data?.map(fix => fix.name) ?? [];
  const [focused, setFocused] = useState(false);
  const [display_raw_route, setDisplayRawRoute] = useState(false);
  const [route, setRoute] = useState(dep ? entry.route : entry._route?.replace(/^\.*/, ''));
  const [route_input, setRouteInput] = useState(dep ? entry.dep + route : route);
  const [trial_plan, setTrialPlan] = useState(!dep);
  const routes = (dep ? entry.routes ?? [] : []).concat(entry._aar_list?.filter(aar_data => current_route_fixes.includes(aar_data.tfix)));
  const [append, setAppend] = useState({append_oplus: false, append_star: false});
  const [frd, setFrd] = useState(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  const {append_oplus, append_star} = append;

  const ref = useRef(null);


  useEffect(() => {
    const entry = edst_data?.[asel?.cid];
    const dep = asel?.window === 'dep';
    const route = dep ? entry.route : entry._route?.replace(/^\.*/, '');
    setDep(dep);
    setTrialPlan(!dep);
    setEntry(entry);
    setRoute(route);
    setRouteInput(dep ? entry.dep + route : route);
    setFrd(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  }, [asel, edst_data]);

  const clearedReroute = (reroute_data: any) => {
    let plan_data;
    const dest = entry.dest;
    if (!reroute_data.aar) {
      plan_data = {route: reroute_data.route, route_data: reroute_data.route_data};
    } else {
      plan_data = {route: reroute_data.amended_route, route_fixes: reroute_data.amended_route_fixes};
    }
    if (plan_data.route.slice(-dest.length) === dest) {
      plan_data.route = plan_data.route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd + '..' : ''}${plan_data.route}`); // this only works with https or localhost
    copy(`${!dep ? frd : ''}${plan_data.route}`);
    if (trial_plan) {
      const msg = `AM ${entry.cid} RTE ${plan_data.route}${entry.dest}`;
      trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: msg
      });
    } else {
      amendEntry(entry.cid, plan_data);
    }
    closeWindow();
  };

  const clearedToFix = (cleared_fix_name: string) => {
    let {_route: new_route, _route_data, dest} = entry;
    if (new_route && _route_data) {
      let fix_names = _route_data.map(e => e.name);
      const index = fix_names?.indexOf(cleared_fix_name);
      for (let name of fix_names.slice(0, index + 1).reverse()) {
        if (new_route.includes(name)) {
          new_route = new_route.slice(new_route.indexOf(name) + name.length);
          if (!Number(new_route[0])) {
            new_route = `..${cleared_fix_name}` + new_route;
          } else {
            new_route = `..${cleared_fix_name}.${name}${new_route}`;
          }
          break;
        }
      }
      // new_route = `..${fix}` + new_route;
      if (new_route.slice(-dest.length) === dest) {
        new_route = new_route.slice(0, -dest.length);
      }
      // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
      copy(`${!dep ? frd : ''}${new_route}`.replace(/\.+$/, ''));
      const plan_data = {
        route: new_route,
        route_data: _route_data.slice(index),
        cleared_direct: {frd: (!dep ? frd : null), fix: cleared_fix_name}
      };
      if (trial_plan) {
        trialPlan({
          cid: entry.cid,
          callsign: entry.callsign,
          plan_data: plan_data,
          msg: `AM ${entry.cid} RTE ${!dep && plan_data.cleared_direct.frd}${new_route}${dest}`
        });
      } else {
        amendEntry(entry.cid, plan_data);
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
      const plan_data = {route: route};
      if (trial_plan) {
        trialPlan({
          cid: entry.cid,
          callsign: entry.callsign,
          plan_data: plan_data,
          msg: `AM ${entry.cid} RTE ${route}`
        });
      } else {
        amendEntry(entry.cid, plan_data);
      }
      closeWindow();
    }
  };

  const route_data = dep ? entry.route_data : entry._route_data;

  return (<div
      onMouseEnter={() => setFocused(true)}
      onMouseLeave={() => setFocused(false)}
      className="options-menu route no-select"
      ref={ref}
      id="route-menu"
      style={{left: pos.x, top: pos.y}}
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
            <EdstButton content="Trial Plan" selected={trial_plan} onMouseDown={() => setTrialPlan(true)}
                        title={Tooltips.route_menu_trial_plan}
            />
          </div>
          <EdstTooltip className="options-col center" title={Tooltips.route_menu_vatsim_logo}>
            <img src={VATSIM_LOGO} alt="vatsim-logo"
                 onMouseDown={() => setDisplayRawRoute(!display_raw_route)}
                 onContextMenu={(event) => event.preventDefault()}
            />
          </EdstTooltip>
          <div className={`options-col right ${!trial_plan ? 'selected' : ''}`}>
            <EdstButton content="Amend" selected={!trial_plan} onMouseDown={() => setTrialPlan(false)}
                        title={Tooltips.route_menu_amend}
            />
          </div>
        </div>
        <div className="options-row route-row">
          <div className="options-col">
            <div className="input">
              {!dep && <EdstTooltip className="ppos" title={Tooltips.route_menu_frd}
                                    onContextMenu={(event) => {
                                      event.preventDefault();
                                      copy(frd);
                                    }}>
                {frd}..
              </EdstTooltip>}
              <EdstTooltip className="route-input" title={Tooltips.route_menu_route_input}>
                <input
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  value={display_raw_route ? entry.flightplan.route : route_input}
                  onChange={(event) => !display_raw_route && handleInputChange(event)}
                  onKeyDownCapture={(event) => !display_raw_route && handleInputKeyDown(event)}
                />
              </EdstTooltip>
            </div>
          </div>
        </div>
        <div className="options-row route-row top-border">
          <EdstTooltip className="options-col hover button" disabled={true} title={Tooltips.route_menu_par}>
            <EdstButton disabled={true} className="tiny"/>
            Include PAR
          </EdstTooltip>
        </div>
        <div className="options-row route-row bottom-border">
          <EdstTooltip className="options-col hover button"
                       title={Tooltips.route_menu_append_star}
                       onMouseDown={() => setAppend({append_star: !append_star, append_oplus: false})}
          >
            <EdstButton disabled={true} className="tiny" selected={append_star}/>
            Append *
          </EdstTooltip>
          <EdstTooltip className="options-col hover button"
                       title={Tooltips.route_menu_append_oplus}
                       onMouseDown={() => setAppend({append_oplus: !append_oplus, append_star: false})}
          >
            <EdstButton disabled={true} className="tiny" selected={append_oplus}/>
            Append<span>&nbsp;⊕</span>
          </EdstTooltip>
        </div>
        <EdstTooltip className="options-row route-row underline"
                     content="Direct-To-Fix"
                     title={Tooltips.route_menu_direct_fix}
        />
        <div className="options-row">
          <div className="options-col display-route">
            {dep ? entry.dep + route : `./.${route}`}
          </div>
        </div>
        {[...Array(Math.min(route_data?.length ?? 0, 10)).keys()].map((i) => <div className="options-row"
                                                                                  key={`route-menu-row-${i}`}>
          {[...Array(((route_data?.length ?? 0) / 10 | 0) + 1).keys()].map((j) => {
            const fix_name = route_data?.[Number(i) + Number(j) * 10]?.name;
            return (fix_name && <EdstTooltip className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
                                             content={fix_name}
                                             onMouseDown={() => clearedToFix(fix_name)}
                                             title={Tooltips.route_menu_direct_fix}
            />);
          })}
        </div>)}
        {routes?.length > 0 &&
        <PreferredRouteDisplay routes={routes} clearedReroute={clearedReroute}/>}
        <div className="options-row bottom">
          <div className="options-col left">
            <EdstButton disabled={true} content="Flight Data" title={Tooltips.route_menu_flight_data}/>
            <EdstButton disabled={entry?.previous_route === undefined} content="Previous Route"
                        onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
                        title={Tooltips.route_menu_prev_route}
            />
            <EdstButton disabled={true} content="TFM Reroute Menu" title={Tooltips.route_menu_tfm_reroute}/>
          </div>
          <div className="options-col right">
            <EdstButton content="Exit" onMouseDown={closeWindow}/>
          </div>
        </div>
      </div>
    </div>
  );
};
