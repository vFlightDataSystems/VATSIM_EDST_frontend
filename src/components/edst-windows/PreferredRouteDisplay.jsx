import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class PreferredRouteDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prefroute_eligible_only: false,
      prefrouteDeltaY: 0
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        focused: false,
        prefrouteDeltaY: 0
      });
    }
  }

  render() {
    const {
      prefroute_eligible_only,
      prefrouteDeltaY
    } = this.state;
    const {routes} = this.props;

    return (<div>
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
             onWheel={(e) => this.setState({prefrouteDeltaY: Math.max(Math.min(((prefrouteDeltaY + e.deltaY) / 100 | 0), routes.length-5), 0)})}>
          {Object.entries(routes.slice(prefrouteDeltaY, prefrouteDeltaY + 5) || {}).map(([i, r]) => {
            return (!prefroute_eligible_only || r.eligible) && (<div className="options-row prefroute-row" key={`route-menu-prefroute-row-${i}`}>
              <div className="options-col prefroute-col hover"
                   onMouseDown={() => this.props.clearedReroute(r)}
              >
                {r.route || r.aar_amendment_route_string}{r.dest}
              </div>
            </div>)
          })}
        </div>
      </div>
    );
  }
}
