import React from 'react';
import '../../css/header-styles.scss';
import '../../css/windows/options-menu-styles.scss';

export default class PreviousRouteMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
    };
    this.routeMenuRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.data !== prevProps.data) {
      this.setState({
        focused: false
      });
    }
  }

  render() {
    const {focused} = this.state;
    const {pos, data} = this.props;

    return (<div
        onMouseEnter={() => this.setState({focused: true})}
        onMouseLeave={() => this.setState({focused: false})}
        className="options-menu prev-route no-select"
        id="route-menu"
        style={{left: pos.x, top: pos.y}}
      >
        <div className={`options-menu-header ${focused ? 'focused' : ''}`}
             onMouseDown={(event) => this.props.startDrag(event, this.routeMenuRef)}
             onMouseUp={(event) => this.props.stopDrag(event)}
        >
          Previous Route Menu
        </div>
        <div className="options-body">
          <div className="options-row fid">
            {data?.callsign} {data?.type}/{data?.equipment}
          </div>
          <div className="options-row prev-route-row">
            <div className="options-col">
              RTE {data?.previous_route}.{data?.dest}
            </div>
          </div>
          <div className="options-row bottom">
            <div className="options-col left">
              <button
                onMouseDown={() => {
                  this.props.amendEntry(data?.cid, {
                    route: data?.previous_route,
                    route_data: data?.previous_route_data
                  });
                  this.props.closeWindow();
                }}
              >
                Apply Previous Route
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
