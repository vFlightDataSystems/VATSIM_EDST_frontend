import React from 'react';
import '../../css/header-button-styles.scss';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class RouteMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dep: this.props.asel?.window === 'dep',
      trial: this.props.asel?.window !== 'dep',
      route: this.props.data?.route,
      focused: false,
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.asel !== prevProps.asel) {
      const {trial} = this.state;
      this.setState({
        dep: this.props.asel?.window === 'dep',
        route: this.props.data?.route,
        trial: this.props.asel.window !== 'dep' && trial
      });
    }
  }

  render() {
    const {focused, trial, route, dep} = this.state;
    const {pos, data} = this.props;

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
                <div className="ppos" disabled={true}>
                  BOS100030..
                </div>
                <input value={data.dest} onChange={(e) => this.setState({route: e.target.value})}/>
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
                 onMouseDown={() => {}}
            >
              <button className="tiny" disabled={true}/>
              Append *
            </div>
            <div className="options-col hover button"
                 onMouseDown={() => {}}
            >
              <button className="tiny selected" disabled={true}/>
              Append<span>&nbsp;⊕</span>
            </div>
          </div>
          <div className="options-row route-row underline">
            Direct-To-Fix
          </div>
          <div className="options-row">
            <div className="options-col display">
              ./{route}${data.dest}
            </div>
          </div>
          <div className="options-row route-row bottom-border">

          </div>
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
                <button className="">
                  ELIGIBLE
                </button>
              </div>
              <div className="prefroute-button">
                <button className="selected">
                  ALL
                </button>
              </div>
            </div>
          </div>
          <div className="options-row bottom">
            <div className="options-col left">
              <button onMouseDown={() => this.props.plan({route: route})}>
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