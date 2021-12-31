import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    const dep = this.props.asel?.window === 'dep';
    this.state = {
      dep: dep,
      trial: !dep,
      route: this.props.data?.[dep ? 'route' : 'remaining_route'] || '',
      prefroute_eligible_only: false,
      append_star: false,
      append_oplus: false,
      focused: false,
      prefrouteDeltaY: 0
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      const {trial} = this.state;
      const dep = this.props.asel?.window === 'dep';
      this.setState({
        dep: dep,
        route: this.props.data?.[dep ? 'route' : 'remaining_route'] || '',
        trial: !dep && trial,
        append_star: false,
        append_oplus: false,
        focused: false,
        prefrouteDeltaY: 0
      });
    }
  }

  clearedToFix = (fix) => {
    const {trial} = this.state;
    const {data} = this.props;
    let {route: new_route, route_data} = data;
    let route_fixes = route_data.map(e => e.fix);
    const index = route_fixes.indexOf(fix);
    for (let f of route_fixes.slice(0, index + 1).reverse()) {
      if (new_route.includes(f)) {
        new_route = new_route.slice(new_route.indexOf(f) + f.length);
        break;
      }
    }
    new_route = `..${fix}` + new_route;
    const plan_data = {route: new_route, route_data: route_data.slice(index)};
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
      prefroute_eligible_only,
      append_star,
      append_oplus,
      prefrouteDeltaY
    } = this.state;
    const {pos, data} = this.props;
    const remaining_route = data?.remaining_route !== undefined ? data?.remaining_route : data?.route;
    const route_data = (dep || data?.remaining_route_data === undefined) ? data?.route_data : data?.remaining_route_data;

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
              <div className="route-input">
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
              ./{!dep ? remaining_route : data?.route}.{data?.dest}
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
          {(data?.routes?.length > 0) && <div>
            <div className="options-row route-row bottom-border"/>
            <div className="options-row route-row underline">
              Apply ATC Preferred Route
            </div>
            <div className="options-row route-row"
              // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
            >
              <div className="options-col prefroute-col"
                // onMouseDown={() => this.props.openMenu(this.routeMenuRef.current, 'alt-menu', false)}
              >
                <div className="prefroute-button">
                  <button className={prefroute_eligible_only ? 'selected' : ''}
                          onMouseDown={() => this.setState({prefroute_eligible_only: true})}
                  >
                    ELIGIBLE
                  </button>
                </div>
                <div className="prefroute-button">
                  <button className={!prefroute_eligible_only ? 'selected' : ''}
                          onMouseDown={() => this.setState({prefroute_eligible_only: false})}
                  >
                    ALL
                  </button>
                </div>
              </div>
            </div>
            <div className="prefroute-container"
                 onWheel={(e) => this.setState({prefrouteDeltaY: Math.max(Math.min(((prefrouteDeltaY + e.deltaY) / 100 | 0), data?.routes?.length), 0)})}>
              {data?.routes.slice(prefrouteDeltaY, prefrouteDeltaY + 5).map(r => {
                if (!dep) {
                  let route_str = r.route?.slice() || '';
                  r.route = null;
                  for (let e of route_data) {
                    if (route_str.includes(e.fix)) {
                      r.route = '..' + route_str.slice(route_str.indexOf(e.fix));
                      break;
                    }
                  }
                }
                return r.route && (<div className="options-row prefroute-row">
                  <div className="options-col prefroute-col hover"
                       onMouseDown={() => this.clearedReroute(r)}
                  >
                    {r.route}.{data?.dest}
                  </div>
                </div>)
              })}
            </div>
          </div>}
          <div className="options-row bottom">
            <div className="options-col left">
              <button>
                Flight Data
              </button>
              <button disabled={true}>
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
