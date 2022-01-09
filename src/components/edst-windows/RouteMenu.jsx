import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import PreferredRouteDisplay from "./PreferredRouteDisplay";

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    const entry = this.props.entry;
    const dep = this.props.asel?.window === 'dep';
    this.state = {
      dep: dep,
      trial_plan: !dep,
      route: entry._route,
      routes: [],
      append_star: false,
      append_oplus: false,
      focused: false
    };
    this.routeMenuRef = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !Object.is(nextProps, this.props) || !Object.is(nextState, this.state);
  }

  componentDidMount() {
    const entry = this.props.entry;
    const dep = this.props.asel?.window === 'dep';
    const current_route_fixes = entry._route_data.map(fix => fix.name);
    this.setState({routes: (dep ? entry.routes : []).concat(entry._aar_list?.filter(aar_data => current_route_fixes.includes(aar_data.tfix)))});
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.entry !== prevProps.entry && this.props.entry) {
      const {trial_plan} = this.state;
      const dep = this.props.asel?.window === 'dep';
      const entry = this.props.entry;
      const current_route_fixes = entry._route_data.map(fix => fix.name);
      this.setState({
        dep: dep,
        route: entry._route,
        routes: (dep ? entry.routes : []).concat(entry._aar_list?.filter(aar_data => current_route_fixes.includes(aar_data.tfix)).concat()),
        trial_plan: !dep && trial_plan,
        append_star: false,
        append_oplus: false,
        focused: false
      });
    }
  }

  clearedReroute = (reroute_data) => {
    const {trial_plan} = this.state;
    const {entry} = this.props;
    let plan_data;
    if (!reroute_data.aar) {
      plan_data = {route: reroute_data.route, route_data: reroute_data.route_data};
    } else {
      plan_data = {route: reroute_data.amended_route, route_fixes: reroute_data.amended_route_fixes};
    }
    if (trial_plan) {
      const msg = `AM ${entry.cid} RTE ${plan_data.route}${entry.dest}`
      this.props.trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: msg
      });
    } else {
      this.props.amendEntry(entry.cid, plan_data)
    }
    this.props.closeWindow();
  }

  clearedToFix = (fix) => {
    const {trial_plan} = this.state;
    const {entry} = this.props;
    let {_route: new_route, _route_data} = entry;
    let route_fixes = _route_data.map(e => e.name);
    const index = route_fixes.indexOf(fix);
    for (let f of route_fixes.slice(0, index + 1).reverse()) {
      if (new_route.includes(f)) {
        new_route = new_route.slice(new_route.indexOf(f) + f.length);
        break;
      }
    }
    new_route = `..${fix}` + new_route;
    const plan_data = {route: new_route, route_data: _route_data.slice(index)};
    if (trial_plan) {
      this.props.trialPlan({
        cid: entry.cid,
        callsign: entry.callsign,
        plan_data: plan_data,
        msg: `AM ${entry.cid} RTE ${new_route}`
      });
    } else {
      this.props.amendEntry(entry.cid, plan_data);
    }
    this.props.closeWindow();
  }

  render() {
    const {
      focused,
      trial_plan,
      route,
      dep,
      append_star,
      append_oplus,
      routes
    } = this.state;
    const {pos, entry} = this.props;
    const route_data = entry?._route_data;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu route no-select"
        ref={this.routeMenuRef}
        id="route-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.routeMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Route Menu
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {entry?.callsign} {entry?.type}/{entry?.equipment}
          </div>
          <div className="options-row route-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <div className="options-col left"
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
            >
              <button className={`${trial_plan ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({trial_plan: true})}
                      disabled={dep}
              >
                Trial Plan
              </button>
            </div>
            <div className={`options-col right ${!trial_plan ? 'selected' : ''}`}
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
            >
              <button className={`${!trial_plan ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({trial_plan: false})}>
                Amend
              </button>
            </div>
          </div>
          <div className="options-row route-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <div className="options-col">
              <div className="input">
                {/*<div className="ppos" disabled={true}>*/}
                {/*  XXX000000..*/}
                {/*</div>*/}
                <input value={route} onChange={(e) => this.setState({route: e.target.value})}/>
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
                 onMouseDown={() => this.setState({append_star: !append_star, append_oplus: false})}
            >
              <button className={`tiny ${append_star ? 'selected' : ''}`} disabled={true}/>
              Append *
            </div>
            <div className="options-col hover button"
                 onMouseDown={() => this.setState({append_oplus: !append_oplus, append_star: false})}
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
              ./{entry?._route}
            </div>
          </div>
          {[...Array(Math.min(route_data?.length || 0, 10)).keys()].map(i => <div className="options-row"
                                                                                  key={`route-menu-row-${i}`}>
            {[...Array(((route_data?.length || 0) / 10 | 0) + 1).keys()].map(j => {
              const fix = route_data[i + j * 10]?.name;
              return (fix && <div className="options-col dct-col hover" key={`route-menu-col-${i}-${j}`}
                                  onMouseDown={() => this.clearedToFix(fix)}>
                {fix}
              </div>);
            })
            }
          </div>)}
          {routes?.length > 0 &&
          <PreferredRouteDisplay routes={routes} clearedReroute={this.clearedReroute}/>}
          <div className="options-row bottom">
            <div className="options-col left">
              <button>
                Flight Data
              </button>
              <button disabled={entry?.previous_route === undefined}
                      onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'prev-route-menu', true)}
              >
                Previous Route
              </button>
              <button disabled={true}>
                TFM Reroute Menu
              </button>
            </div>
            <div className="options-col right">
              <button onMouseDown={this.props.closeWindow}>
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
