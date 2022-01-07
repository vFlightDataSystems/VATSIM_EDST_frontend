import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';
import PreferredRouteDisplay from "./PreferredRouteDisplay";

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    const dep = this.props.asel?.window === 'dep';
    const data = this.props.data;
    this.state = {
      dep: dep,
      trial: !dep,
      route: data._route,
      routes: dep ? data.routes : this.parseAar(data.aar_data),
      append_star: false,
      append_oplus: false,
      focused: false
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      const {trial} = this.state;
      const dep = this.props.asel?.window === 'dep';
      const data = this.props.data;
      this.setState({
        dep: dep,
        route: data._route,
        routes: dep ? data.routes : this.parseAar(data.aar_data),
        trial: !dep && trial,
        append_star: false,
        append_oplus: false,
        focused: false
      });
    }
  }

  parseAar = (aar_data) => {
    return aar_data?.map(aar => {
      return {route: aar.amendment.aar_amendment, dest: this.props.data.dest};
    });
  }

  clearedToFix = (fix) => {
    const {trial} = this.state;
    const {data} = this.props;
    let {_route: new_route, _route_data} = data;
    let route_fixes = _route_data.map(e => e.fix);
    const index = route_fixes.indexOf(fix);
    for (let f of route_fixes.slice(0, index + 1).reverse()) {
      if (new_route.includes(f)) {
        new_route = new_route.slice(new_route.indexOf(f) + f.length);
        break;
      }
    }
    new_route = `..${fix}` + new_route;
    const plan_data = {route: new_route, route_data: _route_data.slice(index)};
    if (trial) {
      this.props.trialPlan({
        cid: data.cid,
        callsign: data.callsign,
        plan_data: plan_data,
        msg: `AM ${data.cid} RTE ${new_route}`
      });
    } else {
      this.props.amendEntry(data.cid, plan_data);
    }
    this.props.closeWindow();
  }

  clearedReroute = (route) => {
    const {trial} = this.state;
    const {data} = this.props;
    const plan_data = {route: route.route, route_data: route.route_data};
    if (trial) {
      this.props.trialPlan({
        cid: data.cid,
        callsign: data.callsign,
        plan_data: plan_data,
        msg: `AM ${data.cid} RTE ${route.route}`
      });
    } else {
      this.props.amendEntry(data.cid, plan_data)
    }
    this.props.closeWindow();
  }

  render() {
    const {
      focused,
      trial,
      route,
      dep,
      append_star,
      append_oplus,
      routes
    } = this.state;
    const {pos, data} = this.props;
    const route_data = data?._route_data;

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
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row route-row"
            // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
          >
            <div className="options-col left"
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
            >
              <button className={`${trial ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({trial: true})}
                      disabled={dep}
              >
                Trial Plan
              </button>
            </div>
            <div className={`options-col right ${!trial ? 'selected' : ''}`}
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
            >
              <button className={`${!trial ? 'selected' : ''}`}
                      onMouseDown={() => this.setState({trial: false})}>
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
              ./{data?._route}
            </div>
          </div>
          {[...Array(Math.min(route_data?.length || 0, 10)).keys()].map(i => <div className="options-row"
                                                                                  key={`route-menu-row-${i}`}>
            {[...Array(((route_data?.length || 0) / 10 | 0) + 1).keys()].map(j => {
              const fix = route_data[i + j * 10]?.fix;
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
              <button disabled={data?.previous_route === undefined}
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
