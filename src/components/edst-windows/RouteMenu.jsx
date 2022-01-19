import {useContext, useEffect, useRef, useState} from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import PreferredRouteDisplay from "./PreferredRouteDisplay";
import {computeFrd, copy} from "../../lib";
import {EdstContext} from "../../contexts/contexts";

export function RouteMenu(props) {
  const {
    edst_data,
    openMenu,
    asel,
    trialPlan,
    amendEntry,
    startDrag,
    stopDrag,
    setInputFocused
  } = useContext(EdstContext);
  const dep = asel?.window === 'dep';
  const entry = edst_data?.[asel?.cid]
  const current_route_fixes = entry?._route_data.map(fix => fix.name);

  const [focused, setFocused] = useState(false);
  const [route, setRoute] = useState(entry._route?.replace(/^\.*/, ''));
  const [trial_plan, setTrialPlan] = useState(!dep);
  const routes = (dep ? entry.routes : []).concat(entry._aar_list?.filter(aar_data => current_route_fixes.includes(aar_data.tfix)));
  const [append, setAppend] = useState({append_oplus: false, append_star: false});
  const [frd, setFrd] = useState(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  const {append_oplus, append_star} = append;

  const ref = useRef(null);
  const {pos} = props;

  useEffect(() => {
    setRoute(entry._route.replace(/^\.*/, ''));
    setFrd(entry.reference_fix ? computeFrd(entry.reference_fix) : 'XXX000000');
  }, [entry])

  const clearedReroute = (reroute_data) => {
    let plan_data;
    const dest = entry.dest
    if (!reroute_data.aar) {
      plan_data = {route: reroute_data.route, route_data: reroute_data.route_data};
    } else {
      plan_data = {route: reroute_data.amended_route, route_fixes: reroute_data.amended_route_fixes};
    }
    if (plan_data.route.slice(-dest.length) === dest) {
      plan_data.route = plan_data.route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd + '..' : ''}${plan_data.route}`); // this only works with https or localhost
    copy(`${!dep ? frd + '..' : ''}${plan_data.route}`);
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
    props.closeWindow();
  }

  const clearedToFix = (fix) => {
    let {_route: new_route, _route_data, dest} = entry;
    let route_fixes = _route_data.map(e => e.name);
    const index = route_fixes.indexOf(fix);
    for (let f of route_fixes.slice(0, index + 1).reverse()) {
      if (new_route.includes(f)) {
        new_route = new_route.slice(new_route.indexOf(f) + f.length);
        break;
      }
    }
    new_route = `..${fix}` + new_route;
    if (new_route.slice(-dest.length) === dest) {
      new_route = new_route.slice(0, -dest.length);
    }
    // navigator.clipboard.writeText(`${!dep ? frd : ''}${new_route}`); // this only works with https or localhost
    copy(`${!dep ? frd : ''}${new_route}`.replace(/\.+$/, ''));
    const plan_data = {route: new_route, route_data: _route_data.slice(index)};
    if (trial_plan) {
      trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: `AM ${entry.cid} RTE ${new_route}`
      });
    } else {
      amendEntry(entry.cid, plan_data);
    }
    props.closeWindow();
  }

  const handleInputChange = (event) => {
    event.preventDefault();
    setRoute(event.target.value.toUpperCase());
  }

  const handleInputKeyDown = (event) => {
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
      props.closeWindow();
    }
  }

  const route_data = entry?._route_data;

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
        <div className="options-row route-row"
          // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
        >
          <div className="options-col left"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <button className={`${trial_plan ? 'selected' : ''}`}
                    onMouseDown={() => setTrialPlan(true)}
                    disabled={dep}
            >
              Trial Plan
            </button>
          </div>
          <div className={`options-col right ${!trial_plan ? 'selected' : ''}`}
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <button className={`${!trial_plan ? 'selected' : ''}`}
                    onMouseDown={() => setTrialPlan(false)}>
              Amend
            </button>
          </div>
        </div>
        <div className="options-row route-row"
          // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
        >
          <div className="options-col">
            <div className="input">
              {!dep && <span className="ppos"
                             onContextMenu={(event) => {
                               event.preventDefault();
                               copy(frd);
                             }}>
                  {frd}..
                </span>}
              <span className="route-input">
                <input
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  value={route}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                />
              </span>
            </div>
          </div>
        </div>
        <div className="options-row route-row top-border">
          <div className="options-col hover button" disabled={true}>
            <button className="tiny" disabled={true}/>
            Include PAR
          </div>
        </div>
        <div className="options-row route-row bottom-border">
          <div className="options-col hover button"
               onMouseDown={() => setAppend({append_star: !append_star, append_oplus: false})}
          >
            <button className={`tiny ${append_star ? 'selected' : ''}`} disabled={true}/>
            Append *
          </div>
          <div className="options-col hover button"
               onMouseDown={() => setAppend({append_oplus: !append_oplus, append_star: false})}
          >
            <button className={`tiny ${append_oplus ? 'selected' : ''}`} disabled={true}/>
            Append<span>&nbsp;⊕</span>
          </div>
        </div>
        <div className="options-row route-row underline">
          Direct-To-Fix
        </div>
        <div className="options-row">
          <div className="options-col display-route">
            {dep ? entry.dep : './'}{entry?._route}
          </div>
        </div>
        {[...Array(Math.min(route_data?.length || 0, 10)).keys()].map(i => <div className="options-row"
                                                                                key={`route-menu-row-${i}`}>
          {[...Array(((route_data?.length || 0) / 10 | 0) + 1).keys()].map(j => {
            const fix_name = route_data[i + j * 10]?.name;
            return (fix_name && <div className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
                                     onMouseDown={() => clearedToFix(fix_name)}>
              {fix_name}
            </div>);
          })
          }
        </div>)}
        {routes?.length > 0 &&
        <PreferredRouteDisplay routes={routes} clearedReroute={clearedReroute}/>}
        <div className="options-row bottom">
          <div className="options-col left">
            <button>
              Flight Data
            </button>
            <button disabled={entry?.previous_route === undefined}
                    onMouseDown={() => openMenu(ref.current, 'prev-route-menu', true)}
            >
              Previous Route
            </button>
            <button disabled={true}>
              TFM Reroute Menu
            </button>
          </div>
          <div className="options-col right">
            <button onMouseDown={props.closeWindow}>
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
