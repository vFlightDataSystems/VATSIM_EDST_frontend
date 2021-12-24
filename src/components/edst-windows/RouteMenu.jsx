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
      prefroute_eligible_only: true,
      append_star: false,
      append_oplus: false,
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
    const {
      focused, 
      trial, 
      route, 
      dep, 
      prefroute_eligible_only, 
      append_star, 
      append_oplus
    } = this.state;
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
              ./{route}{data.dest}
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
